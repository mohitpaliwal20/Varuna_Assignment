# Implementation Plan

- [x] 1. Initialize project structure and configuration




  - Create monorepo structure with frontend and backend folders
  - Set up TypeScript configuration with strict mode for both projects
  - Configure ESLint and Prettier for code quality
  - Set up package.json files with required dependencies
  - _Requirements: 6.1, 6.3, 6.4_

- [-] 2. Set up backend database infrastructure



  - [x] 2.1 Create database schema and migrations


    - Write migration files for routes, ship_compliance, bank_entries, pools, and pool_members tables
    - Implement database connection configuration
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 2.2 Create seed data script


    - Implement seed script to populate five routes (R001-R005)
    - Set R002 as default baseline
    - _Requirements: 7.1_
  
  - [x] 2.3 Implement repository interfaces (ports)








    - Define RouteRepository, ComplianceRepository, BankRepository, and PoolRepository interfaces
    - _Requirements: 6.3, 6.4_

- [x] 3. Implement backend core domain layer




  - [x] 3.1 Create domain entities


    - Implement Route, ComplianceBalance, BankEntry, and Pool entity classes
    - Add validation methods to entities
    - _Requirements: 6.1, 7.1, 7.2, 7.3, 7.4_
  
  - [x] 3.2 Implement compliance balance calculation logic


    - Create ComputeCB use case with formula: (Target - Actual) × Energy_in_scope
    - Use Target_Intensity = 89.3368 gCO₂e/MJ
    - Calculate Energy_in_scope = fuelConsumption × 41,000 MJ/t
    - Classify as surplus (positive) or deficit (negative)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 3.3 Implement route comparison use case


    - Create ComputeComparison use case
    - Calculate percentage difference: ((comparison / baseline) − 1) × 100
    - Determine compliance status against Target_Intensity
    - _Requirements: 2.3, 2.5_

- [x] 4. Implement backend banking use cases







  - [x] 4.1 Create BankSurplus use case


    - Implement logic to bank positive compliance balance
    - Validate amount is positive and ≤ available CB
    - Create bank entry record with transaction type 'BANK'
    - _Requirements: 3.3_
  
  - [x] 4.2 Create ApplyBanked use case


    - Implement logic to apply banked surplus to deficit
    - Validate amount ≤ available banked balance
    - Create bank entry record with transaction type 'APPLY'
    - Update compliance balance
    - _Requirements: 3.4_

- [x] 5. Implement backend pooling use case





  - [x] 5.1 Create CreatePool use case with greedy allocation


    - Sort members descending by compliance balance
    - Transfer surplus to deficits using greedy algorithm
    - Validate sum(adjustedCB) ≥ 0
    - Enforce deficit ship cannot exit worse constraint
    - Enforce surplus ship cannot exit negative constraint
    - Create pool and pool_members records
    - _Requirements: 4.2, 4.3, 4.4_

- [x] 6. Implement backend repository adapters




  - [x] 6.1 Create RouteRepository implementation


    - Implement findAll, findById, setBaseline, findBaseline, findComparison methods
    - Use PostgreSQL queries with proper error handling
    - _Requirements: 6.4, 7.5_
  
  - [x] 6.2 Create ComplianceRepository implementation


    - Implement save, findByShipAndYear, findAdjustedCB methods
    - _Requirements: 6.4, 7.5_
  
  - [x] 6.3 Create BankRepository implementation


    - Implement save, findByShipAndYear, getAvailableBalance methods
    - _Requirements: 6.4, 7.5_
  
  - [x] 6.4 Create PoolRepository implementation


    - Implement createPool, addMembers methods with transaction support
    - _Requirements: 6.4, 7.5_

