/**
 * Infrastructure: TypeScript Exporter
 *
 * Exports entities to TypeScript interfaces
 */
export class TypeScriptExporter {
    export(entities, relationships) {
        let ts = '// Generated TypeScript Interfaces\n\n';

        for (const entity of entities) {
            ts += `export interface ${entity.displayName.replace(/\s+/g, '')} {\n`;

            for (const field of entity.fields) {
                const optional = !field.isRequired ? '?' : '';
                const typeMap = {
                    'string': 'string',
                    'int': 'number',
                    'num': 'number',
                    'double': 'number',
                    'bool': 'boolean',
                    'timestamp': 'Date',
                    'datetime': 'Date'
                };
                const type = typeMap[field.type] || 'any';

                if (field.enumValues && field.enumValues.length > 0) {
                    ts += `  ${field.name}${optional}: ${field.enumValues.map(v => `'${v}'`).join(' | ')};\n`;
                } else {
                    ts += `  ${field.name}${optional}: ${type};\n`;
                }
            }

            ts += '}\n\n';
        }

        return ts;
    }
}
