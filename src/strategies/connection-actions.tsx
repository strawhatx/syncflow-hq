// Strategy pattern for rendering connection actions

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createConnection, updateConnection } from "@/services/connectionService";
import { initiateOAuth } from "@/services/oauth/service";
import { Connector } from "@/types/connectors";

interface ConnectionActionsStrategy {
    handleSubmitAction(
        connector: Connector,
        connectionName: string,
        e: React.FormEvent,
        setIsLoading: (isLoading: boolean) => void,
        setError: (error: string | null) => void,
        teamId?: string,
        connection_id?: string,
        config?: Record<string, any>,
        onClose?: () => void
    ): Promise<void>
    renderActions(isLoading: boolean): React.ReactNode
}

class OauthActionsStrategy implements ConnectionActionsStrategy {
    async handleSubmitAction(
        connector: Connector,
        connectionName: string,
        e: React.FormEvent,
        setIsLoading: (isLoading: boolean) => void,
        setError: (error: string | null) => void
    ): Promise<void> {
        try {
            if (connector.type !== "oauth") {
                throw new Error("Unsupported provider");
            }

            setIsLoading(true);
            const params: Record<string, string> = {};
            const oauthUrl = initiateOAuth(
                connectionName,
                connector.provider,
                connector,
                params
            );

            window.location.href = await oauthUrl;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred initiating OAuth flow");
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "An error occurred initiating OAuth flow",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }
    renderActions(isLoading: boolean): React.ReactNode {
        return (
            <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
                {isLoading ? "Authorizing..." : "Authorize"}
            </Button>
        );
    }
}

class ApiKeyActionsStrategy implements ConnectionActionsStrategy {
    async handleSubmitAction(
        connector: Connector,
        connectionName: string,
        e: React.FormEvent,
        setIsLoading: (isLoading: boolean) => void,
        setError: (error: string | null) => void,
        teamId?: string,
        connection_id?: string,
        config?: Record<string, any>,
        onClose?: () => void
    ): Promise<void> {
        const action = connection_id ? "create" : "update";
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // If the connection is being created, create a new connection 
            // otherwise update the existing connection
            if (action === "create") {
                await createConnection(teamId, connector, connectionName, config);
            }
            else {
                await updateConnection(connection_id, connectionName, connector, config);
            }

            toast({
                title: `Connection ${action}d`,
                description: `Your connection has been successfully ${action}d.`,
            });

            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "An error occurred",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }
    renderActions(isLoading: boolean): React.ReactNode {
        return (
            <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
                {isLoading ? "Connecting..." : "Connect"}
            </Button>
        );
    }
}

export class ConnectionActionsStrategyFactory {
    static getStrategy(type: "oauth" | "api_key"): ConnectionActionsStrategy {
        switch (type) {
            case "oauth":
                return new OauthActionsStrategy();
            case "api_key":
                return new ApiKeyActionsStrategy();

            default:
                throw new Error(`Unsupported type: ${type}`);
        }
    }
}
