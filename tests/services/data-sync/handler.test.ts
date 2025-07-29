import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { 
  processJobs, 
  webhookHandler, 
  setupListener, 
  healthCheck 
} from "../../../services/data-sync/src/handler";
import * as jobService from "../../../services/data-sync/src/services/job";
import * as webhookParser from "../../../services/data-sync/src/tasks/webhook-parser";
import * as listenerTask from "../../../services/data-sync/src/tasks/listener";
import { DataSyncJob, DataSyncJobStatus } from "../../../services/data-sync/src/types/job";

// Mock the processJobs function to match the ScheduledHandler signature
const mockProcessJobs = processJobs as any;

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

/**
 * Creates a mock DataSyncJob with default values that can be overridden
 * @param overrides - Partial job data to override defaults
 * @returns A complete DataSyncJob object
 */
const createMockJob = (overrides: Partial<DataSyncJob> = {}): DataSyncJob => ({
  id: "job-123",
  sync_id: "sync-123",
  team_id: "team-123",
  provider: "postgresql",
  status: "pending",
  payload: {},
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides
});

/**
 * Creates a mock Supabase client with configurable responses
 * @param mockData - Data to return from Supabase operations
 * @param mockError - Error to return from Supabase operations (optional)
 * @returns Mock Supabase client with chained methods
 */
const createMockSupabase = (mockData: any, mockError: any = null) => ({
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockData, error: mockError }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockData, error: mockError }))
        }))
      }))
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockData, error: mockError }))
      }))
    }))
  }))
});

/**
 * Creates a mock AWS Lambda event with configurable properties
 * @param overrides - Properties to override in the event
 * @returns Mock Lambda event object
 */
const createMockEvent = (overrides: any = {}) => ({
  body: JSON.stringify({ test: "data" }),
  pathParameters: { provider: "postgresql" },
  headers: {},
  ...overrides
});

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock all external dependencies to isolate the units under test
vi.mock("../../../services/data-sync/src/config/supabase", () => ({
  supabase: createMockSupabase(null)
}));

vi.mock("../../../services/data-sync/src/tasks/webhook-parser", () => ({
  webhookParse: vi.fn(() => Promise.resolve([
    { id: "sync-123", team_id: "team-123", provider: "postgresql" }
  ]))
}));

vi.mock("../../../services/data-sync/src/tasks/listener", () => ({
  setupListener: vi.fn(() => Promise.resolve())
}));

vi.mock("../../../services/data-sync/src/services/connection", () => ({
  getConnectionTableByTableId: vi.fn(() => Promise.resolve({ id: "table-123" }))
}));

vi.mock("../../../services/data-sync/src/services/sync", () => ({
  getRelatedSyncsByTableId: vi.fn(() => Promise.resolve([
    { id: "sync-123", team_id: "team-123" }
  ]))
}));

vi.mock("../../../services/data-sync/src/strategies/listener", () => ({
  ListenerFactory: {
    listener: vi.fn(() => ({
      listen: vi.fn(() => Promise.resolve())
    }))
  }
}));

// ============================================================================
// TEST SCENARIOS CONFIGURATION
// ============================================================================

/**
 * Centralized test scenarios to reduce code duplication and improve maintainability
 * Each scenario contains setup logic and expectations for specific test cases
 */
