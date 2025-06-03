import React, { createContext, useContext, useState, useCallback } from 'react';
import IntegrationConnectModal from '../components/IntegrationConnectModal';

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  authType: string;
}

interface IntegrationConnectModalContextType {
  openConnectModal: (integration: Integration) => void;
  closeConnectModal: () => void;
  isModalOpen: boolean;
  selectedIntegration: Integration | null;
}

const IntegrationConnectModalContext = createContext<IntegrationConnectModalContextType | undefined>(undefined);

export const IntegrationConnectModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const openConnectModal = useCallback((integration: Integration) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  }, []);

  const closeConnectModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIntegration(null);
  }, []);

  return (
    <IntegrationConnectModalContext.Provider value={{ openConnectModal, closeConnectModal, isModalOpen, selectedIntegration }}>
      {children}
      <IntegrationConnectModal
        isOpen={isModalOpen}
        onClose={closeConnectModal}
        integration={selectedIntegration}
      />
    </IntegrationConnectModalContext.Provider>
  );
};

export function useIntegrationConnectModal() {
  const ctx = useContext(IntegrationConnectModalContext);
  if (!ctx) {
    throw new Error('useIntegrationConnectModal must be used within an IntegrationConnectModalProvider');
  }
  return ctx;
} 