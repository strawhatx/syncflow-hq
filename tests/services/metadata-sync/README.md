# Metadata Sync Tests

This directory contains comprehensive tests for the metadata-sync service, optimized for maintainability, performance, and readability.

## Test Structure

### Files

- `metadataSync.test.ts` - Comprehensive optimized test file with all utilities included
- `README.md` - This documentation

## Optimizations Made

### 1. **Reduced Code Duplication**
- Created reusable test utilities (`createMockJob`, `createMockSupabase`)
- Centralized mock setup in `setupMocks()` function
- Eliminated repetitive mock configurations

### 2. **Improved Test Organization**
- Separated test scenarios into reusable objects
- Created factory functions for common test data
- Grouped related tests with clear descriptions

### 3. **Enhanced Maintainability**
- Test scenarios are now data-driven and reusable
- Mock setup is centralized and consistent
- Easy to add new test cases without duplicating code

### 4. **Better Performance**
- Reduced test execution time by optimizing mock setup
- Eliminated redundant mock configurations
- Streamlined test execution flow

## Test Utilities

The test file includes several utility functions and test scenarios:

### `createMockJob(overrides?)`
Creates a standardized mock job object with optional overrides.

```typescript
const mockJob = createMockJob({ provider: "google-sheets" });
```

### `createMockSupabase(data, error?)`
Creates a mock Supabase client with specified data and error responses.

```typescript
const mockSupabase = createMockSupabase({ id: "job-123" }, null);
```

### `testScenarios`
Predefined test scenarios with setup and expectation functions.

```typescript
it(testScenarios.successfulJob.description, async () => {
  testScenarios.successfulJob.setup(mockJob);
  await mockProcessJobs();
  testScenarios.successfulJob.expectations();
});
```

## Test Coverage

### Handler Tests
- ✅ Successful job processing
- ✅ No pending jobs handling
- ✅ Job already picked up by another Lambda
- ✅ OAuth provider handling
- ✅ Error handling with job failure
- ✅ Error handling without job ID

### Job Service Tests
- ✅ Get pending job
- ✅ Update job status
- ✅ Fail job with error message

### Connection Service Tests
- ✅ Get connection config
- ✅ Rollback database sync
- ✅ Error handling for database operations

## Running Tests

```bash
# Run all metadata-sync tests
npm test tests/services/metadata-sync/

# Run specific test file
npm test tests/services/metadata-sync/metadataSync.test.ts

# Run with coverage
npm run test:coverage tests/services/metadata-sync/
```

## Benefits of Optimization

1. **Reduced Maintenance Burden**: Changes to mock structure only need to be made in one place
2. **Improved Readability**: Test scenarios are clearly defined and self-documenting
3. **Faster Development**: New tests can be added quickly using existing utilities
4. **Better Debugging**: Consistent mock behavior across all tests
5. **Enhanced Collaboration**: Team members can easily understand and extend tests

## Best Practices

1. **Use Test Utilities**: Always use `createMockJob` and `createMockSupabase` for consistency
2. **Follow Test Scenarios**: Use predefined scenarios when possible to maintain consistency
3. **Clear Descriptions**: Test descriptions should clearly indicate what is being tested
4. **Isolated Tests**: Each test should be independent and not rely on other tests
5. **Proper Cleanup**: Always clear mocks in `beforeEach` and restore in `afterEach`

## Future Improvements

- Add integration tests with real database connections
- Implement performance benchmarks
- Add stress tests for concurrent job processing
- Create visual test reports with detailed coverage metrics 