import { useMemo } from "react";
import { useSourceDatabases, useDestinationDatabases } from "../hooks/useDataSources";
import { ConnectorWithConnections } from "@/services/connector/service";

interface UseDatabaseSelectionProps {
    accountId: string | undefined;
    connectors: ConnectorWithConnections[] | undefined;
    databaseId: string | undefined;
    setDatabaseId: (id: string) => void;
    side: "source" | "destination";
}

export function useDatabaseSelection(props: UseDatabaseSelectionProps) {
    const { accountId, connectors, databaseId, setDatabaseId, side } = props;

    // Find the connector for the selected account
    const connector = useMemo(
        () =>
            connectors?.find(conn =>
                conn.connections.some(connection => connection.id === accountId)
            ),
        [connectors, accountId]
    );

    // Fetch available databases for the selected account
    const dbHook = side === "source"
        ? useSourceDatabases(accountId)
        : useDestinationDatabases(accountId);

    return {
        connector,
        options: dbHook.data || [],
        isLoading: dbHook.isLoading,
        databaseId,
        setDatabaseId,
    };
}
