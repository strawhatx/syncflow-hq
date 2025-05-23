
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
  connections = [],
  onConnect,
  onManage 
}: IntegrationCardProps) => {
  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-600";
      case "error": return "bg-red-500/20 text-red-600";
      case "syncing": return "bg-blue-500/20 text-blue-600";
      case "paused": return "bg-amber-500/20 text-amber-600";
      default: return "bg-gray-500/20 text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5 card-hover">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
          <img 
            src={icon} 
            alt={name} 
            className="h-8 w-8" 
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/32")} 
          />
        </div>
        <div className="ml-4">
          <h3 className="font-medium">{name}</h3>
          {isConnected && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {connections.length} {connections.length === 1 ? 'Connection' : 'Connections'}
            </Badge>
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
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
      
      <div className="flex flex-col gap-2">
        {isConnected ? (
          <>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={onConnect}
            >
              <Plus className="h-4 w-4" />
              Add Another Account
            </Button>
            
            {connections.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-between"
                  >
                    <span>Manage Connections</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {connections.map(connection => (
                    <DropdownMenuItem 
                      key={connection.id}
                      onClick={() => onManage?.(connection.id)}
                    >
                      {connection.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        ) : (
          <Button 
            className="w-full bg-primary text-white hover:bg-primary/90" 
            onClick={onConnect}
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;
