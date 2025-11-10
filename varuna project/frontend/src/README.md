# Frontend Architecture

This frontend follows **Hexagonal Architecture** (Ports & Adapters pattern) to maintain clean separation of concerns.

## Folder Structure

```
src/
├── core/                      # Core domain logic (framework-independent)
│   ├── domain/               # Domain entities and value objects
│   ├── application/          # Use cases and business logic
│   │   └── useCases/        # Individual use case implementations
│   └── ports/               # Interface definitions
│       ├── inbound/         # Use case interfaces
│       └── outbound/        # Repository/API interfaces
│
├── adapters/                 # External adapters (framework-dependent)
│   ├── ui/                  # React UI components
│   │   ├── components/      # React components for each tab
│   │   └── hooks/           # Custom React hooks
│   └── infrastructure/      # External services
│       └── api/             # API client implementations
│
└── shared/                   # Shared utilities and types
    ├── config.ts            # Application configuration
    └── types.ts             # Shared TypeScript types
```

## Architecture Principles

1. **Core Domain Independence**: The `core/` folder has no dependencies on React or any external frameworks
2. **Dependency Inversion**: All dependencies point inward toward the core domain
3. **Port Interfaces**: Clear contracts between layers through TypeScript interfaces
4. **Adapter Implementation**: React and API clients are isolated to adapter layers
5. **Testability**: Core logic can be tested without UI or API dependencies

## Routing

The application uses a simple tab-based routing system with four main tabs:
- **Routes**: View and manage vessel route data
- **Compare**: Compare baseline routes with other routes
- **Banking**: Manage compliance balance banking
- **Pooling**: Create and manage pooling arrangements

## Development

- Run development server: `npm run dev`
- Build for production: `npm run build`
- Run tests: `npm test`
- Lint code: `npm run lint`
- Format code: `npm run format`
