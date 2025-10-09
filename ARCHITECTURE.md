# Clean Architecture - ERP Visual Designer

## 📐 Architecture Overview

Ce projet suit les principes de **Clean Architecture** (Architecture Hexagonale/Ports & Adapters) pour garantir :
- ✅ **Séparation des responsabilités** : Chaque couche a un rôle bien défini
- ✅ **Testabilité** : Chaque composant peut être testé indépendamment
- ✅ **Maintenabilité** : Le code est facile à comprendre et à modifier
- ✅ **Indépendance** : Les couches internes ne dépendent pas des couches externes

## 🏗️ Structure des Dossiers

```
src/
├── domain/                  # Couche Domaine (Business Logic)
│   ├── entities/           # Entités métier pures
│   │   ├── Entity.js       # Représente une entité (table)
│   │   ├── Field.js        # Représente un champ d'entité
│   │   └── Relationship.js # Représente une relation entre entités
│   ├── value-objects/      # Objets valeur immuables
│   │   └── Position.js     # Position 2D (x, y)
│   └── repositories/       # Interfaces (contrats)
│       ├── IDiagramRepository.js  # Contrat pour parser le DSL
│       └── IRenderer.js           # Contrat pour le rendu
│
├── application/            # Couche Application (Use Cases)
│   ├── use-cases/         # Cas d'utilisation métier
│   │   ├── ParseDSLUseCase.js        # Parse le DSL en entités
│   │   ├── RenderDiagramUseCase.js   # Rend le diagramme
│   │   └── ExportCodeUseCase.js      # Export vers différents formats
│   └── services/          # Services d'orchestration
│       └── DiagramService.js         # Orchestre les use cases
│
├── infrastructure/        # Couche Infrastructure (Implémentations)
│   ├── parsers/          # Adaptateurs de parsing
│   │   └── DSLParserAdapter.js      # Implémentation du parser DSL
│   ├── renderers/        # Adaptateurs de rendu
│   │   └── CanvasRendererAdapter.js # Rendu Canvas HTML5
│   └── exporters/        # Exportateurs de code
│       ├── SQLExporter.js           # Export SQL DDL
│       ├── TypeScriptExporter.js    # Export TypeScript
│       └── JSONExporter.js          # Export JSON
│
├── presentation/         # Couche Présentation (UI)
│   ├── controllers/      # Contrôleurs UI
│   │   └── AppController.js        # Contrôleur principal
│   └── factories/        # Factories pour créer des objets UI
│       └── MonacoEditorFactory.js  # Factory pour Monaco Editor
│
└── main.js              # Point d'entrée (Dependency Injection)
```

