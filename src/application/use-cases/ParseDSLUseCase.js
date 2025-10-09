/**
 * Use Case: Parse DSL
 *
 * Parses DSL text into domain entities and relationships
 */
export class ParseDSLUseCase {
    constructor(diagramRepository) {
        this.diagramRepository = diagramRepository;
    }

    async execute(dslText) {
        if (!dslText || dslText.trim() === '') {
            return {
                entities: [],
                relationships: [],
                errors: [{ message: 'DSL text is empty', line: 0 }],
                isValid: false
            };
        }

        try {
            const result = await this.diagramRepository.parseDSL(dslText);

            // Validate all entities
            const entityErrors = [];
            for (const entity of result.entities) {
                const validation = entity.validate();
                if (!validation.isValid) {
                    entityErrors.push({
                        message: `Entity '${entity.name}': ${validation.error}`,
                        line: 0
                    });
                }
            }

            // Validate all relationships
            const relationErrors = [];
            for (const relationship of result.relationships) {
                const validation = relationship.validate();
                if (!validation.isValid) {
                    relationErrors.push({
                        message: `Relationship: ${validation.error}`,
                        line: 0
                    });
                }
            }

            const allErrors = [...result.errors, ...entityErrors, ...relationErrors];

            return {
                entities: result.entities,
                relationships: result.relationships,
                errors: allErrors,
                isValid: allErrors.length === 0
            };
        } catch (error) {
            return {
                entities: [],
                relationships: [],
                errors: [{ message: error.message, line: 0 }],
                isValid: false
            };
        }
    }
}
