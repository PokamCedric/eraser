/**
 * Diagram Renderer Configuration Interface
 *
 * Configuration contract for customizing the diagram renderer.
 * Allows dependency injection of render strategies and lifecycle hooks.
 * Follows Open/Closed Principle (OCP) - open for extension via config.
 *
 * @example
 * ```ts
 * const renderer = new CanvasRendererAdapter(canvas, {
 *   entityRenderStrategy: new PowerAppsEntityRenderer(),
 *   hooks: {
 *     onEntityClicked: (entity) => console.log('Clicked:', entity.name)
 *   }
 * });
 * ```
 */

import type { Entity } from '../../entities/Entity';
import type { Relationship } from '../../entities/Relationship';
import type { Position } from '../../value-objects/Position';
import type { IEntityRenderStrategy } from './IEntityRenderStrategy';
import type { IRelationshipRenderStrategy } from './IRelationshipRenderStrategy';

/**
 * Lifecycle hooks for diagram rendering
 * Allows consumers to react to rendering events without modifying core logic
 */
export interface IRenderHooks {
  /**
   * Called before rendering starts
   */
  onBeforeRender?(entities: Entity[], relationships: Relationship[]): void;

  /**
   * Called after rendering completes
   */
  onAfterRender?(entities: Entity[], relationships: Relationship[]): void;

  /**
   * Called when an entity is clicked
   * @returns true to prevent default behavior
   */
  onEntityClicked?(entity: Entity, x: number, y: number): boolean;

  /**
   * Called when an entity is right-clicked (context menu)
   * @returns true to prevent default behavior
   */
  onEntityContextMenu?(entity: Entity, x: number, y: number): boolean;

  /**
   * Called when an entity starts being dragged
   */
  onEntityDragStart?(entity: Entity): void;

  /**
   * Called when an entity is being dragged
   */
  onEntityDrag?(entity: Entity, newPosition: Position): void;

  /**
   * Called when an entity drag ends
   */
  onEntityDragEnd?(entity: Entity, finalPosition: Position): void;

  /**
   * Called before layout is computed
   */
  onBeforeLayout?(entities: Entity[], relationships: Relationship[]): void;

  /**
   * Called after layout is computed
   */
  onAfterLayout?(positions: Map<string, Position>): void;

  /**
   * Called when zoom level changes
   */
  onZoomChange?(zoomPercent: number): void;
}

/**
 * Color configuration for default renderers
 */
export interface DiagramColors {
  entityBorder?: string;
  entityShadow?: string;
  entityBackground?: string;
  entityHeaderBackground?: string;
  fieldText?: string;
  primaryKeyBg?: string;
  foreignKeyBg?: string;
  relationLine?: string;
}

/**
 * Dimension configuration for layout calculations
 */
export interface DiagramDimensions {
  entityWidth?: number;
  entityHeaderHeight?: number;
  entityFieldHeight?: number;
  horizontalSpacing?: number;
  minVerticalSpacing?: number;
}

/**
 * Main configuration interface for diagram renderer
 * All properties are optional - defaults are used when not provided
 */
export interface IDiagramRendererConfig {
  /**
   * Custom entity renderer strategy
   * If not provided, uses default EntityRenderer
   */
  entityRenderStrategy?: IEntityRenderStrategy;

  /**
   * Custom relationship renderer strategy
   * If not provided, uses default RelationshipRenderer
   */
  relationshipRenderStrategy?: IRelationshipRenderStrategy;

  /**
   * Lifecycle hooks for rendering events
   */
  hooks?: IRenderHooks;

  /**
   * Default colors for rendering
   * Can be overridden by custom strategies
   */
  colors?: DiagramColors;

  /**
   * Default dimensions for layout
   * Can be overridden by custom strategies
   */
  dimensions?: DiagramDimensions;
}
