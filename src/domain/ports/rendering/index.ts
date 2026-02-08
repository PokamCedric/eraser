/**
 * Rendering Ports Module
 *
 * Exports rendering strategy interfaces (contracts) for diagram customization.
 * Consumers implement these interfaces to customize rendering while reusing core logic.
 */

export type { IEntityRenderStrategy, RenderContext } from './IEntityRenderStrategy';
export type { IRelationshipRenderStrategy } from './IRelationshipRenderStrategy';
export type {
  IDiagramRendererConfig,
  IRenderHooks,
  DiagramColors,
  DiagramDimensions,
} from './IDiagramRendererConfig';
