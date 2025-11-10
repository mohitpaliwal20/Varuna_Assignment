# Design Document

## Overview

The Fuel EU Maritime compliance platform is a full-stack application implementing hexagonal architecture principles. The system consists of two main components:

1. **Frontend Dashboard**: React + TypeScript + TailwindCSS application with four main tabs (Routes, Compare, Banking, Pooling)
2. **Backend API**: Node.js + TypeScript + PostgreSQL service providing REST endpoints for compliance calculations

The architecture follows the Ports & Adapters pattern (Hexagonal Architecture) to ensure clean separation of concerns, testability, and maintainability. Both frontend and backend maintain strict boundaries between core domain logic and external frameworks/infrastructure.

## Architecture

### Frontend Architecture

```
frontend/
├── src/
│   ├── core/
│   │   ├── domain/           # Domain entities and value objects
│   │   │   ├── Route.ts
│   │   │   ├── ComplianceBalance.ts
│   │   │   ├── BankEntry.ts
│   │   │   └── Pool.ts
│   │   ├── application/      # Use cases and business logic
│   │   │   ├── useCases/
│   │   │   │   ├── FetchRoutes.ts
│   │   │   │   ├── SetBaseline.ts
│   │   │   │   ├── CompareRoutes.ts
│   │   │   │   ├── BankBalance.ts
│   │   │   │   ├── ApplyBanked.ts
│   │   │   │   └── CreatePool.ts
│   │   └── ports/            # Interface definitions
│   │       ├── inbound/      # Use case interfaces
│   │       └── outbound/     # Repository/API interfaces
│   ├── adapters/
│   │   ├── ui/               # React components
│   │   │   ├── components/
│   │   │   │   ├── RoutesTab.tsx
│   │   │   │   ├── CompareTab.tsx
│   │   │   │   ├── BankingTab.tsx
│   │   │   │   └── PoolingTab.tsx
│   │   │   └── hooks/        # Custom React hooks
│   │   └── infrastructure/   # API clients
│   │       └── api/
│   │           └── ApiClient.ts
│   └── shared/               # Shared utilities and types
```

### Backend Architecture

```
backend/
├── src/
│   ├── core/
│   │   ├── domain/           # Domain entities
│   │   │   ├── Route.ts
│   │   │   ├── ComplianceBalance.ts
│   │   │   ├── BankEntry.ts
│   │   │   └── Pool.ts
│   │   ├── application/      # Use cases
│   │   │   ├── ComputeComparison.ts
│   │   │   ├── ComputeCB.ts
│   │   │   ├── BankSurplus.ts
│   │   │   ├── ApplyBanked.ts
│   │   │   └── CreatePool.ts
│   │   └── ports/            # Interface definitions
│   │       ├── inbound/      # HTTP handlers interface
│   │       └── outbound/     # Repository interfaces
│   ├── adapters/
│   │   ├── inbound/
│   │   │   └── http/         # Express controllers
│   │   │       ├── RoutesController.ts
│   │   │       ├── ComplianceController.ts
│   │   │       ├── BankingController.ts
│   │   │       └── PoolsController.ts
│   │   └── outbound/
│   │       └── postgres/     # Repository implementations
│   │           ├── RouteRepository.ts
│   │           ├── ComplianceRepository.ts
│   │           ├── BankRepository.ts
│   │           └── PoolRepository.ts
│   ├── infrastructure/
│   │   ├── db/               # Database configuration
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   └── server/           # Express server setup
│   └── shared/               # Shared utilities
```

### Hexagonal Architecture Principles

1. **Core Domain Independence**: Core domain and application layers have no dependencies on frameworks or external libraries
2. **Dependency Inversion**: All dependencies point inward toward the core
3. **Port Interfaces**: Clear contracts between layers through TypeScript interfaces
4. **Adapter Implementation**: Frameworks (React, Express, Prisma) isolated to adapter layers
5. **Testability**: Core logic can be tested without UI or database

## Components and Interfaces

### Frontend Components

#### Routes Tab Component
- **Purpose**: Display and manage vessel route data
- **Key Features**:
  - Table displaying all routes with filtering capabilities
  - "Set Baseline" action button
  - Filters for vesselType, fuelType, year
- **Dependencies**: FetchRoutes use case, SetBaseline use case

#### Compare Tab Component
- **Purpose**: Compare baseline routes against other routes
- **Key Features**:
  - Comparison table with percentage differences
  - Visual chart (bar/line) for ghgIntensity comparison
  - Compliance status indicators (✅/❌)
- **Dependencies**: CompareRoutes use case
- **Calculations**: percentDiff = ((comparison / baseline) − 1) × 100

#### Banking Tab Component
- **Purpose**: Manage compliance balance banking per Article 20
- **Key Features**:
  - Display current CB with KPIs (cb_before, applied, cb_after)
  - Bank positive CB button
  - Apply banked surplus button
  - Conditional enabling based on CB value