## 🔄 Flux de Dépendances

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                         │
│  (Controllers, Factories, UI Components)                │
│                         ↓                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION                          │
│       (Use Cases, Services, Orchestration)              │
│                         ↓                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      DOMAIN                             │
│    (Entities, Value Objects, Repository Interfaces)     │
│                         ↑                               │
└─────────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE                         │
│  (Repository Implementations, External Services)        │
└─────────────────────────────────────────────────────────┘
```

**Règle d'Or** : Les dépendances pointent toujours **vers l'intérieur** (vers le domaine).

## 📦 Couches Détaillées

### 1. **Domain Layer** (Cœur Métier)

**Responsabilité** : Contient la logique métier pure, sans dépendances externes.

- **Entités** : Objets avec identité et cycle de vie
  - `Entity` : Représente une table avec ses champs
  - `Field` : Représente un champ avec ses contraintes
  - `Relationship` : Représente une relation FK

- **Value Objects** : Objets immuables définis par leurs valeurs
  - `Position` : Coordonnées 2D (x, y)

- **Repository Interfaces** : Contrats pour accéder aux données
  - `IDiagramRepository` : Interface pour parser le DSL
  - `IRenderer` : Interface pour rendre le diagramme

**Principe** : Cette couche ne dépend de **RIEN**. Elle est totalement indépendante.

### 2. **Application Layer** (Cas d'Utilisation)

**Responsabilité** : Orchestre les entités du domaine pour réaliser des cas d'utilisation métier.

- **Use Cases** :
  - `ParseDSLUseCase` : Parse le DSL et valide les entités
  - `RenderDiagramUseCase` : Rend le diagramme via l'interface IRenderer
  - `ExportCodeUseCase` : Export vers SQL/TypeScript/JSON

- **Services** :
  - `DiagramService` : Orchestre tous les use cases

**Principe** : Dépend uniquement du **Domain** (interfaces), pas de l'infrastructure.

### 3. **Infrastructure Layer** (Détails Techniques)

**Responsabilité** : Implémente les interfaces du domaine avec des technologies concrètes.

- **Adapters** :
  - `DSLParserAdapter` : Implémente `IDiagramRepository`
  - `CanvasRendererAdapter` : Implémente `IRenderer`

- **Exporters** :
  - `SQLExporter`, `TypeScriptExporter`, `JSONExporter`

**Principe** : Dépend du **Domain** (implémente les interfaces).

### 4. **Presentation Layer** (Interface Utilisateur)

**Responsabilité** : Gère l'interaction avec l'utilisateur.

- **Controllers** :
  - `AppController` : Coordonne l'UI avec les services applicatifs

- **Factories** :
  - `MonacoEditorFactory` : Crée et configure Monaco Editor

**Principe** : Dépend de l'**Application** (utilise les services).

## 🎯 Avantages de cette Architecture

### 1. **Testabilité**
Chaque couche peut être testée indépendamment :
```javascript
// Test du use case sans UI ni infrastructure
const mockRepository = { parseDSL: jest.fn() };
const useCase = new ParseDSLUseCase(mockRepository);
```

### 2. **Flexibilité**
On peut changer l'infrastructure sans toucher au domaine :
```javascript
// Remplacer Canvas par SVG
const svgRenderer = new SVGRendererAdapter();
const useCase = new RenderDiagramUseCase(svgRenderer);
```

### 3. **Maintenabilité**
La logique métier est isolée et facile à comprendre :
```javascript
// La logique de validation est dans l'entité
entity.validate(); // Pas besoin de chercher ailleurs
```

### 4. **Évolutivité**
Ajouter des fonctionnalités est simple :
```javascript
// Ajouter un nouvel exporteur
class PythonExporter { export(entities) { /* ... */ } }
exporters['python'] = new PythonExporter();
```

## 🔌 Dependency Injection

Le fichier `main.js` est le **Composition Root** où toutes les dépendances sont câblées :

```javascript
// 1. Créer les implémentations infrastructure
const repository = new DSLParserAdapter();
const renderer = new CanvasRendererAdapter(canvas);

// 2. Créer les use cases avec les implémentations
const parseUseCase = new ParseDSLUseCase(repository);
const renderUseCase = new RenderDiagramUseCase(renderer);

// 3. Créer le service avec les use cases
const service = new DiagramService(parseUseCase, renderUseCase);

// 4. Créer le contrôleur avec le service
const controller = new AppController(service);
```

## 🚀 Comment Étendre l'Application

### Ajouter un nouveau format d'export

1. Créer un nouvel exporter dans `infrastructure/exporters/`:
```javascript
export class GraphQLExporter {
    export(entities, relationships) {
        // Logique d'export GraphQL
    }
}
```

2. L'enregistrer dans `main.js`:
```javascript
container.exporters['graphql'] = new GraphQLExporter();
```

### Ajouter une nouvelle fonctionnalité

1. Créer l'interface dans `domain/repositories/`
2. Créer le use case dans `application/use-cases/`
3. Implémenter l'adapter dans `infrastructure/`
4. Câbler dans `main.js`

## 📚 Ressources

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

## 🎓 Principes SOLID Appliqués

- **S**ingle Responsibility : Chaque classe a une seule raison de changer
- **O**pen/Closed : Ouvert à l'extension, fermé à la modification
- **L**iskov Substitution : Les implémentations sont substituables
- **I**nterface Segregation : Interfaces spécifiques (IDiagramRepository, IRenderer)
- **D**ependency Inversion : Dépendance sur les abstractions, pas les implémentations
