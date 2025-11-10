# Fuel EU Maritime Compliance Platform

A full-stack application for managing and tracking compliance with EU maritime fuel regulations.

## Project Structure

```
.
├── backend/          # Node.js + TypeScript + PostgreSQL backend API
├── frontend/         # React + TypeScript + TailwindCSS frontend dashboard
└── .kiro/           # Kiro spec files
```

## Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters pattern) for both frontend and backend:

- **Core Domain**: Business logic and entities (framework-independent)
- **Application Layer**: Use cases and business workflows
- **Ports**: Interface definitions for inbound and outbound communication
- **Adapters**: Framework-specific implementations (Express, React, PostgreSQL)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed
npm run dev
```

Backend runs on http://localhost:3000

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on http://localhost:5173

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Features

- **Routes Management**: View and manage vessel route data with filtering
- **Compliance Comparison**: Compare baseline routes against targets
- **Banking**: Manage compliance balance banking (Fuel EU Article 20)
- **Pooling**: Create and manage pooling arrangements (Fuel EU Article 21)

## Documentation

- [Requirements](.kiro/specs/fueleu-maritime-platform/requirements.md)
- [Design](.kiro/specs/fueleu-maritime-platform/design.md)
- [Tasks](.kiro/specs/fueleu-maritime-platform/tasks.md)
