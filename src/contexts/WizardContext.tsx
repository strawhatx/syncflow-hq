import { ConnectorWithConnections } from "@/services/connectorService";
import { createContext, useState, useContext } from "react";

interface AppData {
    id: string;
    connector: ConnectorWithConnections;
    connector_id: string;
}


interface WizardData {
    source: AppData;
    destination: AppData;
}

interface WizardContextType {
    data: WizardData;
    setData: (data: WizardData) => void;
}

export const defaultWizardData: WizardData = {
    source: {
        id: '',
        connector: {} as ConnectorWithConnections,
        connector_id: '',
    },
    destination: {
        id: '',
        connector: {} as ConnectorWithConnections,
        connector_id: '',
    },
};

export const WizardContext = createContext<WizardContextType | null>(null);

export const useWizard = () => useContext(WizardContext);

export const WizardProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<WizardData>(defaultWizardData);

    return (
        <WizardContext.Provider value={{ data, setData }}>
            {children}
        </WizardContext.Provider>
    );
};