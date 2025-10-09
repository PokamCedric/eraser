/**
 * Repository Interface: IRenderer
 *
 * Defines the contract for diagram rendering
 */
export class IRenderer {
    /**
     * Set data to render
     * @param {Entity[]} entities
     * @param {Relationship[]} relationships
     */
    setData(entities, relationships) {
        throw new Error('Method not implemented');
    }

    /**
     * Render the diagram
     */
    render() {
        throw new Error('Method not implemented');
    }

    /**
     * Zoom in
     */
    zoomIn() {
        throw new Error('Method not implemented');
    }

    /**
     * Zoom out
     */
    zoomOut() {
        throw new Error('Method not implemented');
    }

    /**
     * Fit diagram to screen
     */
    fitToScreen() {
        throw new Error('Method not implemented');
    }

    /**
     * Auto-layout entities
     */
    autoLayout() {
        throw new Error('Method not implemented');
    }

    /**
     * Get current zoom level
     * @returns {number}
     */
    getZoomLevel() {
        throw new Error('Method not implemented');
    }
}
