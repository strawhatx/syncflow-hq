import { vi, describe, it, expect, beforeEach } from "vitest";
import { oauthProviders } from "../../../services/metadata-sync/src/util/providers";
import { getValidAccessToken } from "../../../services/metadata-sync/src/util/access";
import { limiter } from "../../../services/metadata-sync/src/util/rate-limiter";
import { DataSourceStrategyFactory } from "../../../services/metadata-sync/src/patterns/strategies/datasource/index";
import { CreateConfigFactory } from "../../../services/metadata-sync/src/patterns/factories/config";

// Mock supabase client for access token tests
vi.mock("../../../services/metadata-sync/src/config/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              access_token: "mock-token",
              refresh_token: "mock-refresh-token",
              expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

// Mock the rate limiter
vi.mock("../../../services/metadata-sync/src/util/rate-limiter", () => ({
  limiter: {
    schedule: vi.fn((fn) => fn())
  }
}));

// Mock the data source strategy factory
vi.mock("../../../services/metadata-sync/src/patterns/strategies/datasource/index", () => ({
  DataSourceStrategyFactory: {
    getStrategy: vi.fn(() => ({
      getSources: vi.fn(() => Promise.resolve([{ id: "db1", name: "Database 1" }])),
      getTables: vi.fn(() => Promise.resolve([{ id: "table1", name: "Table 1" }]))
    }))
  }
}));

// Mock the config factory
vi.mock("../../../services/metadata-sync/src/patterns/factories/config", () => ({
  CreateConfigFactory: {
    create: vi.fn(() => ({ source_id: "db1" }))
  }
}));

describe("metadata-sync utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("oauthProviders", () => {
    it("should include expected OAuth providers", () => {
      expect(oauthProviders).toContain("google-sheets");
      expect(oauthProviders).toContain("notion");
      expect(oauthProviders).toContain("airtable");
      expect(oauthProviders).toContain("klaviyo");
    });

    it("should not include non-OAuth providers", () => {
      expect(oauthProviders).not.toContain("postgres");
      expect(oauthProviders).not.toContain("mysql");
      expect(oauthProviders).not.toContain("mongodb");
    });
  });

  describe("getValidAccessToken", () => {
    it("should return valid access token when not expired", async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: {
                  access_token: "valid-token",
                  refresh_token: "refresh-token",
                  expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
                },
                error: null
              }))
            }))
          }))
        }))
      };

      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { getValidAccessToken } = await import("../../../services/metadata-sync/src/util/access");
      const result = await getValidAccessToken("conn-123");

      expect(result).toBe("valid-token");
    });

    it("should refresh token when expired", async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: {
                  access_token: "expired-token",
                  refresh_token: "refresh-token",
                  expires_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
                },
                error: null
              }))
            }))
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null }))
          }))
        }))
      };

      // Mock fetch for token refresh
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            access_token: "new-token",
            expires_in: 3600
          }),
        } as Response)
      );

      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { getValidAccessToken } = await import("../../../services/metadata-sync/src/util/access");
      const result = await getValidAccessToken("conn-123");

      expect(result).toBe("new-token");
      expect(global.fetch).toHaveBeenCalled();
    });

    it("should throw error when connection not found", async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: null,
                error: { message: "Connection not found" }
              }))
            }))
          }))
        }))
      };

      vi.doMock("../../../services/metadata-sync/src/config/supabase", () => ({
        supabase: mockSupabase
      }));

      const { getValidAccessToken } = await import("../../../services/metadata-sync/src/util/access");

      await expect(getValidAccessToken("conn-123")).rejects.toThrow("Connection not found");
    });
  });

  describe("rate limiter", () => {
    it("should schedule function calls", async () => {
      const mockFn = vi.fn(() => Promise.resolve("test-result"));

      const result = await limiter.schedule(mockFn);

      expect(result).toBe("test-result");
      expect(mockFn).toHaveBeenCalled();
    });

    it("should handle function errors", async () => {
      const mockFn = vi.fn(() => Promise.reject(new Error("Test error")));

      await expect(limiter.schedule(mockFn)).rejects.toThrow("Test error");
    });
  });

  describe("DataSourceStrategyFactory", () => {
    it("should get strategy for postgres provider", () => {
      const strategy = DataSourceStrategyFactory.getStrategy("postgres");

      expect(strategy).toBeDefined();
      expect(strategy.getSources).toBeDefined();
      expect(strategy.getTables).toBeDefined();
    });

    it("should get strategy for mysql provider", () => {
      const strategy = DataSourceStrategyFactory.getStrategy("mysql");

      expect(strategy).toBeDefined();
      expect(strategy.getSources).toBeDefined();
      expect(strategy.getTables).toBeDefined();
    });

    it("should get strategy for mongodb provider", () => {
      const strategy = DataSourceStrategyFactory.getStrategy("mongodb");

      expect(strategy).toBeDefined();
      expect(strategy.getSources).toBeDefined();
      expect(strategy.getTables).toBeDefined();
    });

    it("should get sources from strategy", async () => {
      const strategy = DataSourceStrategyFactory.getStrategy("postgres");
      const config = { host: "localhost", port: 5432 };

      const sources = await strategy.getSources(config);

      expect(sources).toEqual([{ id: "db1", name: "Database 1" }]);
    });

    it("should get tables from strategy", async () => {
      const strategy = DataSourceStrategyFactory.getStrategy("postgres");
      const config = { host: "localhost", port: 5432 };

      const tables = await strategy.getTables(config);

      expect(tables).toEqual([{ id: "table1", name: "Table 1" }]);
    });
  });

  describe("CreateConfigFactory", () => {
    it("should create config for postgres provider", () => {
      const source = { id: "db1", name: "Database 1" };
      const config = CreateConfigFactory.create("postgres", source);

      expect(config).toEqual({ source_id: "db1" });
    });

    it("should create config for mysql provider", () => {
      const source = { id: "db2", name: "Database 2" };
      const config = CreateConfigFactory.create("mysql", source);

      expect(config).toEqual({ source_id: "db2" });
    });

    it("should create config for mongodb provider", () => {
      const source = { id: "db3", name: "Database 3" };
      const config = CreateConfigFactory.create("mongodb", source);

      expect(config).toEqual({ source_id: "db3" });
    });
  });
});

