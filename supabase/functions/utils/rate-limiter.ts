import { Ratelimit } from "https://cdn.skypack.dev/@upstash/ratelimit@latest";
import { Redis } from "@upstash/redis";

// Create different rate limiters for different functions
const createRateLimiter = (requests: number, window: string) => {
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
};

// Rate limit configurations for different functions
const rateLimitConfigs = {
  'get-schema': { requests: 20, window: "1 m" }, // 20 requests per minute
  'validate-connection': { requests: 10, window: "1 m" }, // 10 requests per minute
  'oauth-callback': { requests: 5, window: "1 m" }, // 5 requests per minute (more restrictive for OAuth)
  'send-email': { requests: 3, window: "1 m" }, // 3 requests per minute (very restrictive for email sending)
  'default': { requests: 15, window: "1 m" } // Default rate limit
};

// Function to get a unique identifier for rate limiting
const getIdentifier = (req: Request): string => {
  // Try to get user ID from JWT token first
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      // Extract user ID from JWT (this is a simplified approach)
      // In production, you might want to decode the JWT properly
      return `user:${token.substring(0, 20)}`; // Use first 20 chars as identifier
    } catch (error) {
      console.warn('Failed to extract user ID from token:', error);
    }
  }

  // Fallback to IP address
  const forwardedFor = req.headers.get("X-Forwarded-For");
  const realIp = req.headers.get("X-Real-IP");
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
};

// Function to apply rate limiting
export async function applyRateLimit(req: Request, functionName?: string): Promise<Response | null> {
  try {
    // Get the appropriate rate limit configuration
    const config = rateLimitConfigs[functionName as keyof typeof rateLimitConfigs] || rateLimitConfigs.default;
    
    // Create rate limiter with the specific configuration
    const ratelimit = createRateLimiter(config.requests, config.window);
    
    // Get unique identifier
    const identifier = getIdentifier(req);
    
    // Apply rate limit
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

    if (!success) {
      return new Response(
        JSON.stringify({
          error: "Too many requests, please try again later.",
          limit,
          remaining,
          reset: new Date(reset).toISOString()
        }), 
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString()
          }
        }
      );
    }

    return null; // No rate limit exceeded, proceed with the request
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request to proceed (fail open)
    return null;
  }
}
