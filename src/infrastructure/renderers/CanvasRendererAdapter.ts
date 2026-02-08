/**
 * Infrastructure Adapter: Canvas Renderer
 *
 * Adapts the canvas renderer to implement IRenderer
 * Refactored following SOLID principles with modular components
 *
 * Supports dependency injection via IDiagramRendererConfig:
 * - Custom entity render strategy (implements IEntityRenderStrategy)
 * - Custom relationship render strategy (implements IRelationshipRenderStrategy)
 * - Lifecycle hooks for rendering events
 *
 * @example
 * ```ts
 * // Use with default renderers
 * const renderer = new CanvasRendererAdapter(canvas);
 *
 * // Use with custom entity renderer
 * const renderer = new CanvasRendererAdapter(canvas, {
 *   entityRenderStrategy: new PowerAppsEntityRenderer(),
 *   hooks: {
 *     onEntityClicked: (entity) => console.log('Clicked:', entity.name)
 *   }
 * });
 * ```
 */
import { IRenderer } from '../../domain/repositories/IRenderer';
import { Entity } from '../../domain/entities/Entity';
import { Relationship } from '../../domain/entities/Relationship';
import { Position } from '../../domain/value-objects/Position';
import { LayerClassificationEngine } from '../../domain/services/layout/LayerClassificationEngine';
import { ConnectionAwarePositioner } from '../../domain/services/positioning/ConnectionAwarePositioner';
import { MagneticAlignmentOptimizer } from '../../domain/services/layout/MagneticAlignmentOptimizer';
import { Logger } from '../utils/Logger';
import { ViewportManager } from './ViewportManager';
import { EntityRenderer } from './EntityRenderer';
import { RelationshipRenderer } from './RelationshipRenderer';
import { CanvasInteractionHandler } from './CanvasInteractionHandler';
import { IconLoader } from './IconLoader';
import type {
  IDiagramRendererConfig,
  IRenderHooks,
  IEntityRenderStrategy,
  IRelationshipRenderStrategy,
} from '../../domain/ports/rendering';

