/**
 * Relationship Render Strategy Interface
 *
 * Contract for customizing relationship (connection line) rendering.
 * Follows Interface Segregation Principle (ISP) - only rendering concerns.
 *
 * @example
 * ```ts
 * class CustomRelationshipRenderer implements IRelationshipRenderStrategy {
 *   drawRelationship(ctx, relationship, fromEntity, toEntity, fromPos, toPos): void {
 *     // Custom relationship line rendering
 *   }
 * }
 * ```
 */

import type { Entity } from '../../entities/Entity';
import type { Relationship } from '../../entities/Relationship';
import type { Position } from '../../value-objects/Position';

/**
 * Strategy interface for relationship rendering
 * Consumers can implement this to customize connection line appearance
 */
export interface IRelationshipRenderStrategy {
  /**
   * Draw a relationship between two entities
   *
   * @param ctx - Canvas 2D rendering context
   * @param relationship - Relationship data (type, from, to, label)
   * @param fromEntity - Source entity
   * @param toEntity - Target entity
   * @param fromPos - Position of source entity
   * @param toPos - Position of target entity
   */
  drawRelationship(
    ctx: CanvasRenderingContext2D,
    relationship: Relationship,
    fromEntity: Entity,
    toEntity: Entity,
    fromPos: Position,
    toPos: Position
  ): void;
}
