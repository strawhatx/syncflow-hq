import { providerMap, SqlProvider } from "@/types/provider";

export interface ListenerStrategy {
    /**
     * Sets up a database listener (if supported by the provider).
     */
    listen(connectionConfig: any, tableName: string): Promise<void>;
}

export class SqlServerListenerStrategy implements ListenerStrategy {
    async listen(connectionConfig: any, tableName: string): Promise<void> {
        const strategy = getListenerStrategy(providerMap.sqlserver);
        await strategy.listen(connectionConfig, tableName);
    }
}

export class MySqlListenerStrategy implements ListenerStrategy {
    async listen(connectionConfig: any, tableName: string): Promise<void> {
        const strategy = getListenerStrategy(providerMap.mysql);
        await strategy.listen(connectionConfig, tableName);
    }
}

export class PostgresListenerStrategy implements ListenerStrategy {
    async listen(connectionConfig: any, tableName: string): Promise<void> {
        const strategy = getListenerStrategy(providerMap.postgresql);
        await strategy.listen(connectionConfig, tableName);
    }
}

export class MongoListenerStrategy implements ListenerStrategy {
    async listen(connectionConfig: any, tableName: string): Promise<void> {
        // Use in your Node.js backend, not as a DB script
        const changeStream = db.collection('your_collection').watch();
        changeStream.on('change', (change) => {
            // POST to your webhook
            fetch('https://yourdomain.com/webhooks/mongodb', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(change)
            });
        });
    }
}


/**
 * Factory function to get the appropriate change detection strategy for a provider.
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

