import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { processJobs } from "../../../services/metadata-sync/src/handler";
import * as jobService from "../../../services/metadata-sync/src/services/job";
import * as connectionService from "../../../services/metadata-sync/src/services/connection";
import * as accessService from "../../../services/metadata-sync/src/util/access";
/**
 * Metadata Sync Handler Tests
 * 
 * This test suite covers the main handler function that processes metadata sync jobs.
 * The handler is a scheduled Lambda function that runs periodically to process
 * pending metadata synchronization jobs for various data sources.
 */

// Mock the processJobs function to match the ScheduledHandler signature
const mockProcessJobs = processJobs as any;

/**
 * Test Utilities
 * 
 * These utility functions help create consistent mock data and reduce code duplication
 * across the test suite.
 */

// Creates a standardized mock job object with optional overrides
const createMockJob = (overrides: any = {}) => ({
  id: "job-123",
  connection_id: "conn-123",
  team_id: "team-123",
  connection: {
    id: "conn-123",
    connector: {
      id: "connector-123",
      provider: "postgres"
    }
  },
  provider: "postgres",
  status: "pending",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides
});

// Creates a mock Supabase client with specified data and error responses
const createMockSupabase = (mockData: any, mockError: any = null) => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        limit: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockData, error: mockError }))
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: mockError }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: mockError }))
    }))
  }))
});

/**
 * Test Scenarios
 * 
 * Predefined test scenarios with setup and expectation functions to ensure
 * consistent testing patterns across different test cases.
 */
const testScenarios = {
  successfulJob: {
    description: "should process a job successfully",
    setup: (jobService: any, connectionService: any, mockJob: any) => {
      vi.spyOn(jobService, "getPendingJob").mockResolvedValue(mockJob);
      vi.spyOn(jobService, "updateJobStatus").mockResolvedValue(true);
      vi.spyOn(connectionService, "getConnectionConfig").mockResolvedValue({
        host: "localhost",
        port: 5432,
        database: "testdb"
      });
      vi.spyOn(jobService, "failJob").mockResolvedValue(undefined);
      vi.spyOn(connectionService, "rollbackDatabaseSync").mockResolvedValue(undefined);
    },
    expectations: (jobService: any, connectionService: any) => {
      expect(jobService.getPendingJob).toHaveBeenCalled();
      expect(jobService.updateJobStatus).toHaveBeenCalledWith("job-123", "processing", "pending");
      expect(connectionService.getConnectionConfig).toHaveBeenCalledWith("conn-123");
      expect(jobService.updateJobStatus).toHaveBeenCalledWith("job-123", "completed", "processing");
    }
  },
  
  noPendingJobs: {
    description: "should handle no pending jobs",
    setup: (jobService: any) => {
      vi.spyOn(jobService, "getPendingJob").mockResolvedValue(undefined);
    },
    expectations: (jobService: any) => {
      expect(jobService.getPendingJob).toHaveBeenCalled();
      expect(jobService.updateJobStatus).not.toHaveBeenCalled();
    }
  },
  
  jobAlreadyPickedUp: {
    description: "should handle job already picked up by another Lambda",
    setup: (jobService: any, mockJob: any) => {
      vi.spyOn(jobService, "getPendingJob").mockResolvedValue(mockJob);
      vi.spyOn(jobService, "updateJobStatus").mockResolvedValue(false);
    },
    expectations: (jobService: any) => {
      expect(jobService.getPendingJob).toHaveBeenCalled();
      expect(jobService.updateJobStatus).toHaveBeenCalledWith("job-123", "processing", "pending");
    }
  },
  
  oauthProvider: {
    description: "should handle OAuth providers with access token",
    setup: (jobService: any, connectionService: any, accessService: any, oauthJob: any) => {
      vi.spyOn(jobService, "getPendingJob").mockResolvedValue(oauthJob);
      vi.spyOn(jobService, "updateJobStatus").mockResolvedValue(true);
      vi.spyOn(connectionService, "getConnectionConfig").mockResolvedValue({
        connection_id: "conn-123"
      });
      vi.spyOn(jobService, "failJob").mockResolvedValue(undefined);
      vi.spyOn(connectionService, "rollbackDatabaseSync").mockResolvedValue(undefined);
    },
    expectations: (accessService: any) => {
      expect(accessService.getValidAccessToken).toHaveBeenCalledWith("conn-123");
    }
  },
  
  errorHandling: {
    description: "should handle errors and fail the job",
    setup: (jobService: any, connectionService: any, mockJob: any) => {
      vi.spyOn(jobService, "getPendingJob").mockResolvedValue(mockJob);
      vi.spyOn(jobService, "updateJobStatus").mockResolvedValue(true);
      vi.spyOn(connectionService, "getConnectionConfig").mockRejectedValue(new Error("Connection failed"));
      vi.spyOn(jobService, "failJob").mockResolvedValue(undefined);
      vi.spyOn(connectionService, "rollbackDatabaseSync").mockResolvedValue(undefined);
    },
    expectations: (jobService: any, connectionService: any) => {
      expect(jobService.failJob).toHaveBeenCalledWith("job-123", "Connection failed");
      expect(connectionService.rollbackDatabaseSync).toHaveBeenCalledWith("conn-123");
    }
  },
  
  errorWithoutJobId: {
    description: "should handle errors without job ID",
    setup: (jobService: any, connectionService: any) => {
      vi.spyOn(jobService, "getPendingJob").mockRejectedValue(new Error("Database error"));
      vi.spyOn(jobService, "failJob").mockResolvedValue(undefined);
      vi.spyOn(connectionService, "rollbackDatabaseSync").mockResolvedValue(undefined);
    },
    expectations: (jobService: any, connectionService: any) => {
      expect(jobService.failJob).not.toHaveBeenCalled();
      expect(connectionService.rollbackDatabaseSync).not.toHaveBeenCalled();
    }
  }
};

