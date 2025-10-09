/**
 * Use Case: Export Code
 *
 * Exports entities and relationships to various formats
 */
export class ExportCodeUseCase {
    constructor(exporters) {
        this.exporters = exporters; // Map of format -> exporter
    }

    execute(format, entities, relationships) {
        const exporter = this.exporters[format];

        if (!exporter) {
            throw new Error(`Unsupported export format: ${format}`);
        }

        return exporter.export(entities, relationships);
    }

    getSupportedFormats() {
        return Object.keys(this.exporters);
    }
}
