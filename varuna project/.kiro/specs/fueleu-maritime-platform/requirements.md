# Requirements Document

## Introduction

The Fuel EU Maritime compliance platform is a full-stack application that helps shipping companies manage and track their compliance with EU maritime fuel regulations. The system provides route management, compliance balance calculations, banking functionality, and pooling capabilities through a React frontend dashboard and Node.js backend APIs.

## Glossary

- **Fuel_EU_Platform**: The complete full-stack application system
- **Compliance_Balance (CB)**: Calculated value representing surplus or deficit in gCO₂e emissions
- **Banking_System**: Functionality allowing storage and application of positive compliance balance
- **Pooling_System**: Functionality allowing multiple ships to combine compliance balances
- **Route_Management**: System for managing vessel route data and baseline comparisons
- **Dashboard**: React-based frontend user interface
- **Backend_API**: Node.js REST API service
- **Target_Intensity**: Reference value of 89.3368 gCO₂e/MJ (2% below 91.16)

## Requirements

### Requirement 1

**User Story:** As a compliance officer, I want to view and manage vessel route data, so that I can track fuel consumption and emissions across different routes.

#### Acceptance Criteria

1. WHEN accessing the routes tab, THE Fuel_EU_Platform SHALL display all routes with routeId, vesselType, fuelType, year, ghgIntensity, fuelConsumption, distance, and totalEmissions
2. WHEN clicking "Set Baseline" button, THE Fuel_EU_Platform SHALL call POST /routes/:routeId/baseline endpoint
3. WHERE filtering is applied, THE Fuel_EU_Platform SHALL filter routes by vesselType, fuelType, and year
4. THE Backend_API SHALL provide GET /routes endpoint returning all route data
5. THE Backend_API SHALL provide POST /routes/:id/baseline endpoint to set baseline routes

### Requirement 2

**User Story:** As a compliance officer, I want to compare baseline routes with other routes, so that I can assess compliance performance against targets.

#### Acceptance Criteria

1. WHEN accessing the compare tab, THE Fuel_EU_Platform SHALL fetch baseline and comparison data from /routes/comparison endpoint
2. THE Fuel_EU_Platform SHALL display comparison table with ghgIntensity, percentage difference, and compliant status
3. THE Fuel_EU_Platform SHALL calculate percentage difference using formula: ((comparison / baseline) − 1) × 100
4. THE Fuel_EU_Platform SHALL display visual chart comparing ghgIntensity values between baseline and comparison routes
5. THE Fuel_EU_Platform SHALL mark routes as compliant when ghgIntensity is below Target_Intensity of 89.3368 gCO₂e/MJ

### Requirement 3

**User Story:** As a compliance officer, I want to manage compliance balance banking, so that I can store positive balances and apply them to future deficits according to Fuel EU Article 20.

#### Acceptance Criteria

1. WHEN accessing banking tab, THE Fuel_EU_Platform SHALL display current compliance balance from GET /compliance/cb endpoint
2. WHERE compliance balance is positive, THE Fuel_EU_Platform SHALL enable banking actions
3. WHEN banking positive balance, THE Fuel_EU_Platform SHALL call POST /banking/bank endpoint
4. WHEN applying banked surplus, THE Fuel_EU_Platform SHALL call POST /banking/apply endpoint
5. IF compliance balance is zero or negative, THEN THE Fuel_EU_Platform SHALL disable banking actions and display appropriate error messages

### Requirement 4

**User Story:** As a compliance officer, I want to create and manage pooling arrangements, so that I can combine compliance balances across multiple ships according to Fuel EU Article 21.

#### Acceptance Criteria

1. WHEN accessing pooling tab, THE Fuel_EU_Platform SHALL fetch adjusted compliance balance per ship from GET /compliance/adjusted-cb endpoint
2. THE Fuel_EU_Platform SHALL validate that sum of adjusted compliance balances is greater than or equal to zero
3. WHERE deficit ship exists in pool, THE Fuel_EU_Platform SHALL ensure ship cannot exit with worse balance
4. WHERE surplus ship exists in pool, THE Fuel_EU_Platform SHALL ensure ship cannot exit with negative balance
5. WHEN creating pool, THE Fuel_EU_Platform SHALL call POST /pools endpoint with member data

### Requirement 5

**User Story:** As a system administrator, I want the backend to calculate compliance balances accurately, so that compliance tracking is mathematically correct.

#### Acceptance Criteria

1. THE Backend_API SHALL calculate compliance balance using formula: (Target_Intensity - Actual_Intensity) × Energy_in_scope
2. THE Backend_API SHALL use Target_Intensity value of 89.3368 gCO₂e/MJ
3. THE Backend_API SHALL calculate Energy_in_scope as fuelConsumption × 41000 MJ/t
4. WHERE compliance balance is positive, THE Backend_API SHALL classify as surplus
5. WHERE compliance balance is negative, THE Backend_API SHALL classify as deficit

### Requirement 6

**User Story:** As a developer, I want the system to follow hexagonal architecture, so that the codebase is maintainable and testable.

#### Acceptance Criteria

1. THE Fuel_EU_Platform SHALL implement hexagonal architecture with core domain separated from adapters
2. THE Dashboard SHALL implement UI adapters that use React components without core domain dependencies
3. THE Backend_API SHALL implement ports and adapters pattern with dependency inversion
4. THE Backend_API SHALL isolate framework dependencies (Express, Prisma) to adapter layers
5. THE Fuel_EU_Platform SHALL maintain clear separation between inbound and outbound ports

### Requirement 7

**User Story:** As a developer, I want comprehensive database schema and API endpoints, so that all functionality is properly supported by data persistence.

#### Acceptance Criteria

1. THE Backend_API SHALL implement routes table with id, route_id, year, ghg_intensity, is_baseline columns
2. THE Backend_API SHALL implement ship_compliance table with id, ship_id, year, cb_gco2eq columns
3. THE Backend_API SHALL implement bank_entries table with id, ship_id, year, amount_gco2eq columns
4. THE Backend_API SHALL implement pools and pool_members tables for pooling functionality
5. THE Backend_API SHALL provide all specified REST endpoints for routes, compliance, banking, and pooling operations

### Requirement 8

**User Story:** As a developer, I want to document AI agent usage throughout development, so that the development process and tool effectiveness can be evaluated.

#### Acceptance Criteria

1. THE development process SHALL produce AGENT_WORKFLOW.md documenting all AI agent usage
2. THE AGENT_WORKFLOW.md SHALL include exact prompts and generated outputs
3. THE AGENT_WORKFLOW.md SHALL document validation and correction processes
4. THE development process SHALL produce REFLECTION.md with lessons learned about AI agent efficiency
5. THE documentation SHALL include observations about where agents saved time and where they failed