/**
 * Domain Entity: Entity
 *
 * Represents a database entity with fields and metadata
 */
export class Entity {
    constructor({ name, displayName, icon, color, fields = [] }) {
        this.name = name;
        this.displayName = displayName;
        this.icon = icon;
        this.color = color;
        this.fields = fields;
    }

    addField(field) {
        this.fields.push(field);
    }

    getFieldByName(fieldName) {
        return this.fields.find(f => f.name === fieldName);
    }

    getPrimaryKey() {
        return this.fields.find(f => f.isPrimaryKey);
    }

    getForeignKeys() {
        return this.fields.filter(f => f.isForeignKey);
    }

    validate() {
        if (!this.name || this.name.trim() === '') {
            return { isValid: false, error: 'Entity name is required' };
        }

        const pkCount = this.fields.filter(f => f.isPrimaryKey).length;
        if (pkCount === 0) {
            return { isValid: false, error: 'Entity must have a primary key' };
        }

        if (pkCount > 1) {
            return { isValid: false, error: 'Entity cannot have multiple primary keys' };
        }

        return { isValid: true };
    }

    toJSON() {
        return {
            name: this.name,
            displayName: this.displayName,
            icon: this.icon,
            color: this.color,
            fields: this.fields.map(f => f.toJSON ? f.toJSON() : f)
        };
    }
}
