/**
 * Infrastructure: JSON Exporter
 *
 * Exports entities to JSON schema
 */
export class JSONExporter {
    export(entities, relationships) {
        const schema = {
            entities: entities.map(e => e.toJSON()),
            relationships: relationships.map(r => r.toJSON())
        };

        return JSON.stringify(schema, null, 2);
    }
}
