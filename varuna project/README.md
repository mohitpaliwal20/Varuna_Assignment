# Fuel EU Maritime Compliance Platform

A full-stack application for managing compliance with EU maritime fuel regulations, implementing Article 20 (Banking) and Article 21 (Pooling) of the Fuel EU Maritime regulation.

## Overview

The Fuel EU Maritime compliance platform helps shipping companies track and manage their compliance with EU maritime fuel regulations. The system provides:

- **Route Management**: Track vessel routes with fuel consumption and emissions data
- **Compliance Balance Calculation**: Compute compliance balance (CB) based on target vs actual GHG intensity
- **Banking System**: Store positive compliance balances and apply them to future deficits (Article 20)
- **Pooling System**: Combine compliance balances across multiple ships (Article 21)

## Architecture

The application follows **Hexagonal Architecture** (Ports & Adapters pattern) to ensure clean separation of concerns, testability, and maintainability.

### Frontend Architecture

```
frontend/
├── src/
│   ├── core/
│   │   ├── domain/           # Domain entities (Route, ComplianceBalance, etc.)
│   │   ├── application/      # Use cases (FetchRoutes, CompareRoutes, etc.)
│   │   └── ports/            # Interface definitions (inbound/outbound)
│   ├── adapters/
│   │   ├── ui/               # React components (RoutesTab, CompareTab, etc.)
│   │   └── infrastructure/   # API client
│   └── shared/               # Shared utilities and types
```

### Backend Architecture

```
backend/
├── src/
│   ├── core/
│   │   ├── domain/           # Domain entities
│   │   ├── application/      # Use cases (ComputeCB, CreatePool, etc.)
│   │   └── ports/            # Interface definitions
│   ├── adapters/
│   │   ├── inbound/http/     # Express controllers
│   │   └── outbound/postgres/# Repository implementations
│   ├── infrastructure/
│   │   ├── db/               # Database migrations and seeds
│   │   └── server/           # Express server setup
│   └── shared/               # Shared utilities
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Build Tool**: Vite
- **Testing**: Jest, React Testing Library

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: pg (node-postgres)
- **Validation**: Zod
- **Testing**: Jest, Supertest

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fueleu-maritime-platform
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# Example:
# DATABASE_URL=postgresql://user:password@localhost:5432/fueleu_db
# PORT=3000

# Create database
createdb fueleu_db

# Run migrations
npm run migrate

# Seed database with sample routes
npm run seed
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with backend API URL
# Example:
# VITE_API_BASE_URL=http://localhost:3000
```

## Running the Application

### Development Mode

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```
Server will start on `http://localhost:3000`

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
Application will open on `http://localhost:5173`

### Production Build