const testScenarios = {
  // Webhook handler scenarios
  successfulWebhook: {
    description: "should handle webhook successfully",
    setup: () => {
      vi.spyOn(jobService, "createJob").mockResolvedValue(createMockJob());
    },
    expectations: () => {
      expect(jobService.createJob).toHaveBeenCalledWith([
        {
          provider: "postgresql",
          payload: { test: "data" },
          status: "pending",
          sync_id: "sync-123",
          team_id: "team-123"
        }
      ]);
    }
  },
  
  missingProvider: {
    description: "should return 400 when provider is missing",
    setup: () => {
      // No setup needed for this error case
    },
    expectations: (response: any) => {
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({ error: 'Provider is required' });
    }
  },
  
  webhookError: {
    description: "should handle webhook errors",
    setup: () => {
      vi.spyOn(webhookParser, "webhookParse").mockRejectedValue(new Error("Webhook error"));
    },
    expectations: (response: any) => {
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({ error: 'Failed to handle webhook' });
    }
  },
  
  // Listener setup scenarios
  successfulListenerSetup: {
    description: "should setup database listener successfully",
    setup: () => {
      vi.spyOn(listenerTask, "setupListener").mockResolvedValue(undefined);
    },
    expectations: (response: any) => {
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        message: "Database listener setup successfully for postgresql"
      });
    }
  },
  
  missingListenerParams: {
    description: "should return 400 when listener parameters are missing",
    setup: () => {
      // No setup needed for this validation error case
    },
    expectations: (response: any) => {
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({ 
        error: 'provider, connectionConfig, and tableName are required' 
      });
    }
  },
  
  listenerSetupError: {
    description: "should handle listener setup errors",
    setup: () => {
      vi.spyOn(listenerTask, "setupListener").mockRejectedValue(new Error("Setup error"));
    },
    expectations: (response: any) => {
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({ error: 'Failed to setup database listener' });
    }
  }
};

// ============================================================================
// MAIN TEST SUITES
// ============================================================================

describe("data-sync handler", () => {
  // Setup and teardown for all handler tests
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // PROCESS JOBS TESTS
  // ============================================================================
  
  describe("processJobs", () => {
    it("should process jobs successfully", async () => {
      // TODO: Implement when processJobs logic is added
      // This test will verify that the scheduled job processor works correctly
      await mockProcessJobs();
      // Add expectations when implementation is complete
    });

    it("should handle errors during job processing", async () => {
      // TODO: Implement when processJobs logic is added
      // This test will verify error handling in the job processor
      await mockProcessJobs();
      // Add expectations when implementation is complete
    });
  });

  // ============================================================================
  // WEBHOOK HANDLER TESTS
  // ============================================================================
  
  describe("webhookHandler", () => {
    it(testScenarios.successfulWebhook.description, async () => {
      // Test successful webhook processing with provider in path parameters
      testScenarios.successfulWebhook.setup();
      
      const event = createMockEvent();
      const response = await webhookHandler(event, {} as any, {} as any);
      
      if (!response) return;
      
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ success: true });
      testScenarios.successfulWebhook.expectations();
    });

    it(testScenarios.missingProvider.description, async () => {
      // Test error handling when provider is not provided
      testScenarios.missingProvider.setup();
      
      const event = createMockEvent({ 
        pathParameters: null,
        body: JSON.stringify({}) 
      });
      const response = await webhookHandler(event, {} as any, {} as any);
      
      testScenarios.missingProvider.expectations(response);
    });

    it(testScenarios.webhookError.description, async () => {
      // Test error handling when webhook parsing fails
      testScenarios.webhookError.setup();
      
      const event = createMockEvent();
      const response = await webhookHandler(event, {} as any, {} as any);
      
      testScenarios.webhookError.expectations(response);
    });

    it("should handle webhook with provider in body", async () => {
      // Test webhook processing when provider is specified in request body instead of path
      vi.spyOn(jobService, "createJob").mockResolvedValue(createMockJob());
      
      const event = createMockEvent({ 
        pathParameters: null,
        body: JSON.stringify({ provider: "airtable", test: "data" })
      });
      const response = await webhookHandler(event, {} as any, {} as any);
      
      if (!response) return;
      
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ success: true });
    });
  });

  // ============================================================================
  // LISTENER SETUP TESTS
  // ============================================================================
  
  describe("setupListener", () => {
    it(testScenarios.successfulListenerSetup.description, async () => {
      // Test successful database listener setup
      testScenarios.successfulListenerSetup.setup();
      
      const event = createMockEvent({
        body: JSON.stringify({
          provider: "postgresql",
          connectionConfig: { host: "localhost" },
          tableName: "users"
        })
      });
      const response = await setupListener(event, {} as any, {} as any);
      
      testScenarios.successfulListenerSetup.expectations(response);
    });

    it(testScenarios.missingListenerParams.description, async () => {
      // Test validation when required listener parameters are missing
      testScenarios.missingListenerParams.setup();
      
      const event = createMockEvent({
        body: JSON.stringify({ provider: "postgresql" })
      });
      const response = await setupListener(event, {} as any, {} as any);
      
      testScenarios.missingListenerParams.expectations(response);
    });

    it(testScenarios.listenerSetupError.description, async () => {
      // Test error handling when listener setup fails
      testScenarios.listenerSetupError.setup();
      
      const event = createMockEvent({
        body: JSON.stringify({
          provider: "postgresql",
          connectionConfig: { host: "localhost" },
          tableName: "users"
        })
      });
      const response = await setupListener(event, {} as any, {} as any);
      
      testScenarios.listenerSetupError.expectations(response);
    });
  });

  // ============================================================================
  // HEALTH CHECK TESTS
  // ============================================================================
  
  describe("healthCheck", () => {
    it("should return health status", async () => {
      // Test the health check endpoint returns proper status and timestamp
      const response = await healthCheck({} as any, {} as any, {} as any);
      
      if (!response) return;
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Data Sync Service is running!");
      expect(body.timestamp).toBeDefined();
    });
  });
});

