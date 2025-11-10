# PostgreSQL Setup Guide for Windows

This guide will help you install and configure PostgreSQL on Windows to run the Fuel EU Maritime Compliance Platform.

## Option 1: Install PostgreSQL (Recommended)

### Step 1: Download PostgreSQL

1. Visit the official PostgreSQL download page: https://www.postgresql.org/download/windows/
2. Click on "Download the installer" (EDB installer)
3. Download the latest PostgreSQL 14+ version for Windows
4. Run the downloaded installer

### Step 2: Installation

1. **Select Components:**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (GUI tool)
   - ✅ Command Line Tools
   - ✅ Stack Builder (optional)

2. **Set Data Directory:**
   - Use default: `C:\Program Files\PostgreSQL\<version>\data`

3. **Set Password:**
   - Enter a password for the `postgres` superuser
   - **Remember this password!** You'll need it for the DATABASE_URL

4. **Set Port:**
   - Use default: `5432`

5. **Set Locale:**
   - Use default locale

6. **Complete Installation:**
   - Click "Next" through remaining screens
   - Wait for installation to complete

### Step 3: Add PostgreSQL to PATH

1. Open System Environment Variables:
   - Press `Win + X` and select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"

2. Edit PATH:
   - Under "System variables", find and select "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\PostgreSQL\<version>\bin`
   - Click "OK" on all dialogs

3. Verify Installation:
   - Open a new Command Prompt or PowerShell
   - Run: `psql --version`
   - Should display: `psql (PostgreSQL) 14.x` or higher

## Option 2: Use Docker (Alternative)

If you prefer Docker:

### Step 1: Install Docker Desktop

1. Download Docker Desktop for Windows: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop

### Step 2: Run PostgreSQL Container

```bash
docker run --name fueleu-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=fueleu_db -p 5432:5432 -d postgres:14
```

### Step 3: Verify Container

```bash
docker ps
```

You should see the `fueleu-postgres` container running.

## Database Setup

### Step 1: Create Database

**Using psql (Option 1):**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fueleu_db;

# Exit psql
\q
```

**Using createdb command:**
```bash
createdb -U postgres fueleu_db
```

**Using pgAdmin (GUI):**
1. Open pgAdmin 4
2. Connect to PostgreSQL server (localhost)
3. Right-click "Databases" → "Create" → "Database"
4. Name: `fueleu_db`
5. Click "Save"

### Step 2: Configure Backend .env

Edit `backend/.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fueleu_db
NODE_ENV=development
```

**Replace `yourpassword` with your actual PostgreSQL password!**

### Step 3: Run Migrations

```bash
cd backend
npm run migrate
```

Expected output:
```
Running migrations...
✓ 001_create_routes_table.sql
✓ 002_create_ship_compliance_table.sql
✓ 003_create_bank_entries_table.sql
✓ 004_create_pools_table.sql
✓ 005_create_pool_members_table.sql
Migrations completed successfully!
```

### Step 4: Seed Database

```bash
npm run seed
```

Expected output:
```
Seeding database...
✓ Inserted 5 routes
✓ Set R002 as baseline
Seeding completed successfully!
```

## Verify Database Setup

### Option 1: Using psql

```bash
# Connect to database
psql -U postgres -d fueleu_db

# List tables
\dt

# View routes
SELECT * FROM routes;

# Exit
\q
```

### Option 2: Using pgAdmin

1. Open pgAdmin 4
2. Navigate to: Servers → PostgreSQL → Databases → fueleu_db → Schemas → public → Tables
3. Right-click "routes" → "View/Edit Data" → "All Rows"
4. Verify 5 routes are present (R001-R005)

## Start the Application

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Fuel EU Maritime API server running on port 3000
📊 Health check: http://localhost:3000/health
🌍 Environment: development
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

### Test the Application

1. Open browser to: http://localhost:5173
2. You should see the Fuel EU Maritime Compliance Platform
3. Navigate through all four tabs:
   - Routes
   - Compare
   - Banking
   - Pooling

## Troubleshooting

### Issue: "psql: command not found"

**Solution:** PostgreSQL bin directory not in PATH
- Follow "Step 3: Add PostgreSQL to PATH" above
- Restart your terminal/command prompt

### Issue: "password authentication failed"

**Solution:** Incorrect password in DATABASE_URL
- Check your PostgreSQL password
- Update `backend/.env` with correct password
- Format: `postgresql://postgres:YOURPASSWORD@localhost:5432/fueleu_db`

### Issue: "database does not exist"

**Solution:** Database not created
- Run: `createdb -U postgres fueleu_db`
- Or create via pgAdmin

### Issue: "relation does not exist"

**Solution:** Migrations not run
- Run: `cd backend && npm run migrate`
- Verify migrations completed successfully

### Issue: "ECONNREFUSED" when starting backend

**Solution:** PostgreSQL not running
- Check if PostgreSQL service is running:
  - Open Services (Win + R, type `services.msc`)
  - Find "postgresql-x64-14" (or your version)
  - Ensure it's "Running"
  - If not, right-click and select "Start"

### Issue: Frontend can't connect to backend

**Solution:** Check CORS and API URL
- Verify backend is running on port 3000
- Check `frontend/.env` has: `VITE_API_BASE_URL=http://localhost:3000/api`
- Check backend CORS configuration allows localhost:5173

### Issue: Port 5432 already in use

**Solution:** Another PostgreSQL instance or service is running
- Stop other PostgreSQL instances
- Or change port in PostgreSQL configuration
- Update DATABASE_URL with new port

## Quick Reference

### PostgreSQL Commands

```bash
# Connect to database
psql -U postgres -d fueleu_db

# List databases
\l

# List tables
\dt

# Describe table
\d table_name

# View data
SELECT * FROM routes;

# Exit
\q
```

### Application Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run migrate      # Run migrations
npm run seed         # Seed database

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### Database Reset (if needed)

```bash
# Drop and recreate database
dropdb -U postgres fueleu_db
createdb -U postgres fueleu_db

# Run migrations and seed
cd backend
npm run migrate
npm run seed
```

## Next Steps

Once PostgreSQL is set up and the application is running:

1. Follow the **INTEGRATION_TEST_CHECKLIST.md** to manually test all functionality
2. Verify all four tabs work correctly
3. Test all user workflows
4. Verify data persistence

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- pgAdmin Documentation: https://www.pgadmin.org/docs/
- Node.js pg library: https://node-postgres.com/
- Project README: See `README.md` for API documentation and usage

---

**Need Help?**

If you encounter issues not covered in this guide:
1. Check PostgreSQL logs: `C:\Program Files\PostgreSQL\<version>\data\log\`
2. Check backend console output for error messages
3. Verify all environment variables are set correctly
4. Ensure all npm dependencies are installed
