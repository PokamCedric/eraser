/**
 * ERP Visual Designer - Main Application
 *
 * Real-time Entity Relationship Diagram Generator
 */

// Default DSL example
const DEFAULT_DSL = `// User entity with various field types and constraints
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

class App {
    constructor() {
        this.parser = new DSLParser();
        this.renderer = null;
        this.editor = null;

        this.init();
    }

    async init() {
        // Initialize Monaco Editor
        await this.initEditor();

        // Initialize Canvas Renderer
        this.initRenderer();

        // Setup event listeners
        this.setupEventListeners();

        // Initialize Lucide icons
        lucide.createIcons();

        // Parse and render initial DSL
        this.onDSLChange();
    }

    async initEditor() {
        return new Promise((resolve) => {
            require.config({
                paths: {
                    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs'
                }
            });

            require(['vs/editor/editor.main'], () => {
                // Register custom language for DSL
                monaco.languages.register({ id: 'dsl' });

                // Define syntax highlighting
                monaco.languages.setMonarchTokensProvider('dsl', {
                    tokenizer: {
                        root: [
                            [/\/\/.*$/, 'comment'],
                            [/@\w+/, 'decorator'],
                            [/\b(string|int|bool|timestamp|datetime|num|double)\b/, 'type'],
                            [/\b(true|false|now)\b/, 'keyword'],
                            [/\[([^\]]+)\]/, 'metadata'],
                            [/\{|\}/, 'delimiter.bracket'],
                            [/->/, 'operator'],
                        ]
                    }
                });

                // Define theme
                monaco.editor.defineTheme('dsl-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'comment', foreground: '6A9955' },
                        { token: 'decorator', foreground: 'DCDCAA', fontStyle: 'bold' },
                        { token: 'type', foreground: '4EC9B0' },
                        { token: 'keyword', foreground: 'C586C0' },
                        { token: 'metadata', foreground: '9CDCFE' },
                        { token: 'operator', foreground: 'D4D4D4' },
                    ],
                    colors: {
                        'editor.background': '#0f172a',
                        'editor.lineHighlightBackground': '#1e293b',
                    }
                });

                // Create editor
                this.editor = monaco.editor.create(document.getElementById('dslEditor'), {
                    value: DEFAULT_DSL,
                    language: 'dsl',
                    theme: 'dsl-dark',
                    automaticLayout: true,
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    folding: true,
                    wordWrap: 'on',
                });

                // Listen for changes
                this.editor.onDidChangeModelContent(() => {
                    this.onDSLChange();
                });

                resolve();
            });
        });
    }

    initRenderer() {
        const canvas = document.getElementById('diagramCanvas');
        this.renderer = new DiagramRenderer(canvas);
    }

    setupEventListeners() {
        // Toolbar buttons
        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.renderer.zoomIn();
            this.updateZoomLevel();
        });

        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.renderer.zoomOut();
            this.updateZoomLevel();
        });

        document.getElementById('fitBtn').addEventListener('click', () => {
            this.renderer.fitToScreen();
            this.updateZoomLevel();
        });

        document.getElementById('autoLayoutBtn').addEventListener('click', () => {
            this.renderer.autoLayout();
        });

        // Editor buttons
        document.getElementById('formatBtn').addEventListener('click', () => {
            this.formatDSL();
        });

        document.getElementById('validateBtn').addEventListener('click', () => {
            this.validateDSL();
        });

        // Header buttons
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportCode();
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveDSL();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('Reset to default DSL? This will clear your current work.')) {
                this.editor.setValue(DEFAULT_DSL);
            }
        });

        // Resize handle
        this.setupResizeHandle();
    }

    setupResizeHandle() {
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

    onDSLChange() {
        const dsl = this.editor.getValue();
        const result = this.parser.parse(dsl);

        // Update renderer
        this.renderer.setData(result.entities, result.relationships);

        // Update status
        this.updateStatus(result);

        // Update info
        this.updateInfo(result);

        // Update zoom level
        this.updateZoomLevel();
    }

    updateStatus(result) {
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

        // Re-initialize icons
        lucide.createIcons();
    }

    updateInfo(result) {
        document.getElementById('entityCount').textContent =
            `${result.entities.length} ${result.entities.length === 1 ? 'entity' : 'entities'}`;
        document.getElementById('relationCount').textContent =
            `${result.relationships.length} ${result.relationships.length === 1 ? 'relation' : 'relations'}`;
    }

    updateZoomLevel() {
        const zoomLevel = this.renderer.getZoomLevel();
        document.getElementById('zoomLevel').textContent = `${zoomLevel}%`;
    }

    formatDSL() {
        // Simple formatting (can be enhanced)
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

    validateDSL() {
        const dsl = this.editor.getValue();
        const errors = this.parser.validate(dsl);

        if (errors.length === 0) {
            alert('✓ DSL is valid!');
        } else {
            alert('✗ DSL has errors:\n\n' + errors.map(e => `Line ${e.line}: ${e.message}`).join('\n'));
        }
    }

    saveDSL() {
        const dsl = this.editor.getValue();
        const blob = new Blob([dsl], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schema.dsl';
        a.click();
        URL.revokeObjectURL(url);
    }

    exportCode() {
        const dsl = this.editor.getValue();

        // Show export options
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
        const result = this.parser.parse(dsl);

        switch (format) {
            case '1':
                exportContent = dsl;
                break;
            case '2':
                exportContent = JSON.stringify(result, null, 2);
                break;
            case '3':
                exportContent = this.generateSQL(result);
                break;
            case '4':
                exportContent = this.generateTypeScript(result);
                break;
            default:
                alert('Invalid format');
                return;
        }

        // Download
        const blob = new Blob([exportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export.${format === '2' ? 'json' : format === '3' ? 'sql' : format === '4' ? 'ts' : 'dsl'}`;
        a.click();
        URL.revokeObjectURL(url);
    }

    generateSQL(result) {
        let sql = '-- Generated SQL DDL\n\n';

        for (const entity of result.entities) {
            sql += `CREATE TABLE ${entity.name} (\n`;

            const fields = entity.fields.map(field => {
                let line = `  ${field.name} `;

                // Type mapping
                const typeMap = {
                    'string': 'VARCHAR(255)',
                    'int': 'INTEGER',
                    'bool': 'BOOLEAN',
                    'timestamp': 'TIMESTAMP',
                    'datetime': 'DATETIME'
                };
                line += typeMap[field.type] || 'TEXT';

                if (field.isPrimaryKey) line += ' PRIMARY KEY';
                if (field.isRequired && !field.isPrimaryKey) line += ' NOT NULL';
                if (field.isUnique) line += ' UNIQUE';
                if (field.defaultValue) line += ` DEFAULT ${field.defaultValue}`;

                return line;
            });

            sql += fields.join(',\n') + '\n);\n\n';
        }

        return sql;
    }

    generateTypeScript(result) {
        let ts = '// Generated TypeScript Interfaces\n\n';

        for (const entity of result.entities) {
            ts += `export interface ${entity.displayName.replace(/\s+/g, '')} {\n`;

            for (const field of entity.fields) {
                const optional = !field.isRequired ? '?' : '';
                const typeMap = {
                    'string': 'string',
                    'int': 'number',
                    'bool': 'boolean',
                    'timestamp': 'Date',
                    'datetime': 'Date'
                };
                const type = typeMap[field.type] || 'any';

                ts += `  ${field.name}${optional}: ${type};\n`;
            }

            ts += '}\n\n';
        }

        return ts;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
