/**
 * Application Service: DiagramService
 *
 * Orchestrates use cases for diagram operations
 */
export class DiagramService {
    constructor(parseDSLUseCase, renderDiagramUseCase, exportCodeUseCase) {
        this.parseDSLUseCase = parseDSLUseCase;
        this.renderDiagramUseCase = renderDiagramUseCase;
        this.exportCodeUseCase = exportCodeUseCase;

        this.currentEntities = [];
        this.currentRelationships = [];
    }

    async parseDSL(dslText) {
        const result = await this.parseDSLUseCase.execute(dslText);

        if (result.isValid) {
            this.currentEntities = result.entities;
            this.currentRelationships = result.relationships;
        }

        return result;
    }

    renderDiagram() {
        this.renderDiagramUseCase.execute(this.currentEntities, this.currentRelationships);
    }

    zoomIn() {
        this.renderDiagramUseCase.zoomIn();
    }

    zoomOut() {
        this.renderDiagramUseCase.zoomOut();
    }

    fitToScreen() {
        this.renderDiagramUseCase.fitToScreen();
    }

    autoLayout() {
        this.renderDiagramUseCase.autoLayout();
    }

    getZoomLevel() {
        return this.renderDiagramUseCase.getZoomLevel();
    }

    exportCode(format) {
        return this.exportCodeUseCase.execute(format, this.currentEntities, this.currentRelationships);
    }

    getSupportedExportFormats() {
        return this.exportCodeUseCase.getSupportedFormats();
    }

    getCurrentData() {
        return {
            entities: this.currentEntities,
            relationships: this.currentRelationships
        };
    }
}