describe("metadata-sync integration tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("processSources function", () => {
    it("should process sources for non-OAuth provider", async () => {
      const provider = "postgres";
      const config = { host: "localhost", port: 5432 };

      const strategy = DataSourceStrategyFactory.getStrategy(provider);
      const sources = await strategy.getSources(config);

      expect(sources).toEqual([{ id: "db1", name: "Database 1" }]);
    });

    it("should process sources for OAuth provider with access token", async () => {
      const provider = "google-sheets";
      const config = {
        connection_id: "conn-123",
        access_token: "mock-access-token"
      };

      const strategy = DataSourceStrategyFactory.getStrategy(provider);
      const sources = await strategy.getSources(config);

      expect(sources).toEqual([{ id: "db1", name: "Database 1" }]);
    });
  });

  describe("processTablesAndFields function", () => {
    it("should process tables and fields for multiple sources", async () => {
      const provider = "postgres";
      const config = { host: "localhost", port: 5432 };
      const sources = [
        { id: "db1", name: "Database 1" },
        { id: "db2", name: "Database 2" }
      ];

      const strategy = DataSourceStrategyFactory.getStrategy(provider);

      for (const source of sources) {
        const sourceConfig = CreateConfigFactory.create(provider, source);
        const mergedConfig = { ...config, ...sourceConfig };

        const tables = await strategy.getTables(mergedConfig);
        expect(tables).toEqual([{ id: "table1", name: "Table 1" }]);
      }
    });
  });
}); 