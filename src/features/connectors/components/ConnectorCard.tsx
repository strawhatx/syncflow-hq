import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Connection } from "@/services/connectorService";

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
      <CardHeader>
        <div className="flex items-center gap-2">
          <img src={`/icons/${icon}.svg`} alt={name} className="w-6 h-6" />
          <CardTitle>{name}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected && connections.length > 0 && (
          <div className="space-y-2">
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
      </CardContent>
      <CardFooter>
        <Button
          variant={isConnected ? "outline" : "default"}
          className="w-full"
          onClick={onConnect}
        >
          {isConnected ? "Add Another" : "Connect"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectorCard; 