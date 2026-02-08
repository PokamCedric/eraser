/**
 * Entity Render Strategy Interface
 *
 * Contract for customizing entity (card) rendering in diagrams.
 * Follows Interface Segregation Principle (ISP) - only rendering concerns.
 *
 * @example
 * ```ts
 * class PowerAppsEntityRenderer implements IEntityRenderStrategy {
 *   render(context: RenderContext): void {
 *     // Custom PowerApps-style card rendering
 *   }
 *   // ... implement other methods
 * }
 * ```
 */

import type { Entity } from '../../entities/Entity';

/**
 * Context passed to the render method
 */
export interface RenderContext {
  /** Canvas 2D rendering context */
  ctx: CanvasRenderingContext2D;
  /** X position of the entity */
  x: number;
  /** Y position of the entity */
  y: number;
  /** Entity data to render */
  entity: Entity;
  /** Whether the entity is currently hovered */
  isHovered?: boolean;
  /** Whether the entity is currently selected */
  isSelected?: boolean;
}

/**
 * Strategy interface for entity rendering
 * Consumers implement this to customize card appearance
 */
export interface IEntityRenderStrategy {
  /**
   * Render an entity at the specified position
   *
   * @param context - Rendering context with entity data and position
   */
  render(context: RenderContext): void;

  /**
   * Get the width of the rendered entity
   * Used for layout calculations and hit detection
   */
  getEntityWidth(): number;

  /**
   * Get the height of the rendered entity
   * May vary based on number of fields
   *
   * @param entity - Entity to calculate height for
   */
  getEntityHeight(entity: Entity): number;

  /**
   * Get the header height
   * Used for click detection and field positioning
   */
  getHeaderHeight(): number;

  /**
   * Get the height of a single field row
   * Used for click detection and layout
   */
  getFieldHeight(): number;

  /**
   * Check if a point is inside this entity
   * Used for interaction detection (click, hover)
   *
   * @param x - Point X coordinate
   * @param y - Point Y coordinate
   * @param entityX - Entity top-left X coordinate
   * @param entityY - Entity top-left Y coordinate
   * @param entity - Entity to check
   */
  isPointInside(
    x: number,
    y: number,
    entityX: number,
    entityY: number,
    entity: Entity
  ): boolean;
}