**Backend**:
```bash
cd backend
npm run build
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
npm run preview
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Routes Endpoints

#### Get All Routes
```http
GET /routes
```

**Response**:
```json
[
  {
    "id": 1,
    "routeId": "R001",
    "vesselType": "Container",
    "fuelType": "HFO",
    "year": 2024,
    "ghgIntensity": 91.0,
    "fuelConsumption": 5000,
    "distance": 12000,
    "totalEmissions": 4500,
    "isBaseline": false
  }
]
```

#### Set Baseline Route
```http
POST /routes/:id/baseline
```

**Response**:
```json
{
  "message": "Baseline set successfully",
  "routeId": "R002"
}
```

#### Get Route Comparison
```http
GET /routes/comparison
```

**Response**:
```json
{
  "baseline": {
    "routeId": "R002",
    "ghgIntensity": 88.0,
    "vesselType": "BulkCarrier",
    "fuelType": "LNG",
    "year": 2024
  },
  "comparison": {
    "routeId": "R001",
    "ghgIntensity": 91.0,
    "vesselType": "Container",
    "fuelType": "HFO",
    "year": 2024
  },
  "percentDiff": 3.41,
  "compliant": false
}
```

### Compliance Endpoints

#### Get Compliance Balance
```http
GET /compliance/cb?shipId=SHIP001&year=2024
```

**Response**:
```json
{
  "shipId": "SHIP001",
  "year": 2024,
  "cbGco2eq": -6831200.0,
  "status": "DEFICIT",
  "computedAt": "2024-01-15T10:30:00Z"
}
```

#### Get Adjusted Compliance Balance
```http
GET /compliance/adjusted-cb?shipId=SHIP001&year=2024
```

**Response**:
```json
{
  "shipId": "SHIP001",
  "year": 2024,
  "adjustedCbGco2eq": -3415600.0,
  "cbBefore": -6831200.0,
  "applied": 3415600.0
}
```

### Banking Endpoints

#### Get Banking Records
```http
GET /banking/records?shipId=SHIP001&year=2024
```

**Response**:
```json
[
  {
    "id": 1,
    "shipId": "SHIP001",
    "year": 2024,
    "amountGco2eq": 5000000.0,
    "transactionType": "BANK",
    "createdAt": "2024-01-10T08:00:00Z"
  },
  {
    "id": 2,
    "shipId": "SHIP001",
    "year": 2024,
    "amountGco2eq": -2000000.0,
    "transactionType": "APPLY",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

#### Bank Positive Balance
```http
POST /banking/bank
Content-Type: application/json

{
  "shipId": "SHIP001",
  "year": 2024,
  "amount": 5000000.0
}
```

**Response**:
```json
{
  "message": "Balance banked successfully",
  "entry": {
    "id": 3,
    "shipId": "SHIP001",
    "year": 2024,
    "amountGco2eq": 5000000.0,
    "transactionType": "BANK",
    "createdAt": "2024-01-20T14:30:00Z"
  }
}
```

**Error Response** (400):
```json
{
  "error": "Validation Error",
  "message": "Cannot bank negative or zero balance"
}
```

#### Apply Banked Surplus
```http
POST /banking/apply
Content-Type: application/json

{
  "shipId": "SHIP001",
  "year": 2024,
  "amount": 2000000.0
}
```

**Response**:
```json
{
  "message": "Banked surplus applied successfully",
  "entry": {
    "id": 4,
    "shipId": "SHIP001",
    "year": 2024,
    "amountGco2eq": -2000000.0,
    "transactionType": "APPLY",
    "createdAt": "2024-01-22T09:15:00Z"
  }
}
```

**Error Response** (400):
```json
{
  "error": "Validation Error",
  "message": "Insufficient banked balance"
}
```

### Pools Endpoints

#### Create Pool
```http
POST /pools
Content-Type: application/json

{
  "year": 2024,
  "members": [
    {
      "shipId": "SHIP001",
      "cbBefore": 10000000.0
    },
    {
      "shipId": "SHIP002",
      "cbBefore": -5000000.0
    },
    {
      "shipId": "SHIP003",
      "cbBefore": -3000000.0
    }
  ]
}
```

**Response**:
```json
{
  "message": "Pool created successfully",
  "pool": {
    "id": 1,
    "year": 2024,
    "members": [
      {
        "shipId": "SHIP001",
        "cbBefore": 10000000.0,
        "cbAfter": 2000000.0
      },
      {
        "shipId": "SHIP002",
        "cbBefore": -5000000.0,
        "cbAfter": 0.0
      },
      {
        "shipId": "SHIP003",
        "cbBefore": -3000000.0,
        "cbAfter": 0.0
      }
    ],
    "createdAt": "2024-01-25T11:00:00Z"
  }
}
```

**Error Response** (409):
```json
{
  "error": "Pool Validation Error",
  "message": "Pool total compliance balance must be non-negative"
}
```

## Database Schema

### routes
- `id`: Serial primary key
- `route_id`: Unique route identifier (e.g., "R001")
- `vessel_type`: Type of vessel (e.g., "Container", "Tanker")
- `fuel_type`: Type of fuel (e.g., "HFO", "LNG", "MGO")
- `year`: Year of operation
- `ghg_intensity`: GHG intensity in gCO₂e/MJ
- `fuel_consumption`: Fuel consumption in tonnes
- `distance`: Distance traveled in nautical miles
- `total_emissions`: Total emissions in tonnes CO₂e
- `is_baseline`: Boolean flag for baseline route
- `created_at`: Timestamp

### ship_compliance
- `id`: Serial primary key
- `ship_id`: Ship identifier
- `year`: Year
- `cb_gco2eq`: Compliance balance in gCO₂e
- `computed_at`: Timestamp
- Unique constraint on (ship_id, year)

### bank_entries
- `id`: Serial primary key
- `ship_id`: Ship identifier
- `year`: Year
- `amount_gco2eq`: Amount in gCO₂e (positive for BANK, negative for APPLY)
- `transaction_type`: 'BANK' or 'APPLY'
- `created_at`: Timestamp

### pools
- `id`: Serial primary key
- `year`: Year
- `created_at`: Timestamp

### pool_members
- `id`: Serial primary key
- `pool_id`: Foreign key to pools table
- `ship_id`: Ship identifier
- `cb_before`: Compliance balance before pooling
- `cb_after`: Compliance balance after pooling
- `created_at`: Timestamp

## Key Formulas

### Compliance Balance (CB)
```
Energy_in_scope = fuelConsumption × 41,000 MJ/t
CB = (Target_Intensity - Actual_Intensity) × Energy_in_scope

Where:
- Target_Intensity = 89.3368 gCO₂e/MJ (2% below 91.16)
- Actual_Intensity = ghgIntensity from route data
- Positive CB = Surplus
- Negative CB = Deficit
```

### Route Comparison Percentage Difference
```
percentDiff = ((comparison_ghgIntensity / baseline_ghgIntensity) - 1) × 100
```

### Compliance Status
```
compliant = ghgIntensity < Target_Intensity (89.3368 gCO₂e/MJ)
```

## Features

### Routes Tab
- View all vessel routes with filtering by vessel type, fuel type, and year
- Set baseline route for comparison
- Display route details including GHG intensity, fuel consumption, and emissions

### Compare Tab
- Compare baseline route against other routes
- Visual chart showing GHG intensity comparison
- Percentage difference calculation
- Compliance status indicators (✅ compliant / ❌ non-compliant)

### Banking Tab
- Display current compliance balance
- Bank positive compliance balance for future use
- Apply banked surplus to current deficit
- KPI display: CB before, applied amount, CB after
- Conditional button enabling based on balance status

### Pooling Tab
- View ships with adjusted compliance balances
- Create pooling arrangements with multiple ships
- Greedy allocation algorithm for surplus distribution
- Pool validation:
  - Total pool CB must be ≥ 0
  - Deficit ships cannot exit worse
  - Surplus ships cannot exit negative
- Visual indicators for pool viability (red/green)

## Development

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Database Management

```bash
# Run migrations
npm run migrate

# Seed database
npm run seed

# Reset database (drop and recreate)
dropdb fueleu_db
createdb fueleu_db
npm run migrate
npm run seed
```

## Troubleshooting

### Backend won't start
- Verify PostgreSQL is running: `pg_isready`
- Check database connection in `.env`
- Ensure migrations have been run: `npm run migrate`

### Frontend can't connect to backend
- Verify backend is running on correct port
- Check `VITE_API_BASE_URL` in frontend `.env`
- Check CORS configuration in backend

### Database errors
- Ensure database exists: `createdb fueleu_db`
- Run migrations: `npm run migrate`
- Check PostgreSQL logs for detailed errors

## Contributing

1. Follow hexagonal architecture principles
2. Maintain separation between core domain and adapters
3. Write tests for new features
4. Use TypeScript strict mode
5. Follow ESLint and Prettier configurations
6. Update documentation for API changes

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
