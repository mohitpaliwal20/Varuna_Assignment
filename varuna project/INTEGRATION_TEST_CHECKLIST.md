# Integration Test Checklist

This document provides a comprehensive checklist for manually testing the Fuel EU Maritime Compliance Platform end-to-end.

## Prerequisites

Before starting integration testing, ensure:

- [ ] PostgreSQL 14+ is installed and running
- [ ] Node.js 18+ is installed
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Backend `.env` file configured with correct DATABASE_URL
- [ ] Frontend `.env` file configured with correct VITE_API_BASE_URL
- [ ] Database created (`createdb fueleu_db`)
- [ ] Migrations run (`cd backend && npm run migrate`)
- [ ] Seed data loaded (`cd backend && npm run seed`)

## Build Verification

### Backend Build
- [ ] Run `cd backend && npm run build`
- [ ] Verify no TypeScript compilation errors
- [ ] Check `backend/dist` folder is created with compiled JavaScript

### Frontend Build
- [ ] Run `cd frontend && npm run build`
- [ ] Verify no TypeScript compilation errors
- [ ] Check `frontend/dist` folder is created with bundled assets

## Test Execution

### Backend Tests
- [ ] Run `cd backend && npm test`
- [ ] Verify all tests pass (or pass with no tests if tests are optional)
- [ ] Check test coverage report if available

### Frontend Tests
- [ ] Run `cd frontend && npm test`
- [ ] Verify all tests pass (or pass with no tests if tests are optional)
- [ ] Check test coverage report if available

## Development Server Startup

### Backend Server
- [ ] Open Terminal 1
- [ ] Run `cd backend && npm run dev`
- [ ] Verify server starts on port 3000 (or configured PORT)
- [ ] Check console output shows: "🚀 Fuel EU Maritime API server running on port 3000"
- [ ] Verify no database connection errors
- [ ] Test health endpoint: `curl http://localhost:3000/health` or visit in browser

