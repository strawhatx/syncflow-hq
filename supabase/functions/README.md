# Supabase Edge Functions with Rate Limiting

This directory contains Supabase Edge Functions with production-grade rate limiting implemented using Upstash Redis.

## Edge Functions Overview

### Available Functions

1. **get-schema** - Retrieve database schemas and table information from various data sources
2. **validate-connection** - Test and validate connection configurations for data sources
3. **oauth-callback** - Handle OAuth authentication flows for third-party integrations
4. **send-email** - Send emails using Resend service

## Rate Limiting Implementation

### Overview
All Edge Functions now include rate limiting to protect against abuse and ensure fair usage. The rate limiting is implemented using the `@upstash/ratelimit` library with Redis as the backend store.

### Configuration

#### Environment Variables Required
```bash
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

#### Rate Limits by Function
- **get-schema**: 20 requests per minute
- **validate-connection**: 10 requests per minute
- **oauth-callback**: 5 requests per minute (more restrictive for OAuth flows)
- **send-email**: 3 requests per minute (very restrictive for email sending)
- **default**: 15 requests per minute (fallback for any function not explicitly configured)

### How It Works

1. **Identifier Generation**: The rate limiter uses a unique identifier for each request:
   - First tries to extract user ID from JWT token
   - Falls back to IP address if no token is available

2. **Sliding Window**: Uses a sliding window algorithm for more accurate rate limiting

3. **Response Headers**: When rate limited, the response includes:
   - `X-RateLimit-Limit`: Maximum requests allowed
   - `X-RateLimit-Remaining`: Remaining requests in the window
   - `X-RateLimit-Reset`: When the rate limit resets

4. **Fail-Open**: If rate limiting fails (e.g., Redis unavailable), requests are allowed to proceed

### Error Response
When rate limited, the function returns:
```json
{
  "error": "Too many requests, please try again later.",
  "limit": 20,
  "remaining": 0,
  "reset": "2024-01-01T12:00:00.000Z"
}
```

## Function Details

### 1. get-schema

**Purpose**: Retrieves database schemas, tables, and data sources from various providers.

**Endpoint**: `POST /functions/v1/get-schema`

**Supported Providers**:
- **Airtable**: Get bases and tables
- **Supabase**: Get projects and tables
- **Google Sheets**: Get spreadsheets and sheets
- **Notion**: Get databases and pages
- **PostgreSQL**: Get databases and tables
- **MySQL**: Get databases and tables
- **MongoDB**: Get databases and collections
- **AWS S3**: Get buckets and objects

**Request Body**:
```json
{
  "connection_id": "uuid",
  "provider": "postgresql",
  "action": "tables",
  "config": {
    "database": "my_database"
  }
}
```

**Actions**:
- `tables`: Get tables/collections from a specific database
- `sources`: Get available databases/projects/bases

**Response**:
```json
[
  {
    "name": "users",
    "type": "table",
    "columns": [
      { "name": "id", "type": "uuid" },
      { "name": "email", "type": "text" }
    ]
  }
]
```

### 2. validate-connection

**Purpose**: Tests connection configurations before creating connections.

**Endpoint**: `POST /functions/v1/validate-connection`

**Request Body**:
```json
{
  "provider": "postgresql",
  "config": {
    "host": "localhost",
    "port": 5432,
    "database": "test_db",
    "username": "user",
    "password": "password"
  }
}
```

**Response**:
```json
{
  "valid": true,
  "error": null
}
```

### 3. oauth-callback

**Purpose**: Handles OAuth 2.0 authentication flows for third-party integrations.

**Endpoint**: `POST /functions/v1/oauth-callback`

**Supported OAuth Providers**:
- Google (Google Sheets, Gmail, etc.)
- Notion
- Airtable
- Supabase
- Other OAuth 2.0 compliant services

**OAuth Flow**:
1. User initiates OAuth flow from frontend
2. User is redirected to provider's authorization URL
3. Provider redirects back to your app with authorization code
4. This function exchanges code for access/refresh tokens
5. Tokens are stored in the connections table

**Request Body**:
```json
{
  "team_id": "uuid",
  "connectionName": "My Google Sheets",
  "provider": "google_sheets",
  "code": "authorization_code_from_provider",
  "code_verifier": "pkce_code_verifier",
  "state": "base64_encoded_state_data"
}
```

**State Data Structure**:
```json
{
  "user_id": "uuid",
  "redirectUri": "https://your-app.com/oauth/callback"
}
```

**Response**:
```json
{
  "id": "connection_uuid",
  "name": "My Google Sheets",
  "provider": "google_sheets",
  "is_active": true,
  "config": {
    "access_token": "ya29.a0...",
    "refresh_token": "1//04...",
    "expires_at": 1704067200000
  }
}
```

### 4. send-email

**Purpose**: Sends emails using the Resend email service.

**Endpoint**: `POST /functions/v1/send-email`

**Environment Variables Required**:
```bash
RESEND_API_KEY=your_resend_api_key
```

**Request Body**:
```json
{
  "subject": "Welcome to SyncFlow",
  "email": "user@example.com",
  "message": "Thank you for joining SyncFlow!"
}
```

**Response**:
```json
{
  "id": "email_id",
  "from": "support@syncflow.com",
  "to": "user@example.com",
  "subject": "Welcome to SyncFlow"
}
```

## OAuth Implementation Details

### PKCE (Proof Key for Code Exchange)
The OAuth implementation supports PKCE for enhanced security:

1. **Code Challenge**: Generated on the frontend using SHA256 hash
2. **Code Verifier**: Random string used to generate the challenge
3. **State Parameter**: Base64 encoded JSON containing user context

### Token Management
- **Access Tokens**: Short-lived tokens for API access
- **Refresh Tokens**: Long-lived tokens for obtaining new access tokens
- **Automatic Refresh**: Access tokens are automatically refreshed when expired
- **Secure Storage**: Tokens are encrypted and stored in the connections table

### OAuth Configuration
Each connector in the database contains OAuth configuration:
```json
{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "auth_url": "https://accounts.google.com/oauth/authorize",
  "token_url": "https://oauth2.googleapis.com/token",
  "redirect_url": "https://your-app.com/oauth/callback",
  "scopes": ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  "code_challenge_required": true
}
```

## Setup Instructions

1. **Create Upstash Redis Database**:
   - Go to [Upstash](https://upstash.com/)
   - Create a new Redis database
   - Copy the REST URL and token

2. **Configure Environment Variables**:
   - Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your Supabase project
   - Set `RESEND_API_KEY` for email functionality
   - These can be set via the Supabase dashboard or CLI

3. **Set up OAuth Applications**:
   - Create OAuth applications in each provider's developer console
   - Configure redirect URIs to point to your OAuth callback function
   - Add client IDs and secrets to the connectors table

4. **Deploy Functions**:
   ```bash
   supabase functions deploy
   ```

## API Usage Examples

### Testing a Connection
```bash
curl -X POST https://your-project.supabase.co/functions/v1/validate-connection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "postgresql",
    "config": {
      "host": "localhost",
      "port": 5432,
      "database": "test_db",
      "username": "user",
      "password": "password"
    }
  }'
