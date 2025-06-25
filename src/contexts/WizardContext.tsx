import { createContext, useState, useContext } from "react";

interface WizardData {
    source_app_id: string;
    destination_app_id: string;
    source_connection_id: string;
    destination_connection_id: string;
}

interface WizardContextType {
    data: WizardData;
    setData: (data: WizardData) => void;
}

export const WizardContext = createContext<WizardContextType | null>(null);

export const useWizard = () => useContext(WizardContext);

export const WizardProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<WizardData>({
        source_app_id: '',
        destination_app_id: '',
        source_connection_id: '',
        destination_connection_id: '',
    });

    return (
        <WizardContext.Provider value={{ data, setData }}>
            {children}
        </WizardContext.Provider>
    );
};