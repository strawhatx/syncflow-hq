import { useEffect, useState } from "react";
import { ConnectorWithConnections } from "@/services/connector/service";
import { AccountSide, } from "@/contexts/SyncContext";

interface UseAccountSelectionProps {
  connectors: ConnectorWithConnections[] | undefined;
  accountId: string | undefined;
  setAccount: (id: string, field: AccountSide) => void;
  field: AccountSide;
}

export const useAccountSelection = (props: UseAccountSelectionProps) => {
  const { connectors, accountId, setAccount, field } = props;
  const [appId, setAppId] = useState<string>("");

  // Hydrate appId from accountId on mount or when connectors change
  useEffect(() => {
    if (!connectors || !accountId) return;
    
    const connector = connectors.find(conn => conn.connections.some(c => c.id === accountId));
    if (connector) setAppId(connector.id);
  }, [connectors, accountId]);

  // When app changes, clear account selection in context
  const handleAppChange = (newAppId: string) => {
    setAppId(newAppId);
    setAccount("", field);
  };

  // When account changes, update context
  const handleAccountChange = (newAccountId: string) => {
    setAccount(newAccountId, field);
  };

  // Get available connections for the selected app
  const connections = connectors?.find(conn => conn.id === appId)?.connections ?? [];

  return {
    appId,
    setAppId: handleAppChange,
    accountId,
    setAccountId: handleAccountChange,
    connections,
  };
}
