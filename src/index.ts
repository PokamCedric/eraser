/**
 * Eraser - ERP Visual Designer
 *
 * Public API exports for external consumers
 */

// Parser
export { DSLParserAdapter } from './infrastructure/parsers/DSLParserAdapter';

// Renderer
export { CanvasRendererAdapter } from './infrastructure/renderers/CanvasRendererAdapter';
export { EntityRenderer } from './infrastructure/renderers/EntityRenderer';
export { RelationshipRenderer } from './infrastructure/renderers/RelationshipRenderer';

// Icons
export { IconLoader } from './infrastructure/renderers/IconLoader';

// Use Cases
export { ParseDSLUseCase } from './application/use-cases/ParseDSLUseCase';

// Domain entities
export { Entity } from './domain/entities/Entity';
export { Field } from './domain/entities/Field';
export { Relationship } from './domain/entities/Relationship';

// Value objects
export { Position } from './domain/value-objects/Position';

// Rendering contracts (interfaces for dependency injection)
export type {
  IEntityRenderStrategy,
  RenderContext,
  IRelationshipRenderStrategy,
  IDiagramRendererConfig,
  IRenderHooks,
  DiagramColors,
  DiagramDimensions,
} from './domain/ports/rendering';

// Renderer config types (for implementing custom renderers)
export type { EntityRenderConfig } from './infrastructure/renderers/EntityRenderer';
export type { RelationshipRenderConfig } from './infrastructure/renderers/RelationshipRenderer';
