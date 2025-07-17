import { SetupStage } from "@/integrations/supabase/types";
import { ConnectorWithConnections } from "@/services/connector/service";
import { SyncConfig } from "@/types/sync";

export type SyncData = {
    id: string;
    name: string;
    is_active: boolean;
    lastSync?: string;
    source?: {
      id: string;
      connector_id: string;
      connector: ConnectorWithConnections;
      database: any;
    };
    destination?: {
      id: string;
      connector_id: string;
      connector: ConnectorWithConnections;
      database: any;
    };
    config?: SyncConfig;
    entityCount?: number;
    setup_stage?: SetupStage;
  };
  
  export const defaultSyncData: SyncData = {
    id: "",
    name: "",
    is_active: false,
    source: {
      id: "",
      connector_id: "",
      connector: undefined,
      database: "",
    },
    destination: {
      id: "",
      connector_id: "",
      connector: undefined,
      database: "",
    },
  };