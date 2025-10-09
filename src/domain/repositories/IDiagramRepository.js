/**
 * Repository Interface: IDiagramRepository
 *
 * Defines the contract for diagram data persistence
 */
export class IDiagramRepository {
    /**
     * Parse DSL text and return entities and relationships
     * @param {string} dslText
     * @returns {Promise<{entities: Entity[], relationships: Relationship[], errors: any[]}>}
     */
    async parseDSL(dslText) {
        throw new Error('Method not implemented');
    }

    /**
     * Save diagram data
     * @param {Object} data
     * @returns {Promise<void>}
     */
    async saveDiagram(data) {
        throw new Error('Method not implemented');
    }

    /**
     * Load diagram data
     * @returns {Promise<Object>}
     */
    async loadDiagram() {
        throw new Error('Method not implemented');
    }
}
