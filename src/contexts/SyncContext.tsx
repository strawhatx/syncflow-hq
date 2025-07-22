import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Sync, SyncConfig, SyncFieldMapping, SyncFilter, SyncTableMapping, defaultCreateSync } from "@/types/sync";
import { useAuth } from "./AuthContext";
import { useTeam } from "./TeamContext";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ConnectorWithConnections, fetchConnectors } from "@/services/connector/service";
import { fetchSyncById, saveSync } from "@/services/syncs/service";
import { produce } from "immer";

export type AccountSide = "source_id" | "destination_id";
export type DataSourceSide = "source_database_id" | "destination_database_id";

interface SyncContextType {
    syncConfig: Sync;
    connectors: ConnectorWithConnections[] | undefined;
    selectedTableMappingId: string | null;
    setSelectedTableMappingId: (id: string | null) => void;

    setTitle: (title: string) => void;
    setAccount: (value: string, field: AccountSide) => void;
    setDataSource: (value: string, field: DataSourceSide) => void;
    setTableMappings: (value: SyncTableMapping[]) => void;
    reset: () => void;
    save: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { id } = useParams();
    const { user } = useAuth();
    const { team } = useTeam();
    const [syncConfig, setSyncConfig] = useState<Sync>()
    const [selectedTableMappingId, setSelectedTableMappingId] = useState<string | null>(null);

    // get the connectors
    const { data: connectors } = useQuery({ queryKey: ['connectors'], queryFn: fetchConnectors });

    useEffect(() => {
        if (!id) return;

        //get the sync from the database
        fetchSyncById(id).then(sync => setSyncConfig(sync));
    }, [id]);

    // set the title
    const setTitle = (title: string) => {
        setSyncConfig({ ...syncConfig, name: title });
    };

    // set the account
    const setAccount = (value: string, field: AccountSide) => {
        setSyncConfig({ ...syncConfig, [field]: value });
    };

    // set the data source
    const setDataSource = (value: string, field: DataSourceSide) => {
        setSyncConfig(current =>
            produce(current, draft => {
                if (draft.config?.schema) {
                    draft.config.schema[field] = value;
                }
            })
        );
    };

    // set the table mapping
    const setTableMappings = (value: SyncTableMapping[]) => {
        setSyncConfig(current =>
            produce(current, draft => {
                draft.config.schema.table_mappings = value;
            })
        );
    };

    // reset the sync config
    const reset = () => {
        const newSync = defaultCreateSync(user, team);
        setSyncConfig(prev => ({
            ...prev,
            source_id: newSync.source_id,
            destination_id: newSync.destination_id,
            config: newSync.config,
        }));

        // save the sync config
        save();
    };

    // save the sync config
    const save = async () => {
        return saveSync(syncConfig.id, syncConfig);
    };


    return (
        <SyncContext.Provider value={{
            setTitle,
            syncConfig,
            connectors,
            selectedTableMappingId,
            setSelectedTableMappingId,
            setAccount,
            setDataSource,
            setTableMappings,
            reset,
            save,
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

