
// ✅ Allowed origins for CORS
const allowedOrigins = [
  Deno.env.get("LOCAL_URL") || "http://localhost:3000",
  Deno.env.get("PRODUCTION_URL") || "*",
];

// ✅ CORS Helper Function
export const handleCORS = (req: Request): Response | null => {
  const origin = req.headers.get("Origin");
  const hasOrigin = origin && allowedOrigins.includes(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": hasOrigin ? origin : "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, ApiKey",
      },
    });
  }

  return null;
};

export const handleReturnCORS = (req: Request) => {
  const origin = req.headers.get("Origin");
  const hasOrigin = origin && allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": hasOrigin ? origin : "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, ApiKey",
    "Content-Type": "application/json"
  };
};
