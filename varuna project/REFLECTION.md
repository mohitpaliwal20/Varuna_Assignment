# Reflection on AI Agent Usage in Development

## Introduction

This document reflects on the experience of building the Fuel EU Maritime compliance platform using AI agents, specifically Kiro's spec-driven development workflow. The project involved creating a full-stack application with React frontend and Node.js backend, implementing complex business logic for maritime compliance calculations, banking, and pooling operations.

## The AI-Assisted Development Experience

### Initial Skepticism and Pleasant Surprises

When I started this project, I was curious but cautious about how much an AI agent could actually contribute to a real-world application with complex domain logic. The Fuel EU Maritime regulations involve specific formulas, constraints, and business rules that seemed like they would require deep domain understanding and careful implementation.

What surprised me most was not just that the AI could generate code, but that it could maintain architectural consistency throughout the entire project. The hexagonal architecture pattern was preserved across dozens of files, with clean separation between core domain logic and framework-specific adapters. This kind of architectural discipline is often challenging even for experienced developers working manually.

### The Spec-Driven Approach

The workflow of creating requirements, design, and implementation plan before writing any code initially felt like overhead. In traditional development, I might have jumped straight into coding with a rough mental model. However, the structured approach paid significant dividends:

**Requirements Phase**: The EARS (Easy Approach to Requirements Syntax) format forced precision in defining what the system should do. Writing "WHEN accessing the routes tab, THE Fuel_EU_Platform SHALL display all routes..." instead of "show routes on the page" eliminated ambiguity. This precision meant the AI agent had clear, unambiguous instructions to work from.

**Design Phase**: Creating a comprehensive design document with database schemas, API endpoints, and component structures provided a blueprint that the AI could reference throughout implementation. When generating code for the pooling algorithm, the agent could look back at the design document to understand the data flow and constraints.

**Task Breakdown**: Converting the design into granular, actionable tasks was perhaps the most valuable step. Each task became a focused prompt for the AI, preventing scope creep and ensuring incremental progress. The agent never tried to implement everything at once; it stayed focused on the specific task at hand.

## Efficiency Gains vs Manual Coding

### Quantitative Analysis

The time savings were substantial but not uniform across all activities:

**Planning and Architecture (70% time savings)**:
- Manual estimate: 8-10 hours for requirements and design
- AI-assisted actual: 3 hours
- The AI generated comprehensive documentation quickly, but I still needed time to review, refine, and validate the specifications.

**Backend Implementation (67% time savings)**:
- Manual estimate: 30-35 hours
- AI-assisted actual: 10 hours
- The agent generated database schemas, domain entities, use cases, repositories, and controllers rapidly. Most corrections were minor (missing imports, type adjustments).

**Frontend Implementation (67% time savings)**:
- Manual estimate: 30-35 hours  
- AI-assisted actual: 10 hours
- React components, hooks, and styling were generated efficiently. The agent understood TailwindCSS conventions and created responsive layouts without explicit instruction.

**Testing and Debugging (58% time savings)**:
- Manual estimate: 12-15 hours
- AI-assisted actual: 5 hours
- While the agent generated test structures, I spent more time here than expected validating business logic and edge cases.

**Overall: ~70% time reduction** (25-30 hours vs 80-100 hours estimated for manual development)

### Qualitative Observations

Beyond raw time savings, the AI assistance changed the development experience in several ways:

**Reduced Context Switching**: Normally, I'd switch between writing code, looking up documentation, and remembering API patterns. The AI handled much of this, letting me stay focused on higher-level decisions.

**Consistency**: Every repository followed the same pattern. Every controller had the same error handling structure. Every React component used the same hooks pattern. This consistency emerged naturally because the AI referenced its own previous outputs.

**Reduced Boilerplate Fatigue**: Writing TypeScript interfaces, database migrations, and CRUD operations is tedious but necessary. The AI handled this without complaint, and I could focus on the interesting parts (compliance calculations, pooling algorithm).

**Documentation as a Byproduct**: Because the spec-driven approach required comprehensive documentation upfront, the project ended up well-documented almost by accident. In manual development, documentation often becomes an afterthought.

## Where AI Agents Excelled

### 1. Pattern Application

The AI was exceptional at applying patterns consistently. Once hexagonal architecture was established in the design, every new component followed the same structure:
- Domain entities in `core/domain/`
- Use cases in `core/application/`
- Adapters in `adapters/inbound/` or `adapters/outbound/`

