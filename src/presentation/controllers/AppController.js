/**
 * Presentation Controller: AppController
 *
 * Coordinates UI interactions with application services
 */
export class AppController {
    constructor(diagramService, editorFactory) {
        this.diagramService = diagramService;
        this.editorFactory = editorFactory;
        this.editor = null;
    }

    async initialize() {
        await this._initializeEditor();
        this._setupEventListeners();
        this._initializeLucideIcons();
        await this._onDSLChange();
    }

    async _initializeEditor() {
        const defaultDSL = this._getDefaultDSL();
        this.editor = await this.editorFactory.createEditor(defaultDSL);

        this.editor.onDidChangeModelContent(() => {
            this._onDSLChange();
        });
    }

    _setupEventListeners() {
        // Toolbar buttons
        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.diagramService.zoomIn();
            this._updateZoomLevel();
        });

        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.diagramService.zoomOut();
            this._updateZoomLevel();
        });

        document.getElementById('fitBtn').addEventListener('click', () => {
            this.diagramService.fitToScreen();
            this._updateZoomLevel();
        });

        document.getElementById('autoLayoutBtn').addEventListener('click', () => {
            this.diagramService.autoLayout();
        });

        // Editor buttons
        document.getElementById('formatBtn').addEventListener('click', () => {
            this._formatDSL();
        });

        document.getElementById('validateBtn').addEventListener('click', () => {
            this._validateDSL();
        });

        // Header buttons
        document.getElementById('exportBtn').addEventListener('click', () => {
            this._exportCode();
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this._saveDSL();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('Reset to default DSL? This will clear your current work.')) {
                this.editor.setValue(this._getDefaultDSL());
            }
        });

        // Resize handle
        this._setupResizeHandle();
    }

    _setupResizeHandle() {
        const resizeHandle = document.getElementById('resizeHandle');
        const canvasArea = document.querySelector('.canvas-area');
        const editorArea = document.querySelector('.editor-area');

        let isResizing = false;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'ew-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const containerWidth = document.querySelector('.main-content').clientWidth;
            const editorWidth = containerWidth - e.clientX;
            const canvasWidth = e.clientX;

            const editorPercent = (editorWidth / containerWidth) * 100;
            const canvasPercent = (canvasWidth / containerWidth) * 100;

            if (editorPercent >= 15 && editorPercent <= 50) {
                canvasArea.style.flex = `0 0 ${canvasPercent}%`;
                editorArea.style.flex = `0 0 ${editorPercent}%`;
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.body.style.cursor = 'default';
        });
    }

    async _onDSLChange() {
        const dsl = this.editor.getValue();
        const result = await this.diagramService.parseDSL(dsl);

        this.diagramService.renderDiagram();
        this._updateStatus(result);
        this._updateInfo(result);
        this._updateZoomLevel();
    }

    _updateStatus(result) {
        const statusIndicator = document.getElementById('statusIndicator');
        const errorMessage = document.getElementById('errorMessage');

        if (result.isValid) {
            statusIndicator.className = 'status-ok';
            statusIndicator.innerHTML = '<i data-lucide="check-circle"></i> Valid';
            errorMessage.textContent = '';
        } else {
            statusIndicator.className = 'status-error';
            statusIndicator.innerHTML = '<i data-lucide="alert-circle"></i> Error';
            errorMessage.textContent = result.errors.map(e => e.message).join(', ');
        }

        this._initializeLucideIcons();
    }

    _updateInfo(result) {
        document.getElementById('entityCount').textContent =
            `${result.entities.length} ${result.entities.length === 1 ? 'entity' : 'entities'}`;
        document.getElementById('relationCount').textContent =
            `${result.relationships.length} ${result.relationships.length === 1 ? 'relation' : 'relations'}`;
    }

    _updateZoomLevel() {
        const zoomLevel = this.diagramService.getZoomLevel();
        document.getElementById('zoomLevel').textContent = `${zoomLevel}%`;
    }

    _formatDSL() {
        const dsl = this.editor.getValue();
        const lines = dsl.split('\n');
        let formatted = [];
        let indent = 0;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                formatted.push('');
                continue;
            }

            if (trimmed.includes('}')) indent--;
            formatted.push('  '.repeat(Math.max(0, indent)) + trimmed);
            if (trimmed.includes('{')) indent++;
        }

        this.editor.setValue(formatted.join('\n'));
    }

    async _validateDSL() {
        const dsl = this.editor.getValue();
        const result = await this.diagramService.parseDSL(dsl);

        if (result.isValid) {
            alert('✓ DSL is valid!');
        } else {
            alert('✗ DSL has errors:\n\n' + result.errors.map(e => `Line ${e.line}: ${e.message}`).join('\n'));
        }
    }

    _saveDSL() {
        const dsl = this.editor.getValue();
        const blob = new Blob([dsl], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schema.dsl';
        a.click();
        URL.revokeObjectURL(url);
    }

    _exportCode() {
        const format = prompt(
            'Export format:\n' +
            '1 - DSL (current format)\n' +
            '2 - JSON Schema\n' +
            '3 - SQL DDL\n' +
            '4 - TypeScript Interfaces\n\n' +
            'Enter number (1-4):',
            '1'
        );

        if (!format) return;

        let exportContent = '';
        let fileExtension = 'txt';

        try {
            switch (format) {
                case '1':
                    exportContent = this.editor.getValue();
                    fileExtension = 'dsl';
                    break;
                case '2':
                    exportContent = this.diagramService.exportCode('json');
                    fileExtension = 'json';
                    break;
                case '3':
                    exportContent = this.diagramService.exportCode('sql');
                    fileExtension = 'sql';
                    break;
                case '4':
                    exportContent = this.diagramService.exportCode('typescript');
                    fileExtension = 'ts';
                    break;
                default:
                    alert('Invalid format');
                    return;
            }

            const blob = new Blob([exportContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `export.${fileExtension}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            alert(`Export error: ${error.message}`);
        }
    }

    _initializeLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    _getDefaultDSL() {
        return `// User entity with various field types and constraints
user [icon:user, color: #60a5fa] {
    id string @pk
    email string @unique
    first_name string
    last_name string @required
    phone string
    photo string
    birthdate string
    is_active bool @default(true)
    gender string @enum(fields: [male, female, other])
    created_at timestamp @default(now())
}

// Tweet entity with foreign key relationship
tweet [icon:message-circle, color:#fbbf24] {
    id string @pk
    content string @required
    created_at timestamp @default(now())
    user_id string @fk
}

// Define relationship
user_id -> user.id`;
    }
}
