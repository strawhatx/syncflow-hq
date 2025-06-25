import { WizardProvider } from "@/contexts/WizardContext";
import Sync from "@/features/sync";

const SyncPage = () => {

    return (
        <WizardProvider>
            <Sync />
        </WizardProvider>
    );
};

export default SyncPage;
