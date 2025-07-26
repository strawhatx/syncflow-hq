import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Sync, SyncTableMapping, SyncStage, defaultCreateSync } from "@/types/sync";
import { useAuth } from "./AuthContext";
import { useTeam } from "./TeamContext";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ConnectorWithConnections, fetchConnectors } from "@/services/connector/service";
import { fetchSyncById, saveSync } from "@/services/syncs/service";
import { produce } from "immer";

export type AccountSide = "source_id" | "destination_id";
export type DataSourceSide = "source_database_id" | "destination_database_id";
const STAGES: SyncStage[] = ["accounts", "data-sources", "mappings", "filters", "ready"];

interface SyncContextType {
    syncConfig: Sync;
    connectors: ConnectorWithConnections[] | undefined;
    selectedTableMappingId: string | null;
    setSelectedTableMappingId: (id: string | null) => void;

    setTitle: (title: string) => void;
    setAccount: (value: string, field: AccountSide) => void;
    setDataSource: (value: string, field: DataSourceSide) => void;
    setTableMappings: (value: SyncTableMapping[]) => void;
    setStage: (stage: SyncStage) => void;
    saveAndAdvance: () => Promise<{ success: boolean; errors?: string[] }>;
    reset: () => void;
    activate: () => Promise<void>;
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

    // set the stage
    const setStage = (stage: SyncStage) => {
        setSyncConfig(current =>
            produce(current, draft => {
                if (draft.config) {
                    draft.config.stage = stage;
                }
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
        saveSync(syncConfig.id, syncConfig);
    };

    // activate the sync
    const activate = async () => {
        if (!syncConfig) return;

        const updatedSync = {
            ...syncConfig,
            status: 'active' as const
        };

        setSyncConfig(updatedSync);
        return saveSync(syncConfig.id, updatedSync);
    };

    // Save and advance, but only if valid
    const saveAndAdvance = async (): Promise<{ success: boolean; errors?: string[] }> => {
        const { isValid, errors } = validateCurrentStage();
        if (!isValid) return { success: false, errors };

        // Optionally advance stage before saving
        const nextStage = getNextStage();
        setSyncConfig(current =>
            produce(current, draft => {
                if (draft.config) {
                    draft.config.stage = nextStage;
                }
            })
        );

        await saveSync(syncConfig.id, { ...syncConfig, config: { ...syncConfig.config, stage: nextStage } });
        return { success: true };
    };

    // private functions

    // Stage validators
    const stageValidators: Record<SyncStage, () => string[]> = {
        accounts: () => {
            const errors: string[] = [];
            if (!syncConfig?.source_id) errors.push("Source account is required");
            if (!syncConfig?.destination_id) errors.push("Destination account is required");
            return errors;
        },
        "data-sources": () => {
            const errors: string[] = [];
            if (!syncConfig?.config?.schema?.source_database_id) errors.push("Source database is required");
            if (!syncConfig?.config?.schema?.destination_database_id) errors.push("Destination database is required");
            return errors;
        },
        mappings: () => {
            const errors: string[] = [];
            const mappings = syncConfig?.config?.schema?.table_mappings || [];
            if (!mappings.length) {
                errors.push("At least one table mapping is required");
            } else {
                mappings.forEach((mapping, i) => {
                    if (!mapping.field_mappings?.length) {
                        errors.push(`Table mapping ${i + 1} must have at least one field mapping`);
                    }
                });
            }
            return errors;
        },
        filters: () => [],
        ready: () => [],
    };

    const getStage = (): SyncStage => syncConfig?.config?.stage || "accounts";

    const getNextStage = (): SyncStage => {
        const idx = STAGES.indexOf(getStage());
        return idx < STAGES.length - 1 ? STAGES[idx + 1] : STAGES[idx];
    };

    const validateCurrentStage = (): { isValid: boolean; errors: string[] } => {
        const stage = getStage();
        const errors = stageValidators[stage]();
        return { isValid: errors.length === 0, errors };
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
            setStage,
            saveAndAdvance,
            reset,
            activate
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

