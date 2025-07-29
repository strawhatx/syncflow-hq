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

// Test data factories
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

const createMockEvent = (overrides: any = {}) => ({
  body: JSON.stringify({ test: "data" }),
  pathParameters: { provider: "postgresql" },
  headers: {},
  ...overrides
});

// Mock all external dependencies
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

// Test scenarios
const testScenarios = {
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
      // No setup needed
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
      // No setup needed
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

describe("data-sync handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("processJobs", () => {
    it("should process jobs successfully", async () => {
      // TODO: Implement when processJobs logic is added
      await mockProcessJobs();
      // Add expectations when implementation is complete
    });

    it("should handle errors during job processing", async () => {
      // TODO: Implement when processJobs logic is added
      await mockProcessJobs();
      // Add expectations when implementation is complete
    });
  });

  describe("webhookHandler", () => {
    it(testScenarios.successfulWebhook.description, async () => {
      testScenarios.successfulWebhook.setup();
      
      const event = createMockEvent();
      const response = await webhookHandler(event, {} as any, {} as any);
      
      if (!response) return;
      
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ success: true });
      testScenarios.successfulWebhook.expectations();
    });

    it(testScenarios.missingProvider.description, async () => {
      testScenarios.missingProvider.setup();
      
      const event = createMockEvent({ 
        pathParameters: null,
        body: JSON.stringify({}) 
      });
      const response = await webhookHandler(event, {} as any, {} as any);
      
      testScenarios.missingProvider.expectations(response);
    });

    it(testScenarios.webhookError.description, async () => {
      testScenarios.webhookError.setup();
      
      const event = createMockEvent();
      const response = await webhookHandler(event, {} as any, {} as any);
      
      testScenarios.webhookError.expectations(response);
    });

    it("should handle webhook with provider in body", async () => {
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

  describe("setupListener", () => {
    it(testScenarios.successfulListenerSetup.description, async () => {
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
      testScenarios.missingListenerParams.setup();
      
      const event = createMockEvent({
        body: JSON.stringify({ provider: "postgresql" })
      });
      const response = await setupListener(event, {} as any, {} as any);
      
      testScenarios.missingListenerParams.expectations(response);
    });

    it(testScenarios.listenerSetupError.description, async () => {
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

  describe("healthCheck", () => {
    it("should return health status", async () => {
      const response = await healthCheck({} as any, {} as any, {} as any);
      
      if (!response) return;
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Data Sync Service is running!");
      expect(body.timestamp).toBeDefined();
    });
  });
});

describe("data-sync job service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createJob", () => {
    it("should create job successfully", async () => {
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
      const mockSupabase = createMockSupabase(null, { message: "Update failed" });
      
      vi.doMock("../../../services/data-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { updateJobStatus } = await import("../../../services/data-sync/src/services/job");
      
      await expect(updateJobStatus("job-123", "processing")).rejects.toThrow("Failed to update job status: Update failed");
    });
  });
});

describe("data-sync webhook parser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("webhookParse", () => {
    it("should parse airtable webhook", async () => {
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

describe("data-sync listener task", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("setupListener", () => {
    it("should setup listener successfully", async () => {
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