This consistency would require discipline and code reviews in a team setting, but the AI maintained it automatically.

### 2. Boilerplate Generation

Database migrations, TypeScript interfaces, Express route handlers, React component scaffolding—all the repetitive code that developers know how to write but find tedious—the AI generated quickly and correctly.

### 3. Framework Knowledge

The AI demonstrated broad knowledge of frameworks and libraries:
- Express middleware patterns
- React hooks best practices
- TailwindCSS utility classes
- PostgreSQL query syntax
- Jest testing patterns

I didn't need to look up documentation for basic patterns; the AI already knew them.

### 4. Incremental Development

The task-by-task approach meant the codebase grew incrementally. Each task built on previous work, and the AI maintained context about what had already been implemented. This prevented the "big bang" integration problems that often occur in manual development.

## Where AI Agents Struggled

### 1. Edge Cases and Business Logic Nuances

The pooling algorithm required specific constraints:
- Deficit ships cannot exit worse than they entered
- Surplus ships cannot exit with negative balance
- Total pool balance must be non-negative

The AI's initial implementation of the greedy allocation algorithm was correct, but it missed the constraint validation. I had to explicitly prompt for these checks. The AI understood the algorithm but didn't anticipate all the business rules without explicit instruction.

### 2. Integration Points

The AI sometimes overlooked integration details:
- CORS configuration for cross-origin requests
- Environment variable setup
- Database connection pooling
- Error handling middleware order in Express

These aren't complex issues, but they're easy to miss when generating code in isolation. Manual development benefits from running the application frequently and catching these issues through trial and error.

### 3. Framework-Specific Quirks

