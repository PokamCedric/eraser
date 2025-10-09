/**
 * DSL Parser for Entity Relationship Diagrams
 *
 * Parses custom DSL syntax into structured entity and relationship data
 */

class DSLParser {
    constructor() {
        this.entities = [];
        this.relationships = [];
        this.errors = [];
    }

    /**
     * Parse DSL string into entities and relationships
     * @param {string} dsl - DSL text to parse
     * @returns {Object} { entities, relationships, errors }
     */
    parse(dsl) {
        this.entities = [];
        this.relationships = [];
        this.errors = [];

        try {
            // Remove comments and split into lines
            const lines = dsl
                .split('\n')
                .map(line => {
                    // Remove single-line comments
                    const commentIndex = line.indexOf('//');
                    return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
                })
                .map(line => line.trim())
                .filter(line => line.length > 0);

            let currentEntity = null;
            let braceCount = 0;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Parse entity declaration: user [icon:user, color: lightblue] {
                if (line.includes('{') && !line.startsWith('}')) {
                    const entityMatch = line.match(/^(\w+)\s*(\[([^\]]+)\])?\s*\{/);
                    if (entityMatch) {
                        const entityName = entityMatch[1];
                        const metadataStr = entityMatch[3] || '';
                        const metadata = this.parseMetadata(metadataStr);

                        currentEntity = {
                            name: entityName,
                            displayName: this.toDisplayName(entityName),
                            icon: metadata.icon || 'box',
                            color: metadata.color || '#3b82f6',
                            fields: []
                        };
                        braceCount++;
                    }
                }
                // Parse entity closing brace
                else if (line.startsWith('}')) {
                    if (currentEntity) {
                        this.entities.push(currentEntity);
                        currentEntity = null;
                    }
                    braceCount--;
                }
                // Parse field: email string @unique
                else if (currentEntity && !line.includes('->')) {
                    const field = this.parseField(line);
                    if (field) {
                        currentEntity.fields.push(field);
                    }
                }
                // Parse relationship: user_id -> user.id
                else if (line.includes('->')) {
                    const relationship = this.parseRelationship(line);
                    if (relationship) {
                        this.relationships.push(relationship);
                    }
                }
            }

        } catch (error) {
            this.errors.push({
                message: error.message,
                line: 0
            });
        }

        return {
            entities: this.entities,
            relationships: this.relationships,
            errors: this.errors,
            isValid: this.errors.length === 0
        };
    }

    /**
     * Parse metadata like [icon:user, color: lightblue]
     * @param {string} metadataStr - Metadata string
     * @returns {Object} Metadata object
     */
    parseMetadata(metadataStr) {
        const metadata = {};
        if (!metadataStr) return metadata;

        const pairs = metadataStr.split(',');
        for (const pair of pairs) {
            const [key, value] = pair.split(':').map(s => s.trim());
            if (key && value) {
                metadata[key] = value;
            }
        }

        return metadata;
    }

    /**
     * Parse field line: email string @unique @required
     * @param {string} line - Field line
     * @returns {Object} Field object
     */
    parseField(line) {
        // Match: name type @decorator1 @decorator2(args)
        const match = line.match(/^(\w+)\s+(\w+)(.*)$/);
        if (!match) return null;

        const fieldName = match[1];
        const fieldType = match[2];
        const decoratorsStr = match[3] || '';

        const decorators = this.parseDecorators(decoratorsStr);

        // Determine if field is primary key
        const isPrimaryKey = decorators.some(d => d.name === 'pk');
        const isForeignKey = decorators.some(d => d.name === 'fk');
        const isUnique = decorators.some(d => d.name === 'unique');
        const isRequired = decorators.some(d => d.name === 'required') || isPrimaryKey;

        // Get default value
        const defaultDecorator = decorators.find(d => d.name === 'default');
        const defaultValue = defaultDecorator ? defaultDecorator.args : null;

        // Get enum values
        const enumDecorator = decorators.find(d => d.name === 'enum');
        const enumValues = enumDecorator && enumDecorator.params && enumDecorator.params.fields
            ? enumDecorator.params.fields
            : null;

        return {
            name: fieldName,
            displayName: this.toDisplayName(fieldName),
            type: fieldType,
            isPrimaryKey,
            isForeignKey,
            isUnique,
            isRequired,
            defaultValue,
            enumValues,
            decorators
        };
    }

    /**
     * Parse decorators like @pk @unique @enum(fields: [male, female])
     * @param {string} decoratorsStr - Decorators string
     * @returns {Array} Array of decorator objects
     */
    parseDecorators(decoratorsStr) {
        const decorators = [];
        if (!decoratorsStr) return decorators;

        // Match @decorator or @decorator(args)
        const regex = /@(\w+)(?:\(([^)]+)\))?/g;
        let match;

        while ((match = regex.exec(decoratorsStr)) !== null) {
            const name = match[1];
            const argsStr = match[2];

            let args = null;
            let params = {};

            if (argsStr) {
                // Try to parse as key:value pairs
                if (argsStr.includes(':')) {
                    const pairs = argsStr.split(',');
                    for (const pair of pairs) {
                        const [key, value] = pair.split(':').map(s => s.trim());
                        if (key && value) {
                            // Parse arrays like [male, female]
                            if (value.startsWith('[') && value.endsWith(']')) {
                                params[key] = value
                                    .substring(1, value.length - 1)
                                    .split(',')
                                    .map(v => v.trim());
                            } else {
                                params[key] = value;
                            }
                        }
                    }
                } else {
                    // Simple value
                    args = argsStr.trim();
                }
            }

            decorators.push({ name, args, params });
        }

        return decorators;
    }

    /**
     * Parse relationship like: user_id -> user.id
     * @param {string} line - Relationship line
     * @returns {Object} Relationship object
     */
    parseRelationship(line) {
        const match = line.match(/^(\w+)\.?(\w+)?\s*->\s*(\w+)\.(\w+)$/);
        if (!match) return null;

        const fromEntity = match[1];
        const fromField = match[2] || match[1]; // If no field, use entity name
        const toEntity = match[3];
        const toField = match[4];

        // Infer relationship type (for now, assume many-to-one)
        const type = 'many-to-one'; // Default

        return {
            from: {
                entity: fromEntity,
                field: fromField
            },
            to: {
                entity: toEntity,
                field: toField
            },
            type
        };
    }

    /**
     * Convert snake_case to Display Name
     * @param {string} name - Snake case name
     * @returns {string} Display name
     */
    toDisplayName(name) {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get type icon for field type
     * @param {string} type - Field type
     * @returns {string} Icon name
     */
    getTypeIcon(type) {
        const typeIcons = {
            'string': 'type',
            'int': 'hash',
            'integer': 'hash',
            'num': 'hash',
            'double': 'hash',
            'float': 'hash',
            'bool': 'check-square',
            'boolean': 'check-square',
            'timestamp': 'clock',
            'datetime': 'calendar',
            'date': 'calendar'
        };

        return typeIcons[type.toLowerCase()] || 'circle';
    }

    /**
     * Validate DSL and return errors
     * @param {string} dsl - DSL text
     * @returns {Array} Array of error objects
     */
    validate(dsl) {
        this.parse(dsl);
        return this.errors;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DSLParser;
}
