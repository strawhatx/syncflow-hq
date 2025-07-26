# Data Sync Service

This service handles data synchronization jobs for SyncFlow. It provides APIs to create and manage data sync jobs that run on a schedule.

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

### Create Data Sync Job
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
      "progress": 0,
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

## Job Status Flow

1. **pending** - Job is created and waiting to be processed
2. **running** - Job is currently being executed
3. **completed** - Job finished successfully
4. **failed** - Job encountered an error

## Database Schema

The service uses the `data_sync_jobs` table in Supabase:

- `id` - Unique job identifier
- `sync_id` - Reference to the sync configuration
- `team_id` - Reference to the team
- `status` - Current job status
- `progress` - Progress percentage (0-100)
- `last_synced_at` - Timestamp of last sync
- `error` - Error message if failed
- `created_at` - Job creation timestamp
- `updated_at` - Last update timestamp 