### Frontend Server
- [ ] Open Terminal 2
- [ ] Run `cd frontend && npm run dev`
- [ ] Verify Vite dev server starts (typically on port 5173)
- [ ] Check console output shows local and network URLs
- [ ] Open browser to displayed URL (e.g., http://localhost:5173)
- [ ] Verify application loads without console errors

## End-to-End Functional Testing

### 1. Routes Tab Testing (Requirement 1.1)

#### View Routes
- [ ] Navigate to Routes tab
- [ ] Verify table displays all 5 seeded routes (R001-R005)
- [ ] Verify all columns are displayed:
  - [ ] Route ID
  - [ ] Vessel Type
  - [ ] Fuel Type
  - [ ] Year
  - [ ] GHG Intensity (gCO₂e/MJ)
  - [ ] Fuel Consumption (tonnes)
  - [ ] Distance (nautical miles)
  - [ ] Total Emissions (tonnes CO₂e)
- [ ] Verify R002 is marked as baseline (if default seed sets it)

#### Filter Routes (Requirement 1.3)
- [ ] Test vessel type filter:
  - [ ] Select "Container" - verify only container vessels shown
  - [ ] Select "BulkCarrier" - verify only bulk carriers shown
  - [ ] Clear filter - verify all routes shown again
- [ ] Test fuel type filter:
  - [ ] Select "HFO" - verify only HFO routes shown
  - [ ] Select "LNG" - verify only LNG routes shown
  - [ ] Select "MGO" - verify only MGO routes shown
  - [ ] Clear filter - verify all routes shown again
- [ ] Test year filter:
  - [ ] Select "2024" - verify only 2024 routes shown
  - [ ] Select "2025" - verify only 2025 routes shown
  - [ ] Clear filter - verify all routes shown again
- [ ] Test combined filters (e.g., Container + HFO + 2024)

#### Set Baseline (Requirement 1.2)
- [ ] Click "Set Baseline" button on route R001
- [ ] Verify success message appears
- [ ] Verify R001 is now marked as baseline
- [ ] Verify previous baseline (R002) is no longer marked as baseline
- [ ] Set R002 back as baseline for comparison testing

### 2. Compare Tab Testing (Requirement 2.1, 2.2, 2.5)

#### View Comparison Data
- [ ] Navigate to Compare tab
- [ ] Verify baseline route information is displayed (R002)
- [ ] Verify comparison route information is displayed
- [ ] Check comparison table shows:
  - [ ] Baseline GHG Intensity: 88.0 gCO₂e/MJ
  - [ ] Comparison GHG Intensity
  - [ ] Percentage Difference calculated correctly
  - [ ] Compliance status (✅ or ❌)

#### Verify Calculations (Requirement 2.3)
- [ ] Calculate expected percentage difference manually:
  - Formula: ((comparison / baseline) - 1) × 100
  - Example: R001 vs R002: ((91.0 / 88.0) - 1) × 100 = 3.41%
- [ ] Verify displayed percentage matches calculation
- [ ] Verify compliance status:
  - [ ] Routes with GHG intensity < 89.3368 show ✅ (compliant)
  - [ ] Routes with GHG intensity ≥ 89.3368 show ❌ (non-compliant)

#### View Comparison Chart (Requirement 2.4)
- [ ] Verify chart is displayed
- [ ] Check chart shows baseline vs comparison GHG intensity
- [ ] Verify chart is readable and properly labeled
- [ ] Test chart interactivity (hover, tooltips if implemented)

### 3. Banking Tab Testing (Requirement 3.1, 3.3, 3.4, 3.5)

#### View Compliance Balance (Requirement 3.1)
- [ ] Navigate to Banking tab
- [ ] Verify current compliance balance is displayed
- [ ] Check KPIs are shown:
  - [ ] CB Before
  - [ ] Applied Amount
  - [ ] CB After

#### Bank Positive Balance (Requirement 3.3)
- [ ] If CB is positive:
  - [ ] Verify "Bank Positive CB" button is enabled
  - [ ] Enter amount to bank (e.g., 1000000 gCO₂e)
  - [ ] Click "Bank Positive CB" button
  - [ ] Verify success message appears
  - [ ] Verify banking record is created
  - [ ] Verify available banked balance increases
- [ ] If CB is negative or zero:
  - [ ] Verify "Bank Positive CB" button is disabled
  - [ ] Verify appropriate error message is displayed

#### Apply Banked Surplus (Requirement 3.4)
- [ ] Ensure there is banked balance available
- [ ] Enter amount to apply (e.g., 500000 gCO₂e)
- [ ] Click "Apply Banked Surplus" button
- [ ] Verify success message appears
- [ ] Verify CB is updated (deficit reduced)
- [ ] Verify banked balance decreases

#### Validation Testing (Requirement 3.5)
- [ ] Try to bank negative amount:
  - [ ] Verify error message: "Cannot bank negative or zero balance"
- [ ] Try to apply more than available banked balance:
  - [ ] Verify error message: "Insufficient banked balance"
- [ ] Try to bank amount greater than current CB:
  - [ ] Verify error message or validation prevents this

### 4. Pooling Tab Testing (Requirement 4.1, 4.2, 4.3, 4.4, 4.5)

#### View Ships with Adjusted CB (Requirement 4.1)
- [ ] Navigate to Pooling tab
- [ ] Verify list of ships is displayed
- [ ] Check each ship shows:
  - [ ] Ship ID
  - [ ] Adjusted Compliance Balance
  - [ ] CB Before
  - [ ] CB After (initially same as before)

#### Create Valid Pool (Requirement 4.5)
- [ ] Select ships for pool:
  - [ ] Select at least one ship with positive CB (surplus)
  - [ ] Select at least one ship with negative CB (deficit)
  - [ ] Ensure sum of selected CBs ≥ 0
- [ ] Verify pool sum indicator shows green (valid)
- [ ] Verify "Create Pool" button is enabled
- [ ] Click "Create Pool" button
- [ ] Verify success message appears
- [ ] Verify pool is created with correct allocations
- [ ] Check greedy allocation results:
  - [ ] Surplus transferred to deficits
  - [ ] Deficit ships improved (CB increased)
  - [ ] Surplus ships reduced but not negative

#### Pool Validation Testing (Requirement 4.2, 4.3, 4.4)
- [ ] Test invalid pool (sum < 0):
  - [ ] Select only ships with negative CB
  - [ ] Verify pool sum indicator shows red (invalid)
  - [ ] Verify "Create Pool" button is disabled
  - [ ] Verify error message: "Pool total compliance balance must be non-negative"
- [ ] Test deficit ship exit constraint:
  - [ ] Create pool where deficit ship would exit worse
  - [ ] Verify validation prevents this
  - [ ] Verify error message displayed
- [ ] Test surplus ship exit constraint:
  - [ ] Create pool where surplus ship would exit negative
  - [ ] Verify validation prevents this
  - [ ] Verify error message displayed

## API Endpoint Testing

### Routes Endpoints
- [ ] GET /routes
  - [ ] Returns all routes
  - [ ] Status code: 200
- [ ] POST /routes/:id/baseline
  - [ ] Sets baseline successfully
  - [ ] Status code: 200
- [ ] GET /routes/comparison
  - [ ] Returns baseline and comparison data
  - [ ] Includes percentDiff and compliant flags
  - [ ] Status code: 200

### Compliance Endpoints
- [ ] GET /compliance/cb?shipId=SHIP001&year=2024
  - [ ] Returns compliance balance
  - [ ] Includes status (SURPLUS/DEFICIT)
  - [ ] Status code: 200
- [ ] GET /compliance/adjusted-cb?shipId=SHIP001&year=2024
  - [ ] Returns adjusted CB after banking
  - [ ] Status code: 200

### Banking Endpoints
- [ ] GET /banking/records?shipId=SHIP001&year=2024
  - [ ] Returns banking transaction history
  - [ ] Status code: 200
- [ ] POST /banking/bank
  - [ ] Banks positive balance successfully
  - [ ] Returns 400 for invalid requests
- [ ] POST /banking/apply
  - [ ] Applies banked surplus successfully
  - [ ] Returns 400 for insufficient balance

### Pools Endpoints
- [ ] POST /pools
  - [ ] Creates pool successfully with valid data
  - [ ] Returns 409 for invalid pool (sum < 0)
  - [ ] Returns 400 for constraint violations

## Error Handling Testing

### Frontend Error Handling
- [ ] Stop backend server
- [ ] Try to perform actions in frontend
- [ ] Verify user-friendly error messages appear
- [ ] Verify no application crashes
- [ ] Restart backend and verify recovery

### Backend Error Handling
- [ ] Test with invalid request data
- [ ] Verify appropriate HTTP status codes
- [ ] Verify error response format is consistent
- [ ] Check error messages are descriptive

## Performance Testing

### Load Time
- [ ] Measure initial page load time (should be < 3 seconds)
- [ ] Measure route data fetch time (should be < 1 second)
- [ ] Measure comparison calculation time (should be instant)

### Responsiveness
- [ ] Test on desktop browser (1920x1080)
- [ ] Test on tablet size (768x1024)
- [ ] Test on mobile size (375x667)
- [ ] Verify all tabs are usable on all screen sizes

## Browser Compatibility

- [ ] Test on Chrome/Edge (Chromium)
- [ ] Test on Firefox
- [ ] Test on Safari (if available)
- [ ] Verify consistent behavior across browsers

## Data Persistence Testing

- [ ] Create banking transaction
- [ ] Refresh browser
- [ ] Verify transaction persists
- [ ] Create pool
- [ ] Refresh browser
- [ ] Verify pool data persists
- [ ] Restart backend server
- [ ] Verify all data persists in database

## Cleanup and Reset

- [ ] Test database reset:
  ```bash
  dropdb fueleu_db
  createdb fueleu_db
  cd backend && npm run migrate && npm run seed
  ```
- [ ] Verify application works with fresh database

## Sign-Off

### Test Summary
- Total test cases: ___
- Passed: ___
- Failed: ___
- Blocked: ___

### Critical Issues Found
1. 
2. 
3. 

### Non-Critical Issues Found
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 

### Tester Information
- Name: _______________
- Date: _______________
- Environment: _______________
- Browser: _______________
- OS: _______________

### Approval
- [ ] All critical functionality works as expected
- [ ] All requirements are met
- [ ] Application is ready for deployment/demo

**Signature:** _______________ **Date:** _______________
