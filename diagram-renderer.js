/**
 * Diagram Renderer
 *
 * Renders entity relationship diagrams on HTML5 Canvas
 * FIXED: Proper coordinate handling for drag & drop
 */

class DiagramRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.entities = [];
        this.relationships = [];

        // Rendering state
        this.zoom = 1.0;
        this.panX = 50;  // Start with some padding
        this.panY = 50;
        this.isDragging = false;
        this.isPanning = false;
        this.dragEntity = null;
        this.dragOffset = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };

        // Entity layout
        this.entityPositions = new Map();
        this.entityWidth = 250;
        this.entityHeaderHeight = 50;
        this.entityFieldHeight = 30;
        this.entityPadding = 60;

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
        // Set canvas size correctly
        this.resizeCanvas();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.render();
        });
    }

    resizeCanvas() {
        // Get the CSS size
        const rect = this.canvas.getBoundingClientRect();

        // Set canvas size (accounting for device pixel ratio for crisp rendering)
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Scale context to match
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        this.ctx.scale(dpr, dpr);

        // Store display dimensions
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
    }

    setupEventListeners() {
        let isMouseDown = false;

        // Mouse down - start drag or pan
        this.canvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            const worldPos = this.screenToWorld(e.clientX, e.clientY);

            // Check if clicking on entity
            const clickedEntity = this.getEntityAtPoint(worldPos.x, worldPos.y);

            if (clickedEntity) {
                // Start entity drag
                this.isDragging = true;
                this.isPanning = false;
                this.dragEntity = clickedEntity;
                const pos = this.entityPositions.get(clickedEntity.name);
                this.dragOffset = {
                    x: worldPos.x - pos.x,
                    y: worldPos.y - pos.y
                };
                this.canvas.style.cursor = 'move';
            } else if (this.entities.length > 0) {
                // Start canvas pan (only if there are entities to pan)
                this.isPanning = true;
                this.isDragging = false;
                this.dragEntity = null;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.canvas.style.cursor = 'grabbing';
            }
        });

        // Mouse move - drag entity or pan canvas
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isMouseDown) {
                // Update cursor on hover only if there are entities
                if (this.entities.length > 0) {
                    const worldPos = this.screenToWorld(e.clientX, e.clientY);
                    const hoveredEntity = this.getEntityAtPoint(worldPos.x, worldPos.y);
                    this.canvas.style.cursor = hoveredEntity ? 'pointer' : 'default';
                } else {
                    this.canvas.style.cursor = 'default';
                }
                return;
            }

            if (this.isDragging && this.dragEntity) {
                // Drag entity
                const worldPos = this.screenToWorld(e.clientX, e.clientY);
                this.entityPositions.set(this.dragEntity.name, {
                    x: worldPos.x - this.dragOffset.x,
                    y: worldPos.y - this.dragOffset.y
                });
                this.render();
            } else if (this.isPanning) {
                // Pan canvas
                const dx = e.clientX - this.lastMousePos.x;
                const dy = e.clientY - this.lastMousePos.y;
                this.panX += dx;
                this.panY += dy;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.render();
            }
        });

        // Mouse up - stop drag/pan
        const stopDragging = (e) => {
            isMouseDown = false;
            this.isDragging = false;
            this.isPanning = false;
            this.dragEntity = null;

            // Reset cursor based on hover state
            if (this.entities.length > 0 && e) {
                const worldPos = this.screenToWorld(e.clientX, e.clientY);
                const hoveredEntity = this.getEntityAtPoint(worldPos.x, worldPos.y);
                this.canvas.style.cursor = hoveredEntity ? 'pointer' : 'default';
            } else {
                this.canvas.style.cursor = 'default';
            }
        };

        this.canvas.addEventListener('mouseup', stopDragging);
        this.canvas.addEventListener('mouseleave', stopDragging);

        // Mouse wheel - zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Zoom factor
            const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.max(0.1, Math.min(3.0, this.zoom * zoomDelta));

            // Zoom towards mouse position
            const zoomChange = newZoom / this.zoom;
            this.panX = mouseX - (mouseX - this.panX) * zoomChange;
            this.panY = mouseY - (mouseY - this.panY) * zoomChange;

            this.zoom = newZoom;
            this.render();
        });
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (screenX - rect.left - this.panX) / this.zoom;
        const y = (screenY - rect.top - this.panY) / this.zoom;
        return { x, y };
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX, worldY) {
        const x = worldX * this.zoom + this.panX;
        const y = worldY * this.zoom + this.panY;
        return { x, y };
    }

    getEntityAtPoint(x, y) {
        // Iterate in reverse order (top entities first)
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
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
        const width = this.displayWidth;
        const height = this.displayHeight;

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
        if (field.isUnique) fieldText += ' ✦';

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
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;

        const newZoom = Math.min(3.0, this.zoom * 1.2);
        const zoomChange = newZoom / this.zoom;

        this.panX = centerX - (centerX - this.panX) * zoomChange;
        this.panY = centerY - (centerY - this.panY) * zoomChange;
        this.zoom = newZoom;

        this.render();
    }

    zoomOut() {
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;

        const newZoom = Math.max(0.1, this.zoom / 1.2);
        const zoomChange = newZoom / this.zoom;

        this.panX = centerX - (centerX - this.panX) * zoomChange;
        this.panY = centerY - (centerY - this.panY) * zoomChange;
        this.zoom = newZoom;

        this.render();
    }

    fitToScreen() {
        if (this.entities.length === 0) return;

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

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const padding = 100;

        // Calculate zoom to fit
        const zoomX = (this.displayWidth - padding) / contentWidth;
        const zoomY = (this.displayHeight - padding) / contentHeight;
        this.zoom = Math.min(zoomX, zoomY, 1.0);

        // Center the diagram
        this.panX = (this.displayWidth - contentWidth * this.zoom) / 2 - minX * this.zoom;
        this.panY = (this.displayHeight - contentHeight * this.zoom) / 2 - minY * this.zoom;

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
