import { useState } from "react";
import { useIntegrationDetails } from "./hooks/useIntegrationDetails";
import { useOAuthCallback } from "./hooks/useOAuthCallback";
import IntegrationConnectModal from "./components/IntegrationConnectModal";

const IntegrationConnect = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { integration, isLoading, fetchError, navigate } = useIntegrationDetails();
  
  // Handle OAuth callback if present in URL
  useOAuthCallback(integration, false, () => {});

  if (isLoading) {
    return null;
  }
  
  if (fetchError || !integration) {
    return null;
  }

  return (
    <IntegrationConnectModal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        navigate("/integrations");
      }}
      integration={integration}
    />
  );
};

export default IntegrationConnect;
