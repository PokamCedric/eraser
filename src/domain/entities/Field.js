/**
 * Domain Entity: Field
 *
 * Represents a field in an entity
 */
export class Field {
    constructor({
        name,
        displayName,
        type,
        isPrimaryKey = false,
        isForeignKey = false,
        isUnique = false,
        isRequired = false,
        defaultValue = null,
        enumValues = null,
        decorators = []
    }) {
        this.name = name;
        this.displayName = displayName;
        this.type = type;
        this.isPrimaryKey = isPrimaryKey;
        this.isForeignKey = isForeignKey;
        this.isUnique = isUnique;
        this.isRequired = isRequired;
        this.defaultValue = defaultValue;
        this.enumValues = enumValues;
        this.decorators = decorators;
    }

    validate() {
        if (!this.name || this.name.trim() === '') {
            return { isValid: false, error: 'Field name is required' };
        }

        if (!this.type || this.type.trim() === '') {
            return { isValid: false, error: 'Field type is required' };
        }

        return { isValid: true };
    }

    toJSON() {
        return {
            name: this.name,
            displayName: this.displayName,
            type: this.type,
            isPrimaryKey: this.isPrimaryKey,
            isForeignKey: this.isForeignKey,
            isUnique: this.isUnique,
            isRequired: this.isRequired,
            defaultValue: this.defaultValue,
            enumValues: this.enumValues,
            decorators: this.decorators
        };
    }
}