- **Dependencies**: BankBalance use case, ApplyBanked use case

#### Pooling Tab Component
- **Purpose**: Create and manage pooling arrangements per Article 21
- **Key Features**:
  - List of ships with adjusted CB
  - Pool creation form with member selection
  - Pool sum indicator (red/green)
  - Validation rules enforcement
- **Dependencies**: CreatePool use case
- **Validation Rules**:
  - Sum(adjustedCB) ≥ 0
  - Deficit ship cannot exit worse
  - Surplus ship cannot exit negative

### Backend API Endpoints

#### Routes Endpoints
- `GET /routes`: Fetch all routes
- `POST /routes/:id/baseline`: Set route as baseline
- `GET /routes/comparison`: Get baseline vs comparison data with compliance flags

#### Compliance Endpoints
- `GET /compliance/cb?shipId&year`: Compute and return compliance balance
- `GET /compliance/adjusted-cb?shipId&year`: Return CB after bank applications

#### Banking Endpoints
- `GET /banking/records?shipId&year`: Fetch banking records
- `POST /banking/bank`: Bank positive compliance balance
- `POST /banking/apply`: Apply banked surplus to deficit

#### Pools Endpoints
- `POST /pools`: Create new pool with members and allocation

### Core Use Cases

#### ComputeComparison
- **Input**: Baseline route, comparison routes
- **Output**: Comparison data with percentDiff and compliant flags
- **Logic**: Calculate percentage difference and compare against Target_Intensity (89.3368 gCO₂e/MJ)

#### ComputeCB
- **Input**: Route data (ghgIntensity, fuelConsumption)
- **Output**: Compliance Balance in gCO₂e
- **Formula**: 
  - Energy_in_scope = fuelConsumption × 41,000 MJ/t
  - CB = (Target_Intensity - Actual_Intensity) × Energy_in_scope
  - Positive CB = Surplus, Negative CB = Deficit

#### BankSurplus
- **Input**: shipId, year, amount
- **Output**: Bank entry record
- **Validation**: Amount must be positive and ≤ available CB

#### ApplyBanked
- **Input**: shipId, year, amount
- **Output**: Updated CB and bank entry
- **Validation**: Amount must be ≤ available banked balance

#### CreatePool
- **Input**: year, member list with shipIds
- **Output**: Pool record with member allocations
- **Algorithm**: Greedy allocation
  1. Sort members descending by CB
  2. Transfer surplus to deficits
  3. Validate constraints:
     - Sum(CB) ≥ 0
     - Deficit ships don't exit worse
     - Surplus ships don't exit negative

## Data Models

### Database Schema