- [x] 7. Implement backend HTTP controllers




  - [x] 7.1 Create RoutesController


    - Implement GET /routes endpoint
    - Implement POST /routes/:id/baseline endpoint
    - Implement GET /routes/comparison endpoint with percentDiff and compliant flags
    - _Requirements: 1.4, 1.5, 2.1, 7.5_
  
  - [x] 7.2 Create ComplianceController


    - Implement GET /compliance/cb?shipId&year endpoint
    - Implement GET /compliance/adjusted-cb?shipId&year endpoint
    - _Requirements: 3.1, 4.1, 7.5_
  
  - [x] 7.3 Create BankingController


    - Implement GET /banking/records?shipId&year endpoint
    - Implement POST /banking/bank endpoint with validation
    - Implement POST /banking/apply endpoint with validation
    - Return appropriate error responses for validation failures
    - _Requirements: 3.3, 3.4, 3.5, 7.5_
  
  - [x] 7.4 Create PoolsController


    - Implement POST /pools endpoint
    - Validate pool constraints and return errors for violations
    - _Requirements: 4.5, 7.5_

- [x] 8. Set up backend server and middleware











  - Configure Express server with CORS and JSON parsing
  - Wire up controllers with dependency injection
  - Add error handling middleware
  - Create server entry point
  - _Requirements: 6.3, 6.4_

- [ ]* 9. Write backend unit tests
  - Write unit tests for ComputeComparison use case
  - Write unit tests for ComputeCB use case with various inputs
  - Write unit tests for BankSurplus use case with validation scenarios
  - Write unit tests for ApplyBanked use case
  - Write unit tests for CreatePool use case with edge cases
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 10. Write backend integration tests
  - Write integration tests for routes endpoints using Supertest
  - Write integration tests for compliance endpoints
  - Write integration tests for banking endpoints
  - Write integration tests for pools endpoints
  - Test edge cases: negative CB, over-apply bank, invalid pool
  - _Requirements: 7.5_

- [x] 11. Initialize frontend project structure









  - Create React + TypeScript + Vite project
  - Set up TailwindCSS configuration
  - Create hexagonal folder structure (core, adapters, shared)
  - Configure routing for four tabs
  - _Requirements: 6.1, 6.2_

- [x] 12. Implement frontend core domain layer







  - [x] 12.1 Create domain entities

    - Implement Route, ComplianceBalance, BankEntry, Pool domain models
    - _Requirements: 6.1, 6.2_
  
  - [x] 12.2 Define port interfaces


    - Create inbound port interfaces for use cases
    - Create outbound port interfaces for API client
    - _Requirements: 6.2, 6.5_

- [-] 13. Implement frontend use cases



  - [x] 13.1 Create route management use cases


    - Implement FetchRoutes use case
    - Implement SetBaseline use case
    - _Requirements: 1.1, 1.2, 6.2_
  
  - [x] 13.2 Create comparison use case







    - Implement CompareRoutes use case
    - Calculate percentage difference on frontend
    - _Requirements: 2.2, 2.3, 6.2_
  
  - [x] 13.3 Create banking use cases












    - Implement BankBalance use case
    - Implement ApplyBanked use case
    - _Requirements: 3.3, 3.4, 6.2_
  
  - [x] 13.4 Create pooling use case





    - Implement CreatePool use case with validation
    - _Requirements: 4.5, 6.2_

- [x] 14. Implement frontend API client adapter








  - Create ApiClient class implementing outbound ports
  - Implement methods for all backend endpoints
  - Add error handling and response parsing
  - Configure base URL from environment variables
  - _Requirements: 6.2, 6.5_

- [x] 15. Implement Routes Tab component





  - [x] 15.1 Create RoutesTab component with table


    - Display routes with all columns (routeId, vesselType, fuelType, year, ghgIntensity, fuelConsumption, distance, totalEmissions)
    - Add "Set Baseline" button for each route
    - Implement filters for vesselType, fuelType, and year
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 15.2 Wire up Routes Tab with use cases


    - Connect FetchRoutes use case to component
    - Connect SetBaseline use case to button click
    - Handle loading and error states
    - _Requirements: 1.1, 1.2_

