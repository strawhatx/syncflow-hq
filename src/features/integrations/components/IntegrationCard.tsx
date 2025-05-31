import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";

export type ConnectionStatus = "active" | "error" | "syncing" | "paused";

export interface Connection {
  id: string;
  name: string;
  status: ConnectionStatus;
}

interface IntegrationCardProps {
  name: string;
  icon: string;
  description: string;
  isConnected: boolean;
  connections: Connection[];
  onConnect: () => void;
  onManage?: (connectionId: string) => void;
}

const IntegrationCard = ({ 
  name, 
  icon, 
  description, 
  isConnected, 
  connections,
  onConnect,
  onManage 
}: IntegrationCardProps) => {
  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-600';
      case 'error':
        return 'bg-red-500/20 text-red-600';
      case 'syncing':
        return 'bg-blue-500/20 text-blue-600';
      case 'paused':
        return 'bg-amber-500/20 text-amber-600';
      default:
        return 'bg-gray-500/20 text-gray-600';
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
            <img 
              src={icon || "https://via.placeholder.com/32"} 
              alt={name} 
              className="h-6 w-6" 
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/32")} 
            />
          </div>
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        
        {isConnected && connections.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Manage
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {connections.map((connection) => (
                <DropdownMenuItem
                  key={connection.id}
                  onClick={() => onManage?.(connection.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(connection.status).split(' ')[0]}`} />
                    <span>{connection.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {isConnected && connections.length > 0 ? (
        <div className="space-y-3 mb-4">
          {connections.slice(0, 2).map((connection) => (
            <div key={connection.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(connection.status).split(' ')[0]}`} />
                <span>{connection.name}</span>
              </div>
              <Badge className={getStatusColor(connection.status)}>
                {connection.status === "active" ? "Connected" : 
                 connection.status === "syncing" ? "Syncing" : 
                 connection.status === "paused" ? "Paused" : "Error"}
              </Badge>
            </div>
          ))}
          
          {connections.length > 2 && (
            <div className="text-sm text-muted-foreground">
              +{connections.length - 2} more connections
            </div>
          )}
        </div>
      ) : null}
      
      <Button 
        className="w-full" 
        onClick={onConnect}
      >
        {isConnected ? (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add Connection
          </>
        ) : (
          "Connect"
        )}
      </Button>
    </div>
  );
};

export default IntegrationCard;
