# Data Sync Tests

This directory contains comprehensive tests for the data-sync service, covering all handlers, services, and tasks.

## Test Structure

### Files

- `dataSync.test.ts` - Comprehensive test file with all utilities included
- `README.md` - This documentation

## Test Coverage

### Handler Tests

#### `processJobs` (Scheduled Handler)
- ✅ Successful job processing (placeholder for future implementation)
- ✅ Error handling during job processing (placeholder for future implementation)

#### `webhookHandler` (API Gateway Handler)
- ✅ Successful webhook handling
- ✅ Missing provider validation
- ✅ Webhook error handling
- ✅ Provider extraction from body
- ✅ Job creation from webhook events

#### `setupListener` (API Gateway Handler)
- ✅ Successful database listener setup
- ✅ Missing parameters validation
- ✅ Listener setup error handling
- ✅ Provider-specific listener configuration

#### `healthCheck` (API Gateway Handler)
- ✅ Health status response
- ✅ Timestamp inclusion

### Job Service Tests

#### `createJob`
- ✅ Successful job creation
- ✅ Job creation error handling
- ✅ Database interaction validation

#### `updateJobStatus`
- ✅ Successful status update
- ✅ Progress tracking
- ✅ Error message handling
- ✅ Processing timestamp updates
- ✅ Update error handling

### Webhook Parser Tests

#### `webhookParse`
- ✅ Airtable webhook parsing
- ✅ Google Sheets webhook parsing
- ✅ Supabase webhook parsing
- ✅ Notion webhook parsing
- ✅ Default provider fallback
- ✅ Table ID extraction for each provider

### Listener Task Tests

#### `setupListener`
- ✅ Successful listener setup
- ✅ Webhook URL configuration
- ✅ Strategy factory integration
- ✅ Error handling for strategy failures
- ✅ Provider-specific listener configuration

## Test Utilities

The test file includes several utility functions:

### `createMockJob(overrides?)`
Creates a standardized mock job object with optional overrides.

```typescript
const mockJob = createMockJob({ status: "processing" });
```

### `createMockSupabase(data, error?)`
Creates a mock Supabase client with specified data and error responses.

```typescript
const mockSupabase = createMockSupabase({ id: "job-123" }, null);
```

### `createMockEvent(overrides?)`
Creates a mock API Gateway event with optional overrides.

```typescript
const event = createMockEvent({ 
  pathParameters: { provider: "airtable" },
  body: JSON.stringify({ tableId: "table-123" })
});
```

### `testScenarios`
Predefined test scenarios with setup and expectation functions.

```typescript
it(testScenarios.successfulWebhook.description, async () => {
  testScenarios.successfulWebhook.setup();
  const response = await webhookHandler(event, {} as any, {} as any);
  testScenarios.successfulWebhook.expectations();
});
```

## Supported Providers

The tests cover webhook parsing for the following providers:

- **Airtable** - Uses `tableId` field
- **Google Sheets** - Uses `sheetId` field  
- **Supabase** - Uses `databaseId` field
- **Notion** - Uses `databaseId` field
- **Default** - Uses `tableName` field for unknown providers

## Running Tests

```bash
# Run all data-sync tests
npm test tests/services/data-sync/

# Run specific test file
npm test tests/services/data-sync/dataSync.test.ts

# Run with coverage
npm run test:coverage tests/services/data-sync/
```

## Test Scenarios

### Webhook Handler Scenarios

1. **Successful Webhook** - Validates proper job creation from webhook events
2. **Missing Provider** - Tests error handling when provider is not specified
3. **Webhook Error** - Tests error handling during webhook processing
4. **Provider in Body** - Tests provider extraction from request body

### Listener Setup Scenarios

1. **Successful Setup** - Validates proper listener configuration
2. **Missing Parameters** - Tests validation of required parameters
3. **Setup Error** - Tests error handling during listener setup

### Job Service Scenarios

1. **Job Creation** - Tests successful job creation and error handling
2. **Status Updates** - Tests job status updates with progress and error tracking
3. **Database Errors** - Tests error handling for database operations

## Benefits

1. **Comprehensive Coverage** - Tests all handlers, services, and tasks
2. **Provider Support** - Covers all supported webhook providers
3. **Error Handling** - Validates proper error responses and logging
4. **Mock Integration** - Uses realistic mock data and scenarios
5. **Maintainable** - Organized with reusable utilities and scenarios

## Future Enhancements

- Add integration tests with real database connections
- Implement performance benchmarks for webhook processing
- Add stress tests for concurrent job processing
- Create visual test reports with detailed coverage metrics
- Add tests for new providers as they are supported 