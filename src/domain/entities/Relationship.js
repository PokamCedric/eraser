/**
 * Domain Entity: Relationship
 *
 * Represents a relationship between two entities
 */
export class Relationship {
    constructor({ from, to, type = 'many-to-one' }) {
        this.from = from; // { entity, field }
        this.to = to;     // { entity, field }
        this.type = type; // 'one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'
    }

    validate() {
        if (!this.from || !this.from.entity || !this.from.field) {
            return { isValid: false, error: 'Relationship source is incomplete' };
        }

        if (!this.to || !this.to.entity || !this.to.field) {
            return { isValid: false, error: 'Relationship target is incomplete' };
        }

        return { isValid: true };
    }

    getCardinality() {
        const cardinalityMap = {
            'one-to-one': '1:1',
            'one-to-many': '1:N',
            'many-to-one': 'N:1',
            'many-to-many': 'N:N'
        };
        return cardinalityMap[this.type] || this.type;
    }

    toJSON() {
        return {
            from: this.from,
            to: this.to,
            type: this.type
        };
    }
}
