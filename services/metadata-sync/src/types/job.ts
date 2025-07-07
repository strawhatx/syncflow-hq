export interface MetadataSyncJob {
    id: string;
    connection_id: string;
    connection: {
        id: string;
        connector: {
            id: string;
            provider: string;
        };
    };
    provider: string;
    status: string;
    created_at: string;
    updated_at: string;
}