/**
 * Diagram Renderer
 *
 * Renders entity relationship diagrams on HTML5 Canvas
 */

class DiagramRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.entities = [];
        this.relationships = [];

        // Rendering state
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.dragEntity = null;
        this.dragOffset = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };

        // Entity layout
        this.entityPositions = new Map();
        this.entityWidth = 250;
        this.entityHeaderHeight = 50;
        this.entityFieldHeight = 30;
        this.entityPadding = 40;

        // Colors
        this.colors = {
            background: '#ffffff',
            gridLine: 'rgba(0,0,0,0.05)',
            entityBorder: '#e2e8f0',
            entityShadow: 'rgba(0,0,0,0.1)',
            fieldText: '#475569',
            relationLine: '#3b82f6',
            primaryKeyBg: '#dbeafe',
            foreignKeyBg: '#fef3c7'
        };

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        // Set canvas size
        this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
            this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            this.render();
        });
    }

    setupEventListeners() {
        // Mouse down - start drag
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.panX) / this.zoom;
            const y = (e.clientY - rect.top - this.panY) / this.zoom;

            // Check if clicking on entity
            const clickedEntity = this.getEntityAtPoint(x, y);

            if (clickedEntity) {
                this.isDragging = true;
                this.dragEntity = clickedEntity;
                const pos = this.entityPositions.get(clickedEntity.name);
                this.dragOffset = {
                    x: x - pos.x,
                    y: y - pos.y
                };
            } else {
                // Pan canvas
                this.isDragging = true;
                this.dragEntity = null;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
            }
        });

        // Mouse move - drag entity or pan
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();

                if (this.dragEntity) {
                    // Drag entity
                    const x = (e.clientX - rect.left - this.panX) / this.zoom;
                    const y = (e.clientY - rect.top - this.panY) / this.zoom;

                    this.entityPositions.set(this.dragEntity.name, {
                        x: x - this.dragOffset.x,
                        y: y - this.dragOffset.y
                    });
                } else {
                    // Pan canvas
                    const dx = e.clientX - this.lastMousePos.x;
                    const dy = e.clientY - this.lastMousePos.y;
                    this.panX += dx;
                    this.panY += dy;
                    this.lastMousePos = { x: e.clientX, y: e.clientY };
                }

                this.render();
            }
        });

        // Mouse up - stop drag
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.dragEntity = null;
        });

        // Mouse wheel - zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Zoom in/out
            const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.max(0.1, Math.min(3.0, this.zoom * zoomDelta));

            // Adjust pan to zoom towards mouse
            const zoomChange = newZoom / this.zoom;
            this.panX = mouseX - (mouseX - this.panX) * zoomChange;
            this.panY = mouseY - (mouseY - this.panY) * zoomChange;

            this.zoom = newZoom;
            this.render();
        });
    }

    getEntityAtPoint(x, y) {
        for (const entity of this.entities) {
            const pos = this.entityPositions.get(entity.name);
            if (!pos) continue;

            const width = this.entityWidth;
            const height = this.entityHeaderHeight + (entity.fields.length * this.entityFieldHeight);

            if (x >= pos.x && x <= pos.x + width &&
                y >= pos.y && y <= pos.y + height) {
                return entity;
            }
        }
        return null;
    }

    setData(entities, relationships) {
        this.entities = entities;
        this.relationships = relationships;

        // Initialize positions for new entities
        this.initializePositions();
        this.render();
    }

    initializePositions() {
        // Auto-layout entities in a grid
        const cols = Math.ceil(Math.sqrt(this.entities.length));
        const spacing = this.entityWidth + this.entityPadding * 2;

        this.entities.forEach((entity, index) => {
            if (!this.entityPositions.has(entity.name)) {
                const row = Math.floor(index / cols);
                const col = index % cols;

                this.entityPositions.set(entity.name, {
                    x: col * spacing + this.entityPadding,
                    y: row * (300 + this.entityPadding) + this.entityPadding
                });
            }
        });
    }

    render() {
        const ctx = this.ctx;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Save context
        ctx.save();

        // Apply zoom and pan
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.zoom, this.zoom);

        // Draw relationships first (below entities)
        this.drawRelationships(ctx);

        // Draw entities
        this.drawEntities(ctx);

        // Restore context
        ctx.restore();
    }

    drawEntities(ctx) {
        for (const entity of this.entities) {
            const pos = this.entityPositions.get(entity.name);
            if (!pos) continue;

            this.drawEntity(ctx, entity, pos.x, pos.y);
        }
    }

    drawEntity(ctx, entity, x, y) {
        const width = this.entityWidth;
        const headerHeight = this.entityHeaderHeight;
        const fieldHeight = this.entityFieldHeight;
        const totalHeight = headerHeight + (entity.fields.length * fieldHeight);

        // Shadow
        ctx.shadowColor = this.colors.entityShadow;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        // Entity background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, width, totalHeight);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Entity border
        ctx.strokeStyle = this.colors.entityBorder;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, totalHeight);

        // Header background
        ctx.fillStyle = entity.color || '#3b82f6';
        ctx.fillRect(x, y, width, headerHeight);

        // Entity name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(entity.displayName, x + width / 2, y + headerHeight / 2);

        // Draw fields
        entity.fields.forEach((field, index) => {
            const fieldY = y + headerHeight + (index * fieldHeight);
            this.drawField(ctx, field, x, fieldY, width, fieldHeight);
        });
    }

    drawField(ctx, field, x, y, width, height) {
        // Field background for special fields
        if (field.isPrimaryKey) {
            ctx.fillStyle = this.colors.primaryKeyBg;
            ctx.fillRect(x, y, width, height);
        } else if (field.isForeignKey) {
            ctx.fillStyle = this.colors.foreignKeyBg;
            ctx.fillRect(x, y, width, height);
        }

        // Field border
        ctx.strokeStyle = this.colors.entityBorder;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();

        // Field name
        ctx.fillStyle = this.colors.fieldText;
        ctx.font = '14px -apple-system, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        let fieldText = field.name;
        if (field.isPrimaryKey) fieldText += ' 🔑';
        if (field.isForeignKey) fieldText += ' 🔗';
        if (field.isUnique) fieldText += ' *';

        ctx.fillText(fieldText, x + 10, y + height / 2);

        // Field type
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px -apple-system, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(field.type, x + width - 10, y + height / 2);
    }

    drawRelationships(ctx) {
        for (const rel of this.relationships) {
            this.drawRelationship(ctx, rel);
        }
    }

    drawRelationship(ctx, relationship) {
        const fromEntity = this.entities.find(e => e.name === relationship.from.entity);
        const toEntity = this.entities.find(e => e.name === relationship.to.entity);

        if (!fromEntity || !toEntity) return;

        const fromPos = this.entityPositions.get(fromEntity.name);
        const toPos = this.entityPositions.get(toEntity.name);

        if (!fromPos || !toPos) return;

        // Calculate connection points (center-right and center-left of entities)
        const fromX = fromPos.x + this.entityWidth;
        const fromY = fromPos.y + this.entityHeaderHeight / 2;

        const toX = toPos.x;
        const toY = toPos.y + this.entityHeaderHeight / 2;

        // Draw line with curve
        ctx.strokeStyle = this.colors.relationLine;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);

        // Bezier curve for nice connection
        const midX = (fromX + toX) / 2;
        ctx.bezierCurveTo(
            fromX + 50, fromY,
            midX, fromY,
            midX, (fromY + toY) / 2
        );
        ctx.bezierCurveTo(
            midX, toY,
            toX - 50, toY,
            toX, toY
        );

        ctx.stroke();
        ctx.setLineDash([]);

        // Draw arrow at end
        this.drawArrow(ctx, toX - 15, toY, toX, toY);

        // Draw relationship label
        ctx.fillStyle = this.colors.relationLine;
        ctx.font = 'bold 11px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(relationship.type || '1:N', midX, (fromY + toY) / 2 - 5);
    }

    drawArrow(ctx, fromX, fromY, toX, toY) {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.fillStyle = this.colors.relationLine;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }

    zoomIn() {
        this.zoom = Math.min(3.0, this.zoom * 1.2);
        this.render();
    }

    zoomOut() {
        this.zoom = Math.max(0.1, this.zoom / 1.2);
        this.render();
    }

    fitToScreen() {
        // Calculate bounds of all entities
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const entity of this.entities) {
            const pos = this.entityPositions.get(entity.name);
            if (!pos) continue;

            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x + this.entityWidth);
            maxY = Math.max(maxY, pos.y + this.entityHeaderHeight + (entity.fields.length * this.entityFieldHeight));
        }

        if (!isFinite(minX)) return;

        const width = maxX - minX;
        const height = maxY - minY;

        const canvasWidth = this.canvas.clientWidth;
        const canvasHeight = this.canvas.clientHeight;

        // Calculate zoom to fit
        const zoomX = (canvasWidth - 100) / width;
        const zoomY = (canvasHeight - 100) / height;
        this.zoom = Math.min(zoomX, zoomY, 1.0);

        // Center the diagram
        this.panX = (canvasWidth - width * this.zoom) / 2 - minX * this.zoom;
        this.panY = (canvasHeight - height * this.zoom) / 2 - minY * this.zoom;

        this.render();
    }

    autoLayout() {
        // Simple grid layout
        const cols = Math.ceil(Math.sqrt(this.entities.length));
        const spacing = this.entityWidth + this.entityPadding * 2;

        this.entities.forEach((entity, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;

            this.entityPositions.set(entity.name, {
                x: col * spacing + this.entityPadding,
                y: row * (300 + this.entityPadding) + this.entityPadding
            });
        });

        this.fitToScreen();
    }

    getZoomLevel() {
        return Math.round(this.zoom * 100);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiagramRenderer;
}
