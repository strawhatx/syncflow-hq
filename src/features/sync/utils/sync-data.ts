import { ConnectorWithConnections } from "@/services/connector/service";
import { SyncConfig, SyncStage } from "@/types/sync";

export type SyncData = {
    id: string;
    name: string;
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
    stage?: SyncStage;
  };
  
  export const defaultSyncData: SyncData = {
    id: "",
    name: "",
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