React hooks have specific rules (can't be called conditionally, must be at top level). The AI occasionally generated code that violated these rules, requiring corrections. Similarly, async/await patterns in Express middleware sometimes needed adjustment.

### 4. Test Quality

The AI generated test structures readily, but the tests were sometimes superficial:
- Testing happy paths but missing error scenarios
- Mocking too aggressively instead of testing real behavior
- Missing edge cases that a human tester might consider

I spent more time than expected writing additional tests and improving test coverage.

### 5. Performance Considerations

The AI didn't consider performance optimization:
- No database indexes beyond primary keys
- No query optimization
- No caching strategies
- No pagination for large result sets

These aren't critical for an MVP, but a production system would need them. The AI focused on functional correctness, not performance.

## The Human Role in AI-Assisted Development

Despite the AI's capabilities, human judgment remained essential throughout:

### Strategic Decisions

**Architecture Choice**: Deciding to use hexagonal architecture was a human decision based on project requirements for testability and maintainability. The AI executed the architecture but didn't recommend it.

**Technology Selection**: Choosing React over Vue, PostgreSQL over MongoDB, Express over Fastify—these decisions required understanding trade-offs that the AI couldn't evaluate without explicit criteria.

**Feature Prioritization**: Marking test tasks as optional to accelerate MVP delivery was a strategic choice. The AI could implement either approach but couldn't decide which was more appropriate for the project context.

### Quality Assurance

**Business Logic Validation**: I validated every calculation:
- Compliance balance formula: (Target - Actual) × Energy_in_scope
- Percentage difference: ((comparison / baseline) - 1) × 100
- Pooling constraints

The AI implemented what I specified, but I had to verify correctness against the Fuel EU regulations.

**Code Review**: Every AI-generated file received human review. Most code was good, but occasional issues needed correction:
- Type errors
- Logic bugs
- Missing error handling
- Incorrect assumptions

**Integration Testing**: While the AI generated unit tests, I manually tested the full application to ensure components worked together correctly. The AI couldn't catch integration issues that only appear when running the complete system.

### Domain Expertise

The AI had no inherent understanding of maritime compliance regulations. It implemented what I specified in the requirements, but I had to:
- Research Fuel EU Maritime Articles 20 and 21
- Understand compliance balance calculations
- Define banking and pooling rules
- Specify validation constraints

The AI was a powerful implementation tool, but domain expertise remained human-provided.

## Improvements for Next Time

### 1. More Detailed Design Examples

**Current Approach**: The design document described components and interfaces in prose.

**Improvement**: Include code examples in the design document:
```typescript
// Example: ComplianceBalance entity
export class ComplianceBalance {
  constructor(
    public readonly shipId: string,
    public readonly year: number,
    public readonly cbGco2eq: number
  ) {}
  
  get status(): 'SURPLUS' | 'DEFICIT' {
    return this.cbGco2eq >= 0 ? 'SURPLUS' : 'DEFICIT';
  }
}
```

This would give the AI concrete examples to follow, reducing corrections.

### 2. Explicit Error Scenarios

**Current Approach**: Requirements focused on happy paths.

**Improvement**: Add explicit error scenarios to requirements:
- "IF banking amount exceeds available balance, THEN THE system SHALL return 400 error with message 'Insufficient balance'"
- "IF pool total is negative, THEN THE system SHALL reject pool creation with 409 error"

This would prompt the AI to implement comprehensive error handling from the start.

### 3. Integration Verification Tasks

**Current Approach**: Tasks focused on individual components.

**Improvement**: Add integration verification tasks:
- "Verify frontend can fetch routes from backend"
- "Verify CORS allows cross-origin requests"
- "Verify database connection pool handles concurrent requests"

These tasks would catch integration issues earlier.

### 4. Performance Requirements

**Current Approach**: No performance criteria specified.

**Improvement**: Include performance requirements:
- "THE system SHALL return route list in < 200ms for 1000 routes"
- "THE system SHALL support 100 concurrent users"

This would prompt the AI to consider indexes, caching, and optimization.

### 5. Security Requirements

**Current Approach**: Security was an afterthought.

**Improvement**: Add explicit security requirements:
- "THE system SHALL validate all user inputs against SQL injection"
- "THE system SHALL sanitize outputs to prevent XSS"
- "THE system SHALL implement rate limiting on API endpoints"

Security should be built in from the start, not added later.

### 6. Test-First Approach

**Current Approach**: Implementation before tests.

**Improvement**: Generate tests before implementation:
- Write test cases in the design phase
- Implement tests as first subtask
- Then implement functionality to pass tests

This would improve test quality and catch edge cases earlier.

## Broader Implications

### The Changing Role of Developers

This project suggests that software development is evolving from "writing code" to "directing code generation." The valuable skills become:

**System Design**: Understanding how components should fit together, what patterns to apply, and how to structure for maintainability.

**Domain Expertise**: Knowing the business rules, regulations, and requirements that the system must satisfy.

**Quality Assurance**: Validating that generated code is correct, secure, and performant.

**Strategic Thinking**: Making architectural decisions, prioritizing features, and managing trade-offs.

The mechanical act of typing code becomes less important; the thinking that guides what code to write becomes more important.

### Democratization of Development

AI agents lower the barrier to building software. Someone with domain expertise but limited coding experience could potentially build functional applications by:
1. Clearly specifying requirements
2. Reviewing and validating generated code
3. Testing the application

This doesn't eliminate the need for experienced developers—complex systems still require architectural expertise—but it expands who can participate in software creation.

### The Importance of Specifications

In traditional development, specifications are often informal or incomplete. Developers fill in gaps with assumptions and tribal knowledge. AI agents can't do this; they need explicit, unambiguous specifications.

This project reinforced that clear specifications are valuable even in human-only development. The EARS format and structured design document would have been useful even without AI assistance. The AI just made the value more obvious by demonstrating how much better the output is when the input is precise.

## Conclusion

Building the Fuel EU Maritime compliance platform with AI assistance was a revelation. The 70% time savings were significant, but more important was the shift in how I spent my time. Instead of writing boilerplate and looking up API documentation, I focused on architecture, business logic, and validation.

The AI agents were not autonomous developers; they were powerful tools that amplified my capabilities. I provided direction, domain knowledge, and quality assurance. The AI provided rapid implementation, consistent patterns, and tireless execution.

The spec-driven approach was key to success. Clear requirements, comprehensive design, and granular tasks gave the AI the context it needed to generate quality code. Without this structure, the AI would have been far less effective.

For future projects, I would use AI assistance without hesitation, but with lessons learned:
- Invest more time in detailed specifications with examples
- Include error scenarios and edge cases explicitly
- Add integration verification checkpoints
- Specify performance and security requirements upfront
- Consider test-first development

The future of software development isn't "AI replaces developers." It's "developers with AI assistance build better software faster." This project demonstrated that future convincingly.

The question isn't whether to use AI in development; it's how to use it most effectively. The answer, I've learned, starts with clear thinking about what you want to build—and then letting the AI help you build it.
