/**
 * Value Object: Position
 *
 * Represents a 2D coordinate
 */
export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    add(other) {
        return new Position(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Position(this.x - other.x, this.y - other.y);
    }

    scale(factor) {
        return new Position(this.x * factor, this.y * factor);
    }
}
