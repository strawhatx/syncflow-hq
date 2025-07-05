import { vi, describe, it } from "vitest";
import * as connectionService from "@/services/connections/service";
import { Connector } from "@/types/connectors";

// Mock supabase client with full chain
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

// Mock the fetch call to the validate-connection edge function
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ valid: true }),
  } as Response)
);

describe("connectionService", () => {
  it("should create a connection", async () => {
    const team_id = "123";
    const connector: Connector = {
      id: "123",
      name: "test",
      type: "api_key",
      provider: "mongodb",
      is_active: true,
      config: {
        required_fields: ["test"],
        optional_fields: [],
        description: "",
        icon: ""
      }
    };
    const connectionName = "test";
    const config = { test: "test", url: "mongodb://test:test@test.com:27017/test" };

    await connectionService.createConnection(team_id, connector, connectionName, config);
  });
});