import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { vi, describe, it, expect } from "vitest";
//INITALIZATION
// mock data for a connector
const mockConnectorData = {
    id: "123",
    name: "Google Sheets",
    provider: "google_sheets",
    config: {
        client_id: "mock-client-id",
        client_secret: "mock-client-secret",
        token_url: "https://oauth2.googleapis.com/token",
        auth_url: "https://accounts.google.com/o/oauth2/auth",
        code_challenge_required: false,
    },
    created_at: new Date(),
    updated_at: new Date(),
};

// mock data for a connection
// Mock data for a connection
const mockConnectionData = {
    connector_id: "connector-id",
    name: "Test Connection",
    is_active: true,
    team_id: "team-id",
    config: {
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      expires_at: Date.now() + 3600 * 1000, // 1 hour from now
      provider: "google_sheets",
      timestamp: new Date().toISOString(),
    },
  };

  // Mock OAuth callback request
const mockOauthCallbackRequest = {
    code: "mock-code",
    state: btoa(JSON.stringify({ user_id: "user-id", redirectUri: "http://localhost:3000/callback" })),
    connectionName: "Test Connection",
    provider: "google_sheets",
    code_verifier: "mock-code-verifier",
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_at: Date.now() + 3600 * 1000, // 1 hour from now
};

//SETUP
// mock supabase client
vi.mock("npm:@supabase/supabase-js@2", () => ({
    createClient: vi.fn(() => ({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockConnectorData, error: null }),
        upsert: vi.fn().mockResolvedValue({ data: [mockConnectionData], error: null }),
    }))
}));

// mock the cors headers
vi.mock("../supabase/utils/cors.ts", () => ({
    handleCORS: vi.fn(() => null),
    handleReturnCORS: vi.fn().mockReturnThis(),
}));

// mock the auth utils
vi.mock("../supabase/utils/auth.ts", () => ({
    validateSupabaseToken: vi.fn().mockResolvedValue(true),
}));

// mock the fetch function for token exchange
global.fetch = vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockOauthCallbackRequest)
}) as any);

//TESTS
// we support the folllowing oauth providers:
// - Google Sheets
// - Notion
// - Airtable
// - Supabase ??
describe("Oauth Callback Edge Function", () => {
    it("should handle a valid Oauth callback request", async () => {
        const mockRequest = new Request("http://localhost:3000/supabase/oauth-callback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${mockOauthCallbackRequest.access_token}`,
            },
            body: JSON.stringify(mockOauthCallbackRequest),
        });

        const res = await serve(mockRequest);
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("application/json");
        expect(await res.json()).toEqual(mockConnectionData);
    });
});