export class CanvasRendererAdapter implements IRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private entities: Entity[] = [];
  private relationships: Relationship[] = [];

  // Entity layout
  private entityPositions: Map<string, Position> = new Map();
  private readonly entityWidth: number;
  private readonly entityHeaderHeight: number;
  private readonly entityFieldHeight: number;
  private readonly entityPadding: number = 60;

  // Display dimensions
  private displayWidth: number = 0;
  private displayHeight: number = 0;

  // SOLID: Delegated components (SRP - Single Responsibility Principle)
  private viewportManager: ViewportManager;
  private entityRenderStrategy: IEntityRenderStrategy;
  private relationshipRenderStrategy: IRelationshipRenderStrategy;
  // Kept to prevent garbage collection and maintain event listeners
  private interactionHandler: CanvasInteractionHandler;

  // Lifecycle hooks for rendering events
  private hooks?: IRenderHooks;

  /**
   * Create a new CanvasRendererAdapter
   *
   * @param canvas - HTML Canvas element to render to
   * @param config - Optional configuration for dependency injection
   */
  constructor(canvas: HTMLCanvasElement, config: IDiagramRendererConfig = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;

    // Apply dimensions from config or use defaults
    this.entityWidth = config.dimensions?.entityWidth ?? 250;
    this.entityHeaderHeight = config.dimensions?.entityHeaderHeight ?? 50;
    this.entityFieldHeight = config.dimensions?.entityFieldHeight ?? 30;

    // Store hooks
    this.hooks = config.hooks;

    // Initialize SOLID components
    this.viewportManager = new ViewportManager();

    // Use injected entity render strategy or create default
    this.entityRenderStrategy = config.entityRenderStrategy ?? new EntityRenderer({
      entityWidth: this.entityWidth,
      entityHeaderHeight: this.entityHeaderHeight,
      entityFieldHeight: this.entityFieldHeight,
      colors: {
        entityBorder: config.colors?.entityBorder ?? '#e2e8f0',
        entityShadow: config.colors?.entityShadow ?? 'rgba(0,0,0,0.1)',
        fieldText: config.colors?.fieldText ?? '#475569',
        primaryKeyBg: config.colors?.primaryKeyBg ?? '#dbeafe',
        foreignKeyBg: config.colors?.foreignKeyBg ?? '#fef3c7'
      }
    });

    // Use injected relationship render strategy or create default
    this.relationshipRenderStrategy = config.relationshipRenderStrategy ?? new RelationshipRenderer({
      entityWidth: this.entityWidth,
      entityHeaderHeight: this.entityHeaderHeight,
      entityFieldHeight: this.entityFieldHeight,
      colors: {
        relationLine: config.colors?.relationLine ?? '#3b82f6'
      },
      getVisibleFieldCount: config.getVisibleFieldCount,
    });

    this._setupCanvas();
    this.interactionHandler = new CanvasInteractionHandler(
      this.canvas,
      this.viewportManager,
      () => this.render(),
      () => this.entities,
      () => this.entityPositions,
      (entityName: string, position: Position) => {
        this.entityPositions.set(entityName, position);
        // Note: Drag hooks are handled by CanvasInteractionHandler
      },
      (x: number, y: number) => this._getEntityAtPoint(x, y),
      // Click handler - calls onEntityClicked hook
      (entity: Entity, worldX: number, worldY: number) => {
        if (this.hooks?.onEntityClicked) {
          const pos = this.entityPositions.get(entity.name);
          const entityX = pos?.x ?? 0;
          const entityY = pos?.y ?? 0;
          // Pass world coordinates relative to entity position
          const handled = this.hooks.onEntityClicked(entity, worldX - entityX, worldY - entityY);
          if (handled) {
            this.render(); // Re-render if hook handled the click
          }
          return handled;
        }
        return false;
      }
    );
  }

  setData(entities: Entity[], relationships: Relationship[]): void {
    this.entities = entities;
    this.relationships = relationships;

    // Preload icons for all entities
    const iconNames = entities
      .map(e => e.icon)
      .filter(icon => icon && icon !== 'box');

    if (iconNames.length > 0) {
      IconLoader.preload(iconNames)
        .then(() => {
          // Re-render after icons are loaded
          this.render();
        })
        .catch(() => {
          // Silently ignore icon loading errors
          // Errors are already logged in IconLoader
          // Still render even if some icons failed to load
          this.render();
        });
    }

    // Apply auto-layout automatically if there are entities
    if (this.entities.length > 0) {
      this.autoLayout();
    } else {
      this._initializePositions();
      this.render();
    }
  }

  render(): void {
    const ctx = this.ctx;
    const width = this.displayWidth;
    const height = this.displayHeight;

    // Call before render hook
    this.hooks?.onBeforeRender?.(this.entities, this.relationships);

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Apply viewport transformation (delegated to ViewportManager)
    this.viewportManager.applyTransform(ctx);

    // Draw relationships (delegated to RelationshipRenderStrategy)
    this._drawRelationships(ctx);

    // Draw entities (delegated to EntityRenderStrategy)
    this._drawEntities(ctx);

    ctx.restore();

    // Call after render hook
    this.hooks?.onAfterRender?.(this.entities, this.relationships);
  }

  zoomIn(): void {
    const centerX = this.displayWidth / 2;
    const centerY = this.displayHeight / 2;

    // Delegated to ViewportManager
    this.viewportManager.zoomIn(centerX, centerY);
    this.render();

    // Call zoom change hook
    this.hooks?.onZoomChange?.(this.getZoomLevel());
  }

  zoomOut(): void {
    const centerX = this.displayWidth / 2;
    const centerY = this.displayHeight / 2;

    // Delegated to ViewportManager
    this.viewportManager.zoomOut(centerX, centerY);
    this.render();

    // Call zoom change hook
    this.hooks?.onZoomChange?.(this.getZoomLevel());
  }

  fitToScreen(): void {
    if (this.entities.length === 0) return;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const entity of this.entities) {
      const pos = this.entityPositions.get(entity.name);
      if (!pos) continue;

      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + this.entityRenderStrategy.getEntityWidth());
      maxY = Math.max(maxY, pos.y + this.entityRenderStrategy.getEntityHeight(entity));
    }

    if (!isFinite(minX)) return;

    // Delegated to ViewportManager
    this.viewportManager.fitToContent(
      minX,
      minY,
      maxX,
      maxY,
      this.displayWidth,
      this.displayHeight,
      100
    );

    this.render();
  }

  autoLayout(): void {
    this.entityPositions.clear();

    // Call before layout hook
    this.hooks?.onBeforeLayout?.(this.entities, this.relationships);

    // Step 1-5: Compute hierarchical layers using Layer Classification Engine
    // This algorithm uses Floyd-Warshall inversé to detect transitive intercalations
    // - Step 0: Parse relationships (external, handled by parser)
    // - Step 1: Build backlog (deduplication)
    // - Step 2: Determine processing order
    // - Step 3: Build clusters
    // - Step 4: Build layers with Floyd-Warshall inversé (transitive distance calculation)
    // - Step 5: Vertical reorganization by cluster
    const { layers } = LayerClassificationEngine.layout(this.entities, this.relationships);

    // Step 7: Field ordering within entities (only reorder fields, not entities)
    const { layers: finalLayers, entities: optimizedEntities } = MagneticAlignmentOptimizer.optimize(
      this.entities,
      this.relationships,
      layers
    );

    // Update entities with optimized field ordering
    this.entities = optimizedEntities;

    // Step 8: Calculate optimal positions using connection-aware algorithm
    const positions = ConnectionAwarePositioner.calculateOptimalPositions(
      finalLayers,
      optimizedEntities,
      this.relationships,
      {
        entityWidth: this.entityRenderStrategy.getEntityWidth(),
        entityHeaderHeight: this.entityRenderStrategy.getHeaderHeight(),
        entityFieldHeight: this.entityRenderStrategy.getFieldHeight(),
        horizontalSpacing: this.entityRenderStrategy.getEntityWidth() + 120,
        minVerticalSpacing: 40,  // Increased spacing for better readability
        baseX: 100
      }
    );

    // Apply positions
    this.entityPositions = positions;

    // Call after layout hook
    this.hooks?.onAfterLayout?.(this.entityPositions);

    // Step 9: Debug output
    this._logLayoutDebugInfo(finalLayers);

    // Step 10: Fit to screen
    this.fitToScreen();
  }

  /**
   * Log debug information about the layout
   */
  private _logLayoutDebugInfo(layers: Map<number, string[]>): void {
    Logger.debug('🧭 Auto Layout Layers (Left → Right)');
    Logger.debug(`Number of layers detected: ${layers.size}`);
    for (const [i, names] of Array.from(layers.entries()).sort((a, b) => a[0] - b[0])) {
      Logger.debug(`Layer ${i}: ${names.join(', ')}`);
    }
  }

  getZoomLevel(): number {
    // Delegated to ViewportManager
    return this.viewportManager.getZoomLevel();
  }

  // Private methods
  private _setupCanvas(): void {
    this._resizeCanvas();
    window.addEventListener('resize', () => {
      this._resizeCanvas();
      this.render();
    });
  }

  private _resizeCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
  }

  // Event handling is now delegated to CanvasInteractionHandler

  private _getEntityAtPoint(x: number, y: number): Entity | null {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if (!entity) continue;

      const pos = this.entityPositions.get(entity.name);
      if (!pos) continue;

      // Delegated to EntityRenderStrategy
      if (this.entityRenderStrategy.isPointInside(x, y, pos.x, pos.y, entity)) {
        return entity;
      }
    }
    return null;
  }

  private _initializePositions(): void {
    const cols = Math.ceil(Math.sqrt(this.entities.length));
    const entityWidth = this.entityRenderStrategy.getEntityWidth();
    const spacing = entityWidth + this.entityPadding * 2;

    this.entities.forEach((entity, index) => {
      if (!this.entityPositions.has(entity.name)) {
        const row = Math.floor(index / cols);
        const col = index % cols;

        this.entityPositions.set(entity.name, new Position({
          x: col * spacing + this.entityPadding,
          y: row * (300 + this.entityPadding) + this.entityPadding
        }));
      }
    });
  }

  private _drawEntities(ctx: CanvasRenderingContext2D): void {
    for (const entity of this.entities) {
      const pos = this.entityPositions.get(entity.name);
      if (!pos) continue;

      // Delegated to EntityRenderStrategy
      this.entityRenderStrategy.render({
        ctx,
        x: pos.x,
        y: pos.y,
        entity,
      });
    }
  }

  private _drawRelationships(ctx: CanvasRenderingContext2D): void {
    for (const rel of this.relationships) {
      const fromEntity = this.entities.find(e => e.name === rel.from.entity);
      const toEntity = this.entities.find(e => e.name === rel.to.entity);

      if (!fromEntity || !toEntity) continue;

      const fromPos = this.entityPositions.get(fromEntity.name);
      const toPos = this.entityPositions.get(toEntity.name);

      if (!fromPos || !toPos) continue;

      // Delegated to RelationshipRenderStrategy
      this.relationshipRenderStrategy.drawRelationship(ctx, rel, fromEntity, toEntity, fromPos, toPos);
    }
  }
}