- [x] 16. Implement Compare Tab component





  - [x] 16.1 Create CompareTab component with comparison table


    - Display baseline vs comparison routes
    - Show ghgIntensity, percentage difference, and compliant status (✅/❌)
    - Use Target_Intensity = 89.3368 gCO₂e/MJ for compliance check
    - _Requirements: 2.1, 2.2, 2.5_
  
  - [x] 16.2 Add comparison chart

    - Implement bar or line chart comparing ghgIntensity values
    - Use charting library (Recharts or Chart.js)
    - _Requirements: 2.4_
  
  - [x] 16.3 Wire up Compare Tab with use case

    - Connect CompareRoutes use case to component
    - Handle loading and error states
    - _Requirements: 2.1_

- [x] 17. Implement Banking Tab component





  - [x] 17.1 Create BankingTab component with KPIs


    - Display current compliance balance from API
    - Show KPIs: cb_before, applied, cb_after
    - Add "Bank Positive CB" button
    - Add "Apply Banked Surplus" button
    - _Requirements: 3.1, 3.3, 3.4_
  
  - [x] 17.2 Implement conditional button enabling

    - Disable banking actions when CB ≤ 0
    - Display error messages from API
    - _Requirements: 3.5_
  
  - [x] 17.3 Wire up Banking Tab with use cases

    - Connect BankBalance use case to bank button
    - Connect ApplyBanked use case to apply button
    - Handle loading and error states
    - _Requirements: 3.3, 3.4_

- [x] 18. Implement Pooling Tab component



  - [x] 18.1 Create PoolingTab component with member list


    - Display ships with adjusted compliance balance
    - Show before and after CB for each member
    - Add pool sum indicator (red if < 0, green if ≥ 0)
    - _Requirements: 4.1, 4.5_
  


  - [x] 18.2 Implement pool creation form
    - Add member selection interface
    - Validate sum(adjustedCB) ≥ 0
    - Disable "Create Pool" button if validation fails
    - Display validation error messages
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  
  - [x] 18.3 Wire up Pooling Tab with use case


    - Connect CreatePool use case to create button
    - Handle loading and error states
    - _Requirements: 4.5_

- [x] 19. Implement frontend styling and responsiveness





  - Apply TailwindCSS styling to all components
  - Ensure responsive design for mobile and desktop
  - Add loading spinners and error toast notifications
  - Implement accessible UI components
  - _Requirements: 6.2_

- [ ]* 20. Write frontend unit tests
  - Write unit tests for domain entities
  - Write unit tests for use cases with mocked API client
  - Write unit tests for calculation utilities
  - _Requirements: 6.2_

- [ ]* 21. Write frontend component tests
  - Write component tests for RoutesTab
  - Write component tests for CompareTab
  - Write component tests for BankingTab
  - Write component tests for PoolingTab
  - Test user interactions and state changes
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 22. Create documentation files






  - [x] 22.1 Create AGENT_WORKFLOW.md

    - Document all AI agents used during development
    - Include exact prompts and generated outputs
    - Document validation and correction processes
    - Add observations about agent effectiveness
    - Include best practices followed
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  

  - [x] 22.2 Create README.md

    - Write overview of the platform
    - Document architecture summary
    - Add setup and run instructions
    - Include test execution commands
    - Add sample API requests/responses
    - _Requirements: 8.1_
  
  - [x] 22.3 Create REFLECTION.md


    - Write essay on AI agent usage learnings
    - Document efficiency gains vs manual coding
    - Describe improvements for next time
    - _Requirements: 8.4_

- [x] 23. Final integration and testing







  - Run backend with seeded database
  - Run frontend connected to backend
  - Verify all four tabs work end-to-end
  - Test all user workflows manually
  - Ensure npm run test passes for both projects
  - Ensure npm run dev works for both projects
  - _Requirements: 1.1, 2.1, 3.1, 4.1_
