import { vi, describe, it, expect } from "vitest";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

//SETUP
// mock the Resend client
vi.mock("npm:resend@4.0.5", () => ({
    Resend: vi.fn(() => ({
        emails: {
            send: vi.fn().mockResolvedValue({ success: true, id: "mock-email-id" })
        }
    }))
}));

// mock the cors functions
vi.mock("../supabase/utils/cors.ts", () => ({
    handleCORS: vi.fn(() => null),
    handleReturnCORS: vi.fn().mockReturnThis(),
}));

//TESTS
describe("Send Email Edge Function", () => {
    it("should handle a valid send email request", async () => {
        const mockRequest = new Request("http://localhost:3000/supabase/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                subject: "Test Subject",
                email: "test@test.com",
                message: "this is a test message",
            }),
        });

        const res = await serve(mockRequest);
        expect(res.headers.get("Content-Type")).toBe("application/json");
        expect(await res.json()).toEqual({
            success: true,
            id: "mock-email-id",
        });
    });
});

it("should return an error for missing fields", async () => {
    const mockRequest = new Request("http://localhost:3000/supabase/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Test Subject",
        email: "",
        message: "",
      }),
    });

    const res = await serve(mockRequest);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing required fields" });
  });
