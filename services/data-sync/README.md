# Data Sync Service

This service handles real-time data synchronization for SyncFlow using a polling-based change detection system. It supports multiple data sources (Airtable, Notion, Google Sheets, Supabase, SQL Server, PostgreSQL, MySQL, MongoDB) with scalable, incremental sync capabilities.

## Architecture Overview

The service uses a **polling-based change detection** system that:
- Runs on a schedule (every 1-5 minutes) to check for data changes
- Uses provider-specific strategies for efficient change detection
- Requires "last modified" fields for large datasets (10k+ rows) to ensure scalability
- Processes sync jobs through a centralized queue system
- Supports both webhook and polling triggers

## Supported Data Sources

### SaaS Applications
- **Airtable**: Uses "Last Modified Time" field for incremental syncs
- **Notion**: Uses built-in `last_edited_time` property
- **Google Sheets**: Requires custom "Last Modified" column or Apps Script
- **Supabase**: Uses `updated_at` column with optional realtime subscriptions

### Databases
- **SQL Server**: Uses `updated_at` column or Change Tracking/CDC
- **PostgreSQL**: Uses `updated_at` column or logical replication
- **MySQL**: Uses `updated_at` column or binary log
- **MongoDB**: Uses `updatedAt` field or Change Streams

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   Create a `.env` file in the root of this service with:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## Development

**Run locally:**
```bash
npm run dev
```

This will start the service on `http://localhost:3001`

## Deployment

**Deploy to AWS:**
```bash
npm run deploy
```

## API Endpoints

### Webhook Handler (for supported sources)
- **POST** `/webhooks/{provider}`
- **Body:** Provider-specific webhook payload
- **Response:**
  ```json
  {
    "success": true
  }
  ```

### Create Data Sync Job (Manual)
- **POST** `/jobs`
- **Body:**
  ```json
  {
    "syncId": "uuid-of-sync",
    "teamId": "uuid-of-team"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Data sync job created successfully",
    "job": {
      "id": "job-uuid",
      "sync_id": "sync-uuid",
      "team_id": "team-uuid",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
  ```

### Health Check
- **GET** `/hello`
- **Response:**
  ```json
  {
    "message": "Data Sync Service is running!",
    "input": {}
  }
  ```

## Job Processing Flow

### Polling Handler (Scheduled)
1. **Fetch Active Syncs**: Get all enabled syncs that require polling
2. **Check for Changes**: Use provider-specific change detection
3. **Insert Jobs**: Create jobs in `data_sync_jobs` for detected changes
4. **Update Timestamps**: Mark last polled time for each sync

### Sync Worker (Job Processing)
1. **pending** - Job is created and waiting to be processed
2. **processing** - Job is currently being executed
3. **completed** - Job finished successfully
4. **failed** - Job encountered an error (with retry logic)

## Change Detection Requirements

### For Large Datasets (10k+ rows)
- **Required**: "Last Modified" or `updated_at` field
- **Rationale**: Full-table polling is not scalable for large datasets
- **Enforcement**: Sync setup will require this field for large tables

### For Small Datasets (<1k rows)
- **Optional**: Can use fallback methods (hash diffing, full-table comparison)
- **Warning**: Performance may be slower without incremental detection

## Database Schema

The service uses the `data_sync_jobs` table in Supabase:

- `id` - Unique job identifier (UUID)
- `sync_id` - Reference to the sync configuration
- `provider` - Data source provider (airtable, notion, sqlserver, etc.)
- `status` - Current job status (pending, processing, completed, failed)
- `payload` - JSON payload containing change data
- `error` - Error message if failed
- `retry_count` - Number of retry attempts
- `created_at` - Job creation timestamp
- `updated_at` - Last update timestamp
- `started_at` - When processing began
- `finished_at` - When processing completed

## Provider-Specific Implementation

Each data source has its own change detection strategy:

- **Airtable**: Uses "Last Modified Time" field with `filterByFormula`
- **SQL Databases**: Uses `updated_at` column with `WHERE updated_at > last_synced_at`
- **Notion**: Uses `last_edited_time` property for page/database changes
- **MongoDB**: Uses `updatedAt` field with `$gt` queries

## Scalability Features

- **Pagination**: All API calls are paginated to handle large datasets
- **Batch Processing**: Changes are processed in batches to avoid memory issues
- **Retry Logic**: Failed jobs are retried with exponential backoff
- **Concurrent Processing**: Multiple workers can process jobs simultaneously
- **Rate Limiting**: Respects API rate limits for each provider 