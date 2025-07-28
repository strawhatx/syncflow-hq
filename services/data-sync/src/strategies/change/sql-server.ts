import { ChangeDetectionStrategy } from '.';
import { ConnectionPool, config as MSSQLConfig } from "mssql";

export class SqlServerChangeDetectionStrategy implements ChangeDetectionStrategy {
  private config(config: Record<string, any>): MSSQLConfig {
    // Transform generic config to mssql-specific format
    return {
      server: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      options: {
        encrypt: config.encrypt !== false, // Default to true for Azure
        trustServerCertificate: true
      }
    };
  }

  private async connect(config: Record<string, any>): Promise<{ valid: boolean, client: ConnectionPool | null }> {
    try {
      const mssqlConfig = this.config(config);
      const pool = new ConnectionPool(mssqlConfig);
      await pool.connect();
      return { valid: true, client: pool };
    } catch (error) {
      return { valid: false, client: null };
    }
  }

  async getChanges(syncConfig: any): Promise<any[]> {
    const { connectionConfig, tableName, lastSyncedAt } = syncConfig;

    // Connect to SQL Server and query for changes since last sync
    // This would use a library like mssql to connect and query
    const changes = await this.queryChangesFromLogs(connectionConfig, tableName, lastSyncedAt);

    return changes.map(change => ({
      ...change,
      modified_date: change.modified_date || new Date().toISOString(),
      table_name: tableName,
      provider: 'sqlserver'
    }));
  }

  async ensureChangeTrackingField(syncConfig: any): Promise<void> {
    const { connectionConfig, tableName } = syncConfig;

    // Check if updated_at column exists, if not, add it
    const hasUpdatedAt = await this.checkForUpdatedAtColumn(connectionConfig, tableName);

    if (!hasUpdatedAt) {
      // Add updated_at column if it doesn't exist
      await this.addUpdatedAtColumn(connectionConfig, tableName);

      // Create trigger to automatically update the updated_at field
      await this.createUpdateTrigger(connectionConfig, tableName);
    }
  }

  async setupListener(connectionConfig: any, tableName: string): Promise<void> {
    // Setup SQL Server Service Broker for real-time notifications
    await this.setupServiceBroker(connectionConfig, tableName);
  }

  private async queryChangesFromLogs(connectionConfig: any, tableName: string, lastSyncedAt: string): Promise<any[]> {
    // This would use mssql library to connect and query
    // For now, return mock data
    console.log(`Querying SQL Server logs for table ${tableName} since ${lastSyncedAt}`);

    // Mock implementation - replace with actual SQL Server connection
    return [
      {
        id: '1',
        data: { name: 'Test Record', status: 'active' },
        modified_date: new Date().toISOString(),
        operation: 'UPDATE'
      }
    ];
  }

  private async checkForUpdatedAtColumn(connectionConfig: any, tableName: string): Promise<boolean> {
    // Check if updated_at column exists
    console.log(`Checking for updated_at column in ${tableName}`);
    return false; // Mock - replace with actual check
  }

  private async addUpdatedAtColumn(connectionConfig: any, tableName: string): Promise<void> {
    // Add updated_at column if it doesn't exist
    console.log(`Adding updated_at column to ${tableName}`);
    // SQL: ALTER TABLE ${tableName} ADD updated_at DATETIME2 DEFAULT GETDATE()
  }

  private async createUpdateTrigger(connectionConfig: any, tableName: string): Promise<void> {
    // Create trigger to automatically update updated_at on INSERT/UPDATE
    console.log(`Creating update trigger for ${tableName}`);
    // SQL: CREATE TRIGGER tr_${tableName}_updated_at ON ${tableName} AFTER INSERT, UPDATE AS UPDATE ${tableName} SET updated_at = GETDATE() WHERE id IN (SELECT id FROM inserted)
  }

  private async setupServiceBroker(connectionConfig: any, tableName: string): Promise<void> {
    // Setup Service Broker for real-time notifications
    console.log(`Setting up Service Broker for ${tableName}`);
    // This would create the necessary Service Broker objects
  }
} 