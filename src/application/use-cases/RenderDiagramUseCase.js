/**
 * Use Case: Render Diagram
 *
 * Renders the diagram using the provided renderer
 */
export class RenderDiagramUseCase {
    constructor(renderer) {
        this.renderer = renderer;
    }

    execute(entities, relationships) {
        if (!entities || !Array.isArray(entities)) {
            throw new Error('Entities must be an array');
        }

        if (!relationships || !Array.isArray(relationships)) {
            throw new Error('Relationships must be an array');
        }

        this.renderer.setData(entities, relationships);
        this.renderer.render();
    }

    zoomIn() {
        this.renderer.zoomIn();
    }

    zoomOut() {
        this.renderer.zoomOut();
    }

    fitToScreen() {
        this.renderer.fitToScreen();
    }

    autoLayout() {
        this.renderer.autoLayout();
    }

    getZoomLevel() {
        return this.renderer.getZoomLevel();
    }
}