```

### Getting Schema Information
```bash
curl -X POST https://your-project.supabase.co/functions/v1/get-schema \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "connection_id": "your_connection_id",
    "provider": "postgresql",
    "action": "tables",
    "config": {
      "database": "my_database"
    }
  }'
```

### Sending an Email
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Email",
    "email": "recipient@example.com",
    "message": "This is a test email from SyncFlow."
  }'
```

## Monitoring

The rate limiting implementation includes analytics that can be viewed in your Upstash dashboard. This helps you monitor usage patterns and adjust limits as needed.

## Customization

To modify rate limits, edit the `rateLimitConfigs` object in `utils/rate-limiter.ts`:

```typescript
const rateLimitConfigs = {
  'your-function': { requests: 50, window: "1 m" }, // 50 requests per minute
  // ... other configurations
};
```

## Security Considerations

- Rate limits are applied per user (JWT token) or per IP address
- OAuth callback has stricter limits to prevent abuse
- Email sending has very strict limits to prevent spam
- All functions include proper error handling and logging
- JWT tokens are validated on every request
- OAuth state parameters prevent CSRF attacks
- PKCE implementation enhances OAuth security
- Sensitive data is encrypted in the database

## Error Handling

All functions return consistent error responses:
```json
{
  "error": "Descriptive error message",
  "details": "Additional error details if available"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (invalid JWT)
- `405`: Method Not Allowed
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error 