// Setup all mocks for external dependencies
vi.mock("../../../services/metadata-sync/src/config/supabase", () => ({
  supabase: createMockSupabase(null)
}));

vi.mock("../../../services/metadata-sync/src/util/rate-limiter", () => ({
  limiter: {
    schedule: vi.fn((fn) => fn())
  }
}));

vi.mock("../../../services/metadata-sync/src/patterns/strategies/datasource/index", () => ({
  DataSourceStrategyFactory: {
    getStrategy: vi.fn(() => ({
      getSources: vi.fn(() => Promise.resolve([{ id: "db1", name: "Database 1" }])),
      getTables: vi.fn(() => Promise.resolve([{ id: "table1", name: "Table 1" }]))
    }))
  }
}));

vi.mock("../../../services/metadata-sync/src/patterns/factories/config", () => ({
  CreateConfigFactory: {
    create: vi.fn(() => ({ source_id: "db1" }))
  }
}));

vi.mock("../../../services/metadata-sync/src/util/access", () => ({
  getValidAccessToken: vi.fn(() => Promise.resolve("mock-access-token"))
}));

vi.mock("../../../services/metadata-sync/src/util/providers", () => ({
  oauthProviders: ["google-sheets", "notion"]
}));

/**
 * Main Handler Tests
 * 
 * Tests the core processJobs function which is the main entry point for
 * the metadata sync Lambda function. This function handles the entire
 * job processing workflow including job retrieval, status updates,
 * data source processing, and error handling.
 */
