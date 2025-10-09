/**
 * Infrastructure Adapter: DSL Parser
 *
 * Adapts the DSL parser to implement IDiagramRepository
 */
import { Entity } from '../../domain/entities/Entity.js';
import { Field } from '../../domain/entities/Field.js';
import { Relationship } from '../../domain/entities/Relationship.js';
import { IDiagramRepository } from '../../domain/repositories/IDiagramRepository.js';

export class DSLParserAdapter extends IDiagramRepository {
    async parseDSL(dslText) {
        const entities = [];
        const relationships = [];
        const errors = [];

        try {
            // Remove comments and split into lines
            const lines = dslText
                .split('\n')
                .map(line => {
                    const commentIndex = line.indexOf('//');
                    return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
                })
                .map(line => line.trim())
                .filter(line => line.length > 0);

            let currentEntity = null;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Parse entity declaration
                if (line.includes('{') && !line.startsWith('}')) {
                    const entityMatch = line.match(/^(\w+)\s*(\[([^\]]+)\])?\s*\{/);
                    if (entityMatch) {
                        const entityName = entityMatch[1];
                        const metadataStr = entityMatch[3] || '';
                        const metadata = this._parseMetadata(metadataStr);

                        currentEntity = new Entity({
                            name: entityName,
                            displayName: this._toDisplayName(entityName),
                            icon: metadata.icon || 'box',
                            color: metadata.color || '#3b82f6',
                            fields: []
                        });
                    }
                }
                // Parse entity closing brace
                else if (line.startsWith('}')) {
                    if (currentEntity) {
                        entities.push(currentEntity);
                        currentEntity = null;
                    }
                }
                // Parse field
                else if (currentEntity && !line.includes('->')) {
                    const field = this._parseField(line);
                    if (field) {
                        currentEntity.addField(field);
                    }
                }
                // Parse relationship
                else if (line.includes('->')) {
                    const relationship = this._parseRelationship(line);
                    if (relationship) {
                        relationships.push(relationship);
                    }
                }
            }

        } catch (error) {
            errors.push({
                message: error.message,
                line: 0
            });
        }

        return {
            entities,
            relationships,
            errors
        };
    }

    async saveDiagram(data) {
        // Could implement local storage or file save
        console.log('Saving diagram:', data);
    }

    async loadDiagram() {
        // Could implement local storage or file load
        return null;
    }

    _parseMetadata(metadataStr) {
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

    _parseField(line) {
        const match = line.match(/^(\w+)\s+(\w+)(.*)$/);
        if (!match) return null;

        const fieldName = match[1];
        const fieldType = match[2];
        const decoratorsStr = match[3] || '';

        const decorators = this._parseDecorators(decoratorsStr);

        const isPrimaryKey = decorators.some(d => d.name === 'pk');
        const isForeignKey = decorators.some(d => d.name === 'fk');
        const isUnique = decorators.some(d => d.name === 'unique');
        const isRequired = decorators.some(d => d.name === 'required') || isPrimaryKey;

        const defaultDecorator = decorators.find(d => d.name === 'default');
        const defaultValue = defaultDecorator ? defaultDecorator.args : null;

        const enumDecorator = decorators.find(d => d.name === 'enum');
        const enumValues = enumDecorator && enumDecorator.params && enumDecorator.params.fields
            ? enumDecorator.params.fields
            : null;

        return new Field({
            name: fieldName,
            displayName: this._toDisplayName(fieldName),
            type: fieldType,
            isPrimaryKey,
            isForeignKey,
            isUnique,
            isRequired,
            defaultValue,
            enumValues,
            decorators
        });
    }

    _parseDecorators(decoratorsStr) {
        const decorators = [];
        if (!decoratorsStr) return decorators;

        const regex = /@(\w+)(?:\(([^)]+)\))?/g;
        let match;

        while ((match = regex.exec(decoratorsStr)) !== null) {
            const name = match[1];
            const argsStr = match[2];

            let args = null;
            let params = {};

            if (argsStr) {
                if (argsStr.includes(':')) {
                    const pairs = argsStr.split(',');
                    for (const pair of pairs) {
                        const [key, value] = pair.split(':').map(s => s.trim());
                        if (key && value) {
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
                    args = argsStr.trim();
                }
            }

            decorators.push({ name, args, params });
        }

        return decorators;
    }

    _parseRelationship(line) {
        const match = line.match(/^(\w+)\.?(\w+)?\s*->\s*(\w+)\.(\w+)$/);
        if (!match) return null;

        const fromEntity = match[1];
        const fromField = match[2] || match[1];
        const toEntity = match[3];
        const toField = match[4];

        return new Relationship({
            from: {
                entity: fromEntity,
                field: fromField
            },
            to: {
                entity: toEntity,
                field: toField
            },
            type: 'many-to-one'
        });
    }

    _toDisplayName(name) {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