#### routes Table
```sql
CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  route_id VARCHAR(50) UNIQUE NOT NULL,
  vessel_type VARCHAR(50) NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  ghg_intensity DECIMAL(10, 4) NOT NULL,
  fuel_consumption DECIMAL(10, 2) NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  total_emissions DECIMAL(10, 2) NOT NULL,
  is_baseline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### ship_compliance Table
```sql
CREATE TABLE ship_compliance (
  id SERIAL PRIMARY KEY,
  ship_id VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  cb_gco2eq DECIMAL(15, 2) NOT NULL,
  computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ship_id, year)
);
```

#### bank_entries Table
```sql
CREATE TABLE bank_entries (
  id SERIAL PRIMARY KEY,
  ship_id VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  amount_gco2eq DECIMAL(15, 2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'BANK' or 'APPLY'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### pools Table
```sql
CREATE TABLE pools (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### pool_members Table
```sql
CREATE TABLE pool_members (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER REFERENCES pools(id) ON DELETE CASCADE,
  ship_id VARCHAR(50) NOT NULL,
  cb_before DECIMAL(15, 2) NOT NULL,
  cb_after DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Domain Entities

#### Route Entity
```typescript
interface Route {
  id: number;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}
```

#### ComplianceBalance Entity
```typescript
interface ComplianceBalance {
  shipId: string;
  year: number;
  cbGco2eq: number;
  status: 'SURPLUS' | 'DEFICIT';
  computedAt: Date;
}
```

#### BankEntry Entity
```typescript
interface BankEntry {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  transactionType: 'BANK' | 'APPLY';
  createdAt: Date;
}
```

#### Pool Entity
```typescript
interface Pool {
  id: number;
  year: number;
  members: PoolMember[];
  createdAt: Date;
}

interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}
```

### Seed Data

The system will be seeded with the following five routes:

| routeId | vesselType | fuelType | year | ghgIntensity | fuelConsumption | distance | totalEmissions |
|---------|------------|----------|------|--------------|-----------------|----------|----------------|
| R001 | Container | HFO | 2024 | 91.0 | 5000 | 12000 | 4500 |
| R002 | BulkCarrier | LNG | 2024 | 88.0 | 4800 | 11500 | 4200 |
| R003 | Tanker | MGO | 2024 | 93.5 | 5100 | 12500 | 4700 |
| R004 | RoRo | HFO | 2025 | 89.2 | 4900 | 11800 | 4300 |
| R005 | Container | LNG | 2025 | 90.5 | 4950 | 11900 | 4400 |

One route (R002) will be set as baseline by default.

## Error Handling

### Frontend Error Handling

1. **API Communication Errors**:
   - Display user-friendly error messages in toast notifications
   - Implement retry logic for transient failures
   - Show loading states during API calls

2. **Validation Errors**:
   - Display inline validation messages for form inputs
   - Disable action buttons when validation fails
   - Provide clear feedback on why actions are disabled

3. **Business Rule Violations**:
   - Show specific error messages from backend
   - Highlight affected data in UI
   - Provide guidance on how to resolve issues

### Backend Error Handling

1. **HTTP Error Responses**:
   - 400 Bad Request: Invalid input or validation failures
   - 404 Not Found: Resource not found
   - 409 Conflict: Business rule violations
   - 500 Internal Server Error: Unexpected errors

2. **Error Response Format**:
```typescript
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}
```

3. **Business Rule Validation**:
   - Banking: Validate CB > 0 before banking
   - Banking: Validate amount ≤ available banked balance before applying
   - Pooling: Validate sum(CB) ≥ 0
   - Pooling: Validate deficit/surplus exit constraints

4. **Database Error Handling**:
   - Wrap database operations in try-catch blocks
   - Log errors for debugging
   - Return appropriate HTTP status codes
   - Use transactions for multi-step operations (pooling)

## Testing Strategy

### Frontend Testing

#### Unit Tests
- **Domain Logic**: Test calculation functions (percentDiff, compliance status)
- **Use Cases**: Test use case implementations with mocked repositories
- **Utilities**: Test helper functions and formatters

#### Component Tests
- **Routes Tab**: Test table rendering, filtering, baseline setting
- **Compare Tab**: Test comparison calculations, chart rendering, compliance indicators
- **Banking Tab**: Test CB display, button enabling/disabling, action calls
- **Pooling Tab**: Test member list, pool validation, creation flow

#### Integration Tests
- **API Client**: Test API client with mocked fetch responses
- **End-to-End Flows**: Test complete user workflows with MSW (Mock Service Worker)

### Backend Testing

#### Unit Tests
- **ComputeComparison**: Test percentage difference calculations and compliance flags
- **ComputeCB**: Test CB formula with various inputs
- **BankSurplus**: Test validation and bank entry creation
- **ApplyBanked**: Test application logic and balance updates
- **CreatePool**: Test greedy allocation algorithm and constraint validation

#### Integration Tests
- **Routes Endpoints**: Test GET /routes, POST /routes/:id/baseline, GET /routes/comparison
- **Compliance Endpoints**: Test CB computation and adjusted CB retrieval
- **Banking Endpoints**: Test banking and application flows
- **Pools Endpoints**: Test pool creation with various scenarios

#### Database Tests
- **Migrations**: Verify schema creation
- **Seeds**: Verify data loading
- **Repository Operations**: Test CRUD operations with test database

#### Edge Case Tests
- **Negative CB**: Verify banking is disabled
- **Over-apply Bank**: Verify validation prevents over-application
- **Invalid Pool**: Verify pool creation fails when sum(CB) < 0
- **Deficit Exit Worse**: Verify constraint enforcement
- **Surplus Exit Negative**: Verify constraint enforcement

### Testing Tools

- **Frontend**: Jest, React Testing Library, MSW
- **Backend**: Jest, Supertest, pg-mem (in-memory PostgreSQL)
- **E2E**: Playwright (optional for full integration)

### Test Coverage Goals

- Core domain logic: 100%
- Use cases: 90%+
- API endpoints: 90%+
- UI components: 80%+

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: TailwindCSS
- **State Management**: React hooks (useState, useContext)
- **HTTP Client**: Fetch API or Axios
- **Charts**: Recharts or Chart.js
- **Testing**: Jest, React Testing Library
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: Prisma or pg (node-postgres)
- **Testing**: Jest, Supertest
- **Validation**: Zod or Joi

### Development Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Version Control**: Git

## Deployment Considerations

### Frontend
- Build static assets with `npm run build`
- Deploy to static hosting (Vercel, Netlify, S3)
- Environment variables for API base URL

### Backend
- Containerize with Docker
- Deploy to cloud platform (AWS, GCP, Azure)
- Environment variables for database connection
- Database migrations on deployment

### Database
- Use managed PostgreSQL service
- Run migrations before deployment
- Seed data for demo/testing environments