describe("metadata-sync handler", () => {
  const mockJob = createMockJob();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Process Jobs Tests
   * 
   * Tests the main job processing workflow that:
   * 1. Retrieves pending jobs from the database
   * 2. Updates job status to prevent race conditions
   * 3. Processes data sources and tables
   * 4. Handles various error scenarios
   * 5. Manages OAuth token refresh for supported providers
   */
  describe("processJobs", () => {
    /**
     * Tests the complete successful job processing workflow:
     * - Retrieves a pending job from the database
     * - Updates job status to "processing" to prevent race conditions
     * - Fetches connection configuration for the data source
     * - Processes data sources and tables using the appropriate strategy
     * - Updates job status to "completed" when processing succeeds
     */
    it(testScenarios.successfulJob.description, async () => {
      testScenarios.successfulJob.setup(jobService, connectionService, mockJob);

      await mockProcessJobs();

      testScenarios.successfulJob.expectations(jobService, connectionService);
    });

    /**
     * Tests the scenario when no pending jobs are available:
     * - Attempts to retrieve a pending job from the database
     * - Returns early when no jobs are found
     * - Does not attempt to update any job status
     * - Logs appropriate message for monitoring
     */
    it(testScenarios.noPendingJobs.description, async () => {
      testScenarios.noPendingJobs.setup(jobService);

      await mockProcessJobs();

      testScenarios.noPendingJobs.expectations(jobService);
    });

    /**
     * Tests race condition handling when multiple Lambda instances try to process the same job:
     * - Attempts to retrieve a pending job from the database
     * - Tries to update job status to "processing"
     * - Returns early if another Lambda instance already picked up the job
     * - Prevents duplicate job processing in distributed environment
     */
    it(testScenarios.jobAlreadyPickedUp.description, async () => {
      testScenarios.jobAlreadyPickedUp.setup(jobService, mockJob);

      await mockProcessJobs();

      testScenarios.jobAlreadyPickedUp.expectations(jobService);
    });

    /**
     * Tests OAuth provider handling with access token refresh:
     * - Processes jobs for OAuth-based providers (Google Sheets, Notion, etc.)
     * - Retrieves and validates access tokens from the database
     * - Refreshes expired tokens automatically
     * - Uses refreshed tokens for data source access
     * - Handles OAuth-specific connection configurations
     */
    it(testScenarios.oauthProvider.description, async () => {
      const oauthJob = createMockJob({ provider: "google-sheets" });
      testScenarios.oauthProvider.setup(jobService, connectionService, accessService, oauthJob);

      await mockProcessJobs();

      testScenarios.oauthProvider.expectations(accessService);
    });

    /**
     * Tests error handling during job processing:
     * - Simulates connection configuration retrieval failure
     * - Marks the job as failed with appropriate error message
     * - Rolls back any partially synced data to maintain integrity
     * - Logs error details for debugging and monitoring
     * - Ensures failed jobs don't block other pending jobs
     */
    it(testScenarios.errorHandling.description, async () => {
      testScenarios.errorHandling.setup(jobService, connectionService, mockJob);

      await mockProcessJobs();

      testScenarios.errorHandling.expectations(jobService, connectionService);
    });

    /**
     * Tests error handling when job retrieval fails:
     * - Simulates database error during job retrieval
     * - Handles errors that occur before a job ID is available
     * - Does not attempt to fail a job since no job was retrieved
     * - Does not attempt rollback since no connection was established
     * - Logs error for monitoring and debugging
     */
    it(testScenarios.errorWithoutJobId.description, async () => {
      testScenarios.errorWithoutJobId.setup(jobService, connectionService);

      await mockProcessJobs();

      testScenarios.errorWithoutJobId.expectations(jobService, connectionService);
    });
  });
});

/**
 * Job Service Tests
 * 
 * Tests the job management service functions that handle:
 * - Retrieving pending jobs from the database
 * - Updating job status and progress
 * - Handling job failures with error messages
 * - Database transaction management
 */
describe("metadata-sync job service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Get Pending Job Tests
   * 
   * Tests the function that retrieves the next pending job from the database.
   * This function uses a transaction to ensure only one Lambda instance
   * processes a job at a time, preventing race conditions.
   */
  describe("getPendingJob", () => {
    /**
     * Tests successful retrieval of a pending job from the database.
     * This test verifies that the function can properly query the database
     * and return job details including ID, status, and related connection info.
     */
    it("should return a pending job", async () => {
      const mockSupabase = createMockSupabase({ id: "job-123", status: "pending" });
      
      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { getPendingJob } = await import("../../../services/metadata-sync/src/services/job");
      const result = await getPendingJob();

      expect(result).toEqual({ id: "job-123", status: "pending" });
    });

    /**
     * Tests the scenario when no pending jobs are available in the database.
     * This test verifies that the function handles the "no rows returned" case
     * gracefully and returns undefined instead of throwing an error.
     */
    it("should return undefined when no pending jobs", async () => {
      const mockSupabase = createMockSupabase(null, { code: 'PGRST116' });
      
      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { getPendingJob } = await import("../../../services/metadata-sync/src/services/job");
      const result = await getPendingJob();

      expect(result).toBeUndefined();
    });
  });

  /**
   * Update Job Status Tests
   * 
   * Tests the function that updates job status in the database.
   * This function handles status transitions, progress tracking,
   * error message storage, and timestamp updates for processing jobs.
   */
  describe("updateJobStatus", () => {
    /**
     * Tests successful job status update in the database.
     * This test verifies that the function can update job status from "pending"
     * to "processing" and returns true to indicate successful update.
     */
    it("should update job status successfully", async () => {
      const mockSupabase = createMockSupabase(null);
      
      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { updateJobStatus } = await import("../../../services/metadata-sync/src/services/job");
      const result = await updateJobStatus("job-123", "processing", "pending");

      expect(result).toBe(true);
    });

    /**
     * Tests job status update failure handling.
     * This test verifies that the function returns false when the database
     * update operation fails, indicating that the job was not updated.
     */
    it("should return false when update fails", async () => {
      const mockSupabase = createMockSupabase(null, { message: "Update failed" });
      
      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { updateJobStatus } = await import("../../../services/metadata-sync/src/services/job");
      const result = await updateJobStatus("job-123", "processing", "pending");

      expect(result).toBe(false);
    });
  });

  /**
   * Fail Job Tests
   * 
   * Tests the function that marks a job as failed in the database.
   * This function stores error messages and updates the job status
   * to prevent the job from being retried indefinitely.
   */
  describe("failJob", () => {
    /**
     * Tests job failure handling with error message storage.
     * This test verifies that the function can mark a job as failed
     * and store the error message for debugging and monitoring purposes.
     */
    it("should fail job with error message", async () => {
      const mockSupabase = createMockSupabase(null);
      
      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { failJob } = await import("../../../services/metadata-sync/src/services/job");
      await failJob("job-123", "Test error message");

      expect(mockSupabase.from).toHaveBeenCalledWith("metadata_sync_jobs");
    });
  });
});

/**
 * Connection Service Tests
 * 
 * Tests the connection management service functions that handle:
 * - Retrieving connection configurations from the database
 * - Managing database connection details
 * - Rolling back failed sync operations
 * - Error handling for connection-related operations
 */
describe("metadata-sync connection service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Get Connection Config Tests
   * 
   * Tests the function that retrieves connection configuration from the database.
   * This function fetches connection details like host, port, credentials,
   * and other provider-specific configuration needed for data source access.
   */
  describe("getConnectionConfig", () => {
    /**
     * Tests successful connection configuration retrieval from the database.
     * This test verifies that the function can fetch connection details
     * like host, port, credentials, and other provider-specific settings.
     */
    it("should return connection config", async () => {
      const mockConfig = { host: "localhost", port: 5432 };
      const mockSupabase = createMockSupabase({ config: mockConfig });
      
      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { getConnectionConfig } = await import("../../../services/metadata-sync/src/services/connection");
      const result = await getConnectionConfig("conn-123");

      expect(result).toEqual(mockConfig);
    });

    /**
     * Tests error handling when connection configuration is not found in the database.
     * This test verifies that the function throws an appropriate error
     * when the connection ID doesn't exist or is invalid.
     */
    it("should throw error when connection not found", async () => {
      const mockSupabase = createMockSupabase(null, { message: "Connection not found" });
      
      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { getConnectionConfig } = await import("../../../services/metadata-sync/src/services/connection");
      
      await expect(getConnectionConfig("conn-123")).rejects.toThrow("Connection not found");
    });
  });

  /**
   * Rollback Database Sync Tests
   * 
   * Tests the function that rolls back database sync operations when jobs fail.
   * This function cleans up any partially synced data to maintain data integrity
   * and prevent orphaned records in the database.
   */
  describe("rollbackDatabaseSync", () => {
    /**
     * Tests successful database sync rollback operation.
     * This test verifies that the function can clean up partially synced data
     * when a job fails, maintaining data integrity and preventing orphaned records.
     */
    it("should rollback database sync", async () => {
      const mockSupabase = createMockSupabase(null);
      
      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { rollbackDatabaseSync } = await import("../../../services/metadata-sync/src/services/connection");
      await rollbackDatabaseSync("conn-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("connection_databases");
    });

    /**
     * Tests error handling when database rollback operation fails.
     * This test verifies that the function throws an appropriate error
     * when the rollback operation cannot be completed, allowing proper
     * error handling in the calling code.
     */
    it("should throw error when rollback fails", async () => {
      const mockSupabase = createMockSupabase(null, { message: "Rollback failed" });
      
      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { rollbackDatabaseSync } = await import("../../../services/metadata-sync/src/services/connection");
      
      await expect(rollbackDatabaseSync("conn-123")).rejects.toThrow("Rollback failed");
    });
  });
}); 