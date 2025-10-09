/**
 * Main Entry Point
 *
 * Bootstraps the application with dependency injection
 */

// Domain
import { Entity } from './domain/entities/Entity.js';
import { Field } from './domain/entities/Field.js';
import { Relationship } from './domain/entities/Relationship.js';

// Application
import { ParseDSLUseCase } from './application/use-cases/ParseDSLUseCase.js';
import { RenderDiagramUseCase } from './application/use-cases/RenderDiagramUseCase.js';
import { ExportCodeUseCase } from './application/use-cases/ExportCodeUseCase.js';
import { DiagramService } from './application/services/DiagramService.js';

// Infrastructure
import { DSLParserAdapter } from './infrastructure/parsers/DSLParserAdapter.js';
import { CanvasRendererAdapter } from './infrastructure/renderers/CanvasRendererAdapter.js';
import { SQLExporter } from './infrastructure/exporters/SQLExporter.js';
import { TypeScriptExporter } from './infrastructure/exporters/TypeScriptExporter.js';
import { JSONExporter } from './infrastructure/exporters/JSONExporter.js';

// Presentation
import { AppController } from './presentation/controllers/AppController.js';
import { MonacoEditorFactory } from './presentation/factories/MonacoEditorFactory.js';

/**
 * Application Composition Root
 *
 * This is where we wire up all dependencies following Clean Architecture principles:
 * - Domain entities are pure business logic with no dependencies
 * - Application use cases depend only on domain entities and repository interfaces
 * - Infrastructure adapters implement repository interfaces
 * - Presentation controllers depend on application services
 */
class Application {
    constructor() {
        this.container = this._setupDependencyContainer();
    }

    _setupDependencyContainer() {
        const container = {};

        // Infrastructure Layer - Repository Implementations
        container.diagramRepository = new DSLParserAdapter();

        // Infrastructure Layer - Renderer
        const canvas = document.getElementById('diagramCanvas');
        container.renderer = new CanvasRendererAdapter(canvas);

        // Infrastructure Layer - Exporters
        container.exporters = {
            'sql': new SQLExporter(),
            'typescript': new TypeScriptExporter(),
            'json': new JSONExporter()
        };

        // Application Layer - Use Cases
        container.parseDSLUseCase = new ParseDSLUseCase(container.diagramRepository);
        container.renderDiagramUseCase = new RenderDiagramUseCase(container.renderer);
        container.exportCodeUseCase = new ExportCodeUseCase(container.exporters);

        // Application Layer - Service
        container.diagramService = new DiagramService(
            container.parseDSLUseCase,
            container.renderDiagramUseCase,
            container.exportCodeUseCase
        );

        // Presentation Layer - Factories
        container.editorFactory = new MonacoEditorFactory();

        // Presentation Layer - Controller
        container.appController = new AppController(
            container.diagramService,
            container.editorFactory
        );

        return container;
    }

    async start() {
        try {
            console.log('🚀 Starting ERP Visual Designer with Clean Architecture...');
            await this.container.appController.initialize();
            console.log('✅ Application initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            alert('Failed to initialize application. Please check the console for details.');
        }
    }
}

// Bootstrap the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new Application();
    app.start();
});

// Export for debugging purposes
window.__app = Application;
