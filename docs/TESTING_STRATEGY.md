# Comprehensive Testing Strategy for IMTA Resume

This document outlines the complete testing strategy for the IMTA Resume application, following QualityGate principles and test-driven development (TDD) practices.

## Table of Contents

1. [Testing Infrastructure](#testing-infrastructure)
2. [Test Hierarchy](#test-hierarchy)
3. [Unit Test Plan](#unit-test-plan)
4. [Integration Test Plan](#integration-test-plan)
5. [E2E Test Plan](#e2e-test-plan)
6. [CI/CD Integration](#cicd-integration)
7. [Running Tests](#running-tests)
8. [Best Practices](#best-practices)

---

## Testing Infrastructure

### Framework Stack

| Layer | Framework | Purpose |
|-------|-----------|---------|
| Unit Tests | Vitest | Fast, Vite-native unit testing |
| Integration Tests | Vitest | Service and API integration testing |
| E2E Tests | Playwright | Browser-based end-to-end testing |
| Coverage | @vitest/coverage-v8 | Code coverage reporting |
| React Testing | @testing-library/react | React component testing |

### Configuration Files

```
imta-resume/
├── vitest.config.ts          # Vitest configuration
├── playwright.config.ts      # Playwright E2E configuration
├── tests/
│   ├── setup.ts              # Test setup (runs before each test)
│   ├── global-setup.ts       # Global setup (runs once)
│   ├── __mocks__/            # Mock implementations
│   │   └── drizzle.ts        # Database mock
│   ├── unit/                 # Unit tests
│   │   ├── utils/            # Utility function tests
│   │   ├── schema/           # Schema validation tests
│   │   └── store/            # State management tests
│   ├── integration/          # Integration tests
│   │   └── orpc/             # ORPC service tests
│   └── e2e/                  # End-to-end tests
│       └── resume-workflow.test.ts
└── .github/workflows/test.yml  # CI configuration
```

---

## Test Hierarchy

Following the Testing Trophy pattern:

```
          ┌─────────────┐
          │    E2E      │  ← Critical user journeys
          ├─────────────┤
          │ Integration │  ← API and service interactions
          ├─────────────┤
          │    Unit     │  ← Business logic, utilities
          └─────────────┘
```

### Priority Order

1. **Contract Tests** - API specifications and interfaces
2. **Integration Tests** - Real-world user journeys with services
3. **E2E Tests** - Complete workflows
4. **Unit Tests** - Critical business logic

---

## Unit Test Plan

### Critical Utilities (`src/utils/*.ts`)

| File | Priority | Status | Coverage Target |
|------|----------|--------|-----------------|
| `string.ts` | P0 | Implemented | 95% |
| `color.ts` | P0 | Implemented | 95% |
| `file.ts` | P1 | Implemented | 80% |
| `password.ts` | P0 | TODO | 100% |
| `locale.ts` | P1 | TODO | 90% |
| `env.ts` | P1 | TODO | 80% |
| `qrcode.ts` | P2 | TODO | 80% |
| `vcard.ts` | P2 | TODO | 80% |
| `compose-refs.ts` | P2 | TODO | 90% |

### Resume Utilities (`src/utils/resume/*.ts`)

| File | Priority | Status | Coverage Target |
|------|----------|--------|-----------------|
| `move-item.ts` | P0 | Implemented | 95% |
| `section.ts` | P1 | TODO | 90% |

### Schema Validation (`src/schema/*.ts`)

| Schema | Priority | Status | Coverage Target |
|--------|----------|--------|-----------------|
| `resume/data.ts` | P0 | Implemented | 95% |
| `resume/analysis.ts` | P1 | TODO | 90% |
| `interview/index.ts` | P2 | TODO | 80% |
| `templates.ts` | P1 | TODO | 90% |

### State Management

| Store | Priority | Status | Coverage Target |
|-------|----------|--------|-----------------|
| `dialogs/store.ts` | P0 | Documented | 90% |
| `command-palette/store.ts` | P1 | TODO | 85% |
| `builder/-store/*.ts` | P1 | TODO | 85% |

---

## Integration Test Plan

### ORPC Services (`src/integrations/orpc/services/*.ts`)

| Service | Priority | Status | Test Approach |
|---------|----------|--------|---------------|
| `resume.ts` | P0 | Documented | Real DB with testcontainers |
| `ai-config.ts` | P0 | TODO | Mocked AI responses |
| `ai-quota.ts` | P0 | TODO | Real DB |
| `statistics.ts` | P1 | TODO | Real DB |
| `storage.ts` | P1 | TODO | Mocked S3 |
| `printer.ts` | P1 | TODO | Mocked Puppeteer |

### Auth Integration

| Component | Priority | Status | Test Approach |
|-----------|----------|--------|---------------|
| Better Auth client | P0 | TODO | Integration test |
| Session handling | P0 | TODO | Integration test |
| Password reset flow | P1 | TODO | Integration test |
| 2FA flow | P1 | TODO | Integration test |

### Database Operations

| Operation | Priority | Status | Test Approach |
|-----------|----------|--------|---------------|
| Resume CRUD | P0 | Documented | PostgreSQL testcontainer |
| User CRUD | P0 | TODO | PostgreSQL testcontainer |
| AI usage logging | P1 | TODO | PostgreSQL testcontainer |
| Statistics tracking | P1 | TODO | PostgreSQL testcontainer |

---

## E2E Test Plan

### Critical User Journeys

| Journey | Priority | Status | Coverage |
|---------|----------|--------|----------|
| User registration | P0 | Documented | Auth flow |
| User login | P0 | Documented | Auth flow |
| Resume creation | P0 | Documented | Core feature |
| Resume editing | P0 | Documented | Core feature |
| Resume export (PDF) | P0 | Documented | Core feature |
| Resume sharing | P1 | Documented | Core feature |
| Template switching | P1 | Documented | UX feature |

### Authentication Flows

| Flow | Priority | Status |
|------|----------|--------|
| Email/password registration | P0 | Documented |
| Email/password login | P0 | Documented |
| Password reset | P1 | Documented |
| 2FA enable/disable | P1 | Documented |
| Session management | P1 | TODO |

### AI Feature Testing

| Feature | Priority | Status | Approach |
|---------|----------|--------|----------|
| Resume parsing (PDF) | P0 | Documented | Mock AI response |
| Content improvement | P1 | Documented | Mock AI response |
| Grammar fix | P1 | Documented | Mock AI response |
| Resume analysis | P1 | Documented | Mock AI response |

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
Jobs:
  1. unit-tests      # Fast, no external deps
  2. integration-tests # With PostgreSQL service
  3. e2e-tests       # With full app + Playwright
  4. typecheck       # TypeScript validation
  5. lint            # Biome linting
```

### Quality Gates

| Gate | Threshold | Enforcement |
|------|-----------|-------------|
| Unit test pass | 100% | Required for merge |
| Integration test pass | 100% | Required for merge |
| Coverage (statements) | 20% (initial) | Warning, not blocking |
| Type check | 0 errors | Required for merge |
| Lint | 0 errors | Required for merge |

### Coverage Thresholds (Progressive)

| Phase | Statements | Branches | Functions | Lines |
|-------|------------|----------|-----------|-------|
| Initial | 20% | 20% | 20% | 20% |
| Phase 1 | 40% | 35% | 40% | 40% |
| Phase 2 | 60% | 50% | 60% | 60% |
| Target | 80% | 70% | 80% | 80% |

---

## Running Tests

### Quick Reference

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests only
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Development Workflow

```bash
# TDD Cycle: Red -> Green -> Refactor

# 1. Write failing test
pnpm test:watch tests/unit/utils/my-feature.test.ts

# 2. Implement feature (make test pass)

# 3. Refactor while keeping tests green

# 4. Verify coverage
pnpm test:coverage
```

---

## Best Practices

### Test Structure (AAA Pattern)

```typescript
describe("featureName", () => {
  describe("methodName", () => {
    it("should do something when condition", () => {
      // Arrange - Set up test data
      const input = createTestInput();

      // Act - Execute the code
      const result = methodName(input);

      // Assert - Verify the result
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Naming Conventions

```typescript
// File names: feature.test.ts or feature.spec.ts
// Test descriptions: "should [expected behavior] when [condition]"

// Good examples:
it("should return empty array when user has no resumes");
it("should throw NOT_FOUND when resume ID is invalid");
it("should increment views count when resume is accessed");

// Bad examples:
it("test resume list");
it("works correctly");
it("handles edge case");
```

### Mocking Guidelines

```typescript
// Prefer real implementations over mocks when possible
// Use mocks for:
// - External APIs (AI providers, S3, email)
// - Time-dependent operations
// - Random values

// Good: Real database with testcontainers
// Bad: Mocking database queries

// Good: Mocking AI API responses
// Bad: Making real AI API calls in tests
```

### Test Isolation

```typescript
// Each test should be independent
// Use beforeEach for setup, afterEach for cleanup

beforeEach(() => {
  vi.clearAllMocks();
  // Reset test data
});

afterEach(() => {
  // Clean up side effects
});
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

- [x] Set up Vitest configuration
- [x] Set up Playwright configuration
- [x] Create test directory structure
- [x] Implement utility tests (string, color, file)
- [x] Implement schema validation tests
- [x] Set up CI workflow

### Phase 2: Core Features (Week 2-3)

- [ ] Implement resume service integration tests
- [ ] Implement auth flow integration tests
- [ ] Create resume workflow E2E tests
- [ ] Set up testcontainers for database tests

### Phase 3: AI Features (Week 4)

- [ ] Implement AI service tests with mocks
- [ ] Create AI feature E2E tests
- [ ] Add quota/usage tracking tests

### Phase 4: Coverage Goals (Ongoing)

- [ ] Increase coverage to 40%
- [ ] Add missing edge case tests
- [ ] Document testing patterns

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
