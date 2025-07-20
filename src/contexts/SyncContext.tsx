import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Sync, SyncConfig, SyncFieldMapping, SyncFilter, defaultCreateSync } from "@/types/sync";
import { useAuth } from "./AuthContext";
import { useTeam } from "./TeamContext";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ConnectorWithConnections, fetchConnectors } from "@/services/connector/service";

export type AccountSide = "source_id" | "destination_id";
export type DataSourceSide = "source_database_id" | "destination_database_id";

interface SyncContextType {
    syncConfig: Sync | Omit<Sync, "id">;
    connectors: ConnectorWithConnections[] | undefined;

    setAccount: (value: string, field: AccountSide) => void;
    setDataSource: (value: string, field: DataSourceSide) => void;
    //setDestination: (type: string, credentials: any) => void;
    //addTableMapping: (sourceId: string, destId: string) => void;
    //updateFieldMapping: (tableId: string, mapping: SyncFieldMapping) => void;
    //updateFilter: (tableId: string, filter: SyncFilter) => void;
   // exportConfig: () => SyncConfig;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { team } = useTeam();
    const { id } = useParams();

    const [syncConfig, setSyncConfig] = useState<Sync | Omit<Sync, "id">>()

    // get the connectors
    const { data: connectors } = useQuery({ queryKey: ['connectors'], queryFn: fetchConnectors });

    useEffect(() => {
        setSyncConfig(defaultCreateSync(user, team));
    }, [syncConfig]);

    // set the account
    const setAccount = (value: string, field: AccountSide) => {
        setSyncConfig({ ...syncConfig, [field]: value });
    };

    // set the data source
    const setDataSource = (value: string, field: DataSourceSide) => {
        setSyncConfig({ ...syncConfig, config: { ...syncConfig?.config, schema: { ...syncConfig?.config?.schema, [field]: value } } });
    };


    return (
        <SyncContext.Provider value={{
            syncConfig,
            connectors,
            setAccount,
            setDataSource
        }}>
            {children}
        </SyncContext.Provider>
    );
}

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error("useSync must be used within a SyncProvider");
    }
    return context;
}

