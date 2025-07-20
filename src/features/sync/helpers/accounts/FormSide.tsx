import { CustomSelect } from "@/components/ui_custom/CustomSelect";
import { CustomSelectButton } from "@/components/ui_custom/CustomSelectButton";
import { ConnectorWithConnections } from "@/services/connector/service"
import { Connection } from "@/types/connectors"

interface FormSideProps {
    appId: string,
    setAppId: (arg0: any) => void,
    accountId: string,
    setAccountId: (arg0: any) => void,
    connectors: ConnectorWithConnections[],
    connections: Connection[],
    onCreateNew: () => void
}

export const FormSide = (props: FormSideProps) => {
    const { appId, setAppId, accountId, setAccountId, connectors, connections, onCreateNew } = props;

    return (
        <div className='col-span-2'>
            <CustomSelect
                value={appId || ""}
                onValueChange={(value: any) => setAppId(value)}
                options={connectors?.map(conn => ({
                    id: conn.id,
                    name: conn.name,
                    icon: conn.icon
                })) || []}
                placeholder={`Select app`}
                disabled={false}
                isLoading={false}
            />

            <div className="h-4"></div>

            <CustomSelectButton
                value={accountId || ""}
                onValueChange={(value: any) => setAccountId(value)}
                options={connections?.map(conn => ({
                    id: conn.id,
                    name: conn.name,
                })) || []}
                placeholder={`Select account`}
                isLoading={false}
                onCreateNew={onCreateNew}
            />
        </div>
    )
}