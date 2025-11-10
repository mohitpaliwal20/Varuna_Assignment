# Quick Start Guide

Get the Fuel EU Maritime Compliance Platform up and running in minutes!

## Prerequisites Check

Before you begin, verify you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] PostgreSQL 14+ installed (`psql --version`)

**Don't have PostgreSQL?** See [POSTGRESQL_SETUP_WINDOWS.md](POSTGRESQL_SETUP_WINDOWS.md) for installation instructions.

## 5-Minute Setup

### 1. Install Dependencies (2 minutes)

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 2. Setup Database (2 minutes)

```bash
# Create database
createdb -U postgres fueleu_db

# Run migrations
cd backend
npm run migrate

# Seed with sample data
npm run seed
```

**Note:** You'll be prompted for your PostgreSQL password.

### 3. Configure Environment (30 seconds)

Backend `.env` is already configured. Just verify the password:

```env
# backend/.env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fueleu_db
```

Replace `yourpassword` with your actual PostgreSQL password.

Frontend `.env` is already configured:

```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Start the Application (30 seconds)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Wait for: `🚀 Fuel EU Maritime API server running on port 3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait for: `➜  Local:   http://localhost:5173/`

### 5. Open in Browser

Visit: **http://localhost:5173**

You should see the Fuel EU Maritime Compliance Platform with 4 tabs:
- 🚢 Routes
- 📊 Compare
- 💰 Banking
- 🤝 Pooling

## Quick Test

### Test Routes Tab
1. Click on "Routes" tab
2. You should see 5 routes (R001-R005)
3. Try filtering by vessel type or fuel type
4. Click "Set Baseline" on any route

### Test Compare Tab
1. Click on "Compare" tab
2. You should see baseline vs comparison data
3. Check the percentage difference
4. Look for ✅ (compliant) or ❌ (non-compliant) indicators
5. View the comparison chart

### Test Banking Tab
1. Click on "Banking" tab
2. View the current compliance balance
3. If positive, try banking some balance
4. Try applying banked surplus

### Test Pooling Tab
1. Click on "Pooling" tab
2. View ships with their compliance balances
3. Select multiple ships to create a pool
4. Watch the pool sum indicator (green = valid, red = invalid)
5. Create a pool if valid

## Troubleshooting

### "psql: command not found"
- PostgreSQL not installed or not in PATH
- See [POSTGRESQL_SETUP_WINDOWS.md](POSTGRESQL_SETUP_WINDOWS.md)

### "password authentication failed"
- Wrong password in `backend/.env`
- Update `DATABASE_URL` with correct password

### "database does not exist"
- Run: `createdb -U postgres fueleu_db`

### "relation does not exist"
- Migrations not run
- Run: `cd backend && npm run migrate`

### Backend won't start
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `backend/.env`
- Check port 3000 is not in use

### Frontend can't connect
- Verify backend is running on port 3000
- Check `VITE_API_BASE_URL` in `frontend/.env`
- Check browser console for errors

## What's Next?

### Full Testing
Follow [INTEGRATION_TEST_CHECKLIST.md](INTEGRATION_TEST_CHECKLIST.md) for comprehensive testing.

### API Testing
See [README.md](README.md) for API documentation and example requests.

### Development
- Backend code: `backend/src/`
- Frontend code: `frontend/src/`
- Database migrations: `backend/src/infrastructure/db/migrations/`

## Key Features

### Routes Management
- View all vessel routes
- Filter by vessel type, fuel type, year
- Set baseline for comparison

### Route Comparison
- Compare routes against baseline
- Calculate percentage differences
- Check compliance status
- Visual charts

### Banking System (Article 20)
- Bank positive compliance balance
- Apply banked surplus to deficits
- Track banking transactions

### Pooling System (Article 21)
- Create pools with multiple ships
- Greedy allocation algorithm
- Validate pool constraints
- Transfer surplus to deficits

## Architecture

The application follows **Hexagonal Architecture**:

```
Core Domain (Business Logic)
    ↓
Ports (Interfaces)
    ↓
Adapters (Implementation)
    ↓
Infrastructure (Frameworks)
```

This ensures:
- Clean separation of concerns
- Easy testing
- Framework independence
- Maintainability

## Support

- **Setup Issues:** See [POSTGRESQL_SETUP_WINDOWS.md](POSTGRESQL_SETUP_WINDOWS.md)
- **Testing Guide:** See [INTEGRATION_TEST_CHECKLIST.md](INTEGRATION_TEST_CHECKLIST.md)
- **API Documentation:** See [README.md](README.md)
- **Task Summary:** See [TASK_23_COMPLETION_SUMMARY.md](TASK_23_COMPLETION_SUMMARY.md)

## Commands Reference

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production server
npm test         # Run tests
npm run migrate  # Run database migrations
npm run seed     # Seed database
npm run lint     # Lint code
npm run format   # Format code
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm test         # Run tests
npm run lint     # Lint code
npm run format   # Format code
```

### Database
```bash
createdb -U postgres fueleu_db           # Create database
dropdb -U postgres fueleu_db             # Drop database
psql -U postgres -d fueleu_db            # Connect to database
psql -U postgres -d fueleu_db -c "SELECT * FROM routes;"  # Query
```

---

**Ready to go!** 🚀

If you encounter any issues, check the troubleshooting section above or refer to the detailed documentation.
