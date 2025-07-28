import { providerMap, SqlProvider } from "@/types/provider";
import { fillTemplate, loadSqlTemplate } from "../utils/template";

export interface ListenerStrategy {
    /**
     * Sets up a database listener (if supported by the provider).
     */
    listen(connectionConfig: any, tableName: string, webhookUrl?: string): Promise<void>;
}

export class SqlServerListenerStrategy implements ListenerStrategy {
    async listen(connectionConfig: any, tableName: string, webhookUrl?: string): Promise<void> {
        try {
            const template = loadSqlTemplate('sql-server');
            const sql = fillTemplate(template, { 
                table: tableName,
                webhook_url: webhookUrl || 'https://yourdomain.com'
            });
            
            // Execute the SQL using the connection config
            await this.executeSql(connectionConfig, sql);
            console.log(`Successfully set up SQL Server listener for table: ${tableName}`);
        } catch (error) {
            throw new Error(`Failed to setup SQL Server listener for table ${tableName}: ${error}`);
        }
    }

    private async executeSql(connectionConfig: any, sql: string): Promise<void> {
        // This would use a SQL Server client (like mssql) to execute the SQL
        // For now, we'll just log it
        console.log('Executing SQL Server SQL:', sql);
        // TODO: Implement actual SQL execution using connectionConfig
    }
}

export class MySqlListenerStrategy implements ListenerStrategy {
    async listen(connectionConfig: any, tableName: string, webhookUrl?: string): Promise<void> {
        try {
            const template = loadSqlTemplate('my-sql');
            const sql = fillTemplate(template, { 
                table: tableName,
                webhook_url: webhookUrl || 'https://yourdomain.com'
            });
            
            // Execute the SQL using the connection config
            await this.executeSql(connectionConfig, sql);
            console.log(`Successfully set up MySQL listener for table: ${tableName}`);
        } catch (error) {
            throw new Error(`Failed to setup MySQL listener for table ${tableName}: ${error}`);
        }
    }

    private async executeSql(connectionConfig: any, sql: string): Promise<void> {
        // This would use a MySQL client (like mysql2) to execute the SQL
        // For now, we'll just log it
        console.log('Executing MySQL SQL:', sql);
        // TODO: Implement actual SQL execution using connectionConfig
    }
}

export class PostgresListenerStrategy implements ListenerStrategy {
    async listen(connectionConfig: any, tableName: string, webhookUrl?: string): Promise<void> {
        try {
            const template = loadSqlTemplate('postgresql');
            const sql = fillTemplate(template, { 
                table: tableName,
                webhook_url: webhookUrl || 'https://yourdomain.com'
            });
            
            // Execute the SQL using the connection config
            await this.executeSql(connectionConfig, sql);
            console.log(`Successfully set up PostgreSQL listener for table: ${tableName}`);
        } catch (error) {
            throw new Error(`Failed to setup PostgreSQL listener for table ${tableName}: ${error}`);
        }
    }

    private async executeSql(connectionConfig: any, sql: string): Promise<void> {
        // This would use a PostgreSQL client (like pg) to execute the SQL
        // For now, we'll just log it
        console.log('Executing PostgreSQL SQL:', sql);
        // TODO: Implement actual SQL execution using connectionConfig
    }
}

export class MongoListenerStrategy implements ListenerStrategy {
    async listen(connectionConfig: any, tableName: string, webhookUrl?: string): Promise<void> {
        // MongoDB uses Change Streams, not SQL
        // This would be implemented in your backend code
        console.log(`Setting up MongoDB Change Stream for collection: ${tableName}`);
        console.log('Note: MongoDB Change Streams must be implemented in your backend code, not via SQL');
        
        // Example implementation (would be in your backend):
        // const changeStream = db.collection(tableName).watch();
        // changeStream.on('change', (change) => {
        //   fetch(webhookUrl, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(change)
        //   });
        // });
    }
}

/**
 * Factory function to get the appropriate listener strategy for a provider.
 */
export class ListenerFactory {
    static listener(provider: SqlProvider): ListenerStrategy {
        switch (provider) {
            case providerMap.sqlserver:
                return new SqlServerListenerStrategy();

            case providerMap.mysql:
                return new MySqlListenerStrategy();

            case providerMap.mongodb:
                return new MongoListenerStrategy();

            case providerMap.supabase:
            case providerMap.postgresql:
                return new PostgresListenerStrategy();

            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}

