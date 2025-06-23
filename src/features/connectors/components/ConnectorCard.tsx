import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Connection } from "@/types/connectors";

export type ConnectionStatus = "active" | "error" | "syncing" | "paused";

interface ConnectorCardProps {
  name: string;
  icon: string;
  description: string;
  isConnected: boolean;
  connections: Connection[];
  onConnect: () => void;
  onManage?: (connectionId: string) => void;
}

const ConnectorCard = ({
  name,
  icon,
  description,
  isConnected,
  connections,
  onConnect,
  onManage
}: ConnectorCardProps) => {

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-100 rounded-lg">
            <img src={`/svg/${icon}.svg`} alt={name} className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected && connections.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground">Connected instances:</p>
            <div className="space-y-1">
              {connections.map(connection => (
                <div key={connection.id} className="flex items-center justify-between text-sm">
                  <span>{connection.name}</span>
                  {onManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onManage(connection.id)}
                    >
                      Manage
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      
        <Button
          variant={isConnected ? "outline" : "default"}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          onClick={onConnect}
        >
          {isConnected ? "Add Another" : "Connect"}
        </Button>
        
      </CardContent>
    </Card>
  );
};

export default ConnectorCard; 