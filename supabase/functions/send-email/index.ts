import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  try {
    // Apply rate limiting first
    const rateLimitResponse = await applyRateLimit(req, 'send-email');
    if (rateLimitResponse) return rateLimitResponse;

    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    const { subject, email, message } = await req.json();

    if (!subject || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: handleReturnCORS(req), status: 400 }
      );
    }

    const result = await resend.emails.send({
      from: 'support@syncflow.com',
      to: email,
      subject: subject,
      text: message,
    });

    return new Response(JSON.stringify(result), { headers: handleReturnCORS(req), status: 200 });

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: handleReturnCORS(req), status: 500 }
    );
  }
}); 