// ============================================================================
// JOB SERVICE TESTS
// ============================================================================

describe("data-sync job service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createJob", () => {
    it("should create job successfully", async () => {
      // Test successful job creation with Supabase
      const mockJob = createMockJob();
      const mockSupabase = createMockSupabase(mockJob);
      
      vi.doMock("../../../services/data-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { createJob } = await import("../../../services/data-sync/src/services/job");
      const result = await createJob([{
        sync_id: "sync-123",
        team_id: "team-123",
        provider: "postgresql",
        status: "pending"
      }]);

      expect(result).toEqual(mockJob);
    });

    it("should throw error when job creation fails", async () => {
      // Test error handling when Supabase job creation fails
      const mockSupabase = createMockSupabase(null, { message: "Creation failed" });
      
      vi.doMock("../../../services/data-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { createJob } = await import("../../../services/data-sync/src/services/job");
      
      await expect(createJob([{
        sync_id: "sync-123",
        team_id: "team-123",
        provider: "postgresql",
        status: "pending"
      }])).rejects.toThrow("Failed to create data sync job: Creation failed");
    });
  });

  describe("updateJobStatus", () => {
    it("should update job status successfully", async () => {
      // Test successful job status update with progress
      const mockJob = createMockJob({ status: "processing" });
      const mockSupabase = createMockSupabase(mockJob);
      
      vi.doMock("../../../services/data-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { updateJobStatus } = await import("../../../services/data-sync/src/services/job");
      const result = await updateJobStatus("job-123", "processing", 50);

      expect(result).toEqual(mockJob);
    });

    it("should update job with error message", async () => {
      // Test job status update with error message for failed jobs
      const mockJob = createMockJob({ status: "failed", message: "Test error" });
      const mockSupabase = createMockSupabase(mockJob);
      
      vi.doMock("../../../services/data-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { updateJobStatus } = await import("../../../services/data-sync/src/services/job");
      const result = await updateJobStatus("job-123", "failed", undefined, "Test error");

      expect(result).toEqual(mockJob);
    });

    it("should throw error when update fails", async () => {
      // Test error handling when Supabase update operation fails
      const mockSupabase = createMockSupabase(null, { message: "Update failed" });
      
      vi.doMock("../../../services/data-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { updateJobStatus } = await import("../../../services/data-sync/src/services/job");
      
      await expect(updateJobStatus("job-123", "processing")).rejects.toThrow("Failed to update job status: Update failed");
    });
  });
});

// ============================================================================
// WEBHOOK PARSER TESTS
// ============================================================================

describe("data-sync webhook parser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("webhookParse", () => {
    it("should parse airtable webhook", async () => {
      // Test Airtable webhook parsing with tableId parameter
      const mockSupabase = createMockSupabase({ id: "table-123" });
      
      vi.doMock("../../../services/data-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { webhookParse } = await import("../../../services/data-sync/src/tasks/webhook-parser");
      const result = await webhookParse({ tableId: "table-123" }, "airtable");

      expect(result).toEqual([
        { id: "sync-123", team_id: "team-123" }
      ]);
    });

    it("should parse google_sheets webhook", async () => {
      // Test Google Sheets webhook parsing with sheetId parameter
      const mockSupabase = createMockSupabase({ id: "table-123" });
      
      vi.doMock("../../../services/data-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { webhookParse } = await import("../../../services/data-sync/src/tasks/webhook-parser");
      const result = await webhookParse({ sheetId: "sheet-123" }, "google_sheets");

      expect(result).toEqual([
        { id: "sync-123", team_id: "team-123" }
      ]);
    });

    it("should parse supabase webhook", async () => {
      // Test Supabase webhook parsing with databaseId parameter
      const mockSupabase = createMockSupabase({ id: "table-123" });
      
      vi.doMock("../../../services/data-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { webhookParse } = await import("../../../services/data-sync/src/tasks/webhook-parser");
      const result = await webhookParse({ databaseId: "db-123" }, "supabase");

      expect(result).toEqual([
        { id: "sync-123", team_id: "team-123" }
      ]);
    });

    it("should parse notion webhook", async () => {
      // Test Notion webhook parsing with databaseId parameter
      const mockSupabase = createMockSupabase({ id: "table-123" });
      
      vi.doMock("../../../services/data-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { webhookParse } = await import("../../../services/data-sync/src/tasks/webhook-parser");
      const result = await webhookParse({ databaseId: "db-123" }, "notion");

      expect(result).toEqual([
        { id: "sync-123", team_id: "team-123" }
      ]);
    });

    it("should use default config for unknown provider", async () => {
      // Test fallback behavior for unsupported providers
      const mockSupabase = createMockSupabase({ id: "table-123" });
      
      vi.doMock("../../../services/data-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { webhookParse } = await import("../../../services/data-sync/src/tasks/webhook-parser");
      const result = await webhookParse({ tableName: "users" }, "unknown");

      expect(result).toEqual([
        { id: "sync-123", team_id: "team-123" }
      ]);
    });
  });
});

// ============================================================================
// LISTENER TASK TESTS
// ============================================================================

describe("data-sync listener task", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("setupListener", () => {
    it("should setup listener successfully", async () => {
      // Test successful listener setup with basic configuration
      const mockStrategy = {
        listen: vi.fn(() => Promise.resolve())
      };
      
      vi.doMock("../../../services/data-sync/src/strategies/listener", () => ({
        ListenerFactory: {
          listener: vi.fn(() => mockStrategy)
        }
      }));

      const { setupListener } = await import("../../../services/data-sync/src/tasks/listener");
      await setupListener("postgresql", { host: "localhost" }, "users");

      expect(mockStrategy.listen).toHaveBeenCalledWith(
        { host: "localhost" },
        "users",
        undefined
      );
    });

    it("should setup listener with webhook URL", async () => {
      // Test listener setup with webhook URL for notifications
      const mockStrategy = {
        listen: vi.fn(() => Promise.resolve())
      };
      
      vi.doMock("../../../services/data-sync/src/strategies/listener", () => ({
        ListenerFactory: {
          listener: vi.fn(() => mockStrategy)
        }
      }));

      const { setupListener } = await import("../../../services/data-sync/src/tasks/listener");
      await setupListener("postgresql", { host: "localhost" }, "users", "https://webhook.url");

      expect(mockStrategy.listen).toHaveBeenCalledWith(
        { host: "localhost" },
        "users",
        "https://webhook.url"
      );
    });

    it("should throw error when strategy fails", async () => {
      // Test error handling when the listener strategy fails
      vi.doMock("../../../services/data-sync/src/strategies/listener", () => ({
        ListenerFactory: {
          listener: vi.fn(() => ({
            listen: vi.fn(() => Promise.reject(new Error("Strategy error")))
          }))
        }
      }));

      const { setupListener } = await import("../../../services/data-sync/src/tasks/listener");
      
      await expect(setupListener("postgresql", { host: "localhost" }, "users"))
        .rejects.toThrow("Strategy error");
    });
  });
}); 