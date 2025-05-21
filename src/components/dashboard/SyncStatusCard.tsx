
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SyncStatusCardProps {
  title: string;
  status: "active" | "paused" | "error" | "synced";
  lastSync: string;
  source: {
    name: string;
    icon: string;
  };
  destination: {
    name: string;
    icon: string;
  };
  entityCount: number;
  flowId: string;
}

const SyncStatusCard = ({
  title,
  status,
  lastSync,
  source,
  destination,
  entityCount,
  flowId
}: SyncStatusCardProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "active":
        return "text-blue-600 bg-blue-50";
      case "paused":
        return "text-amber-600 bg-amber-50";
      case "error":
        return "text-red-600 bg-red-50";
      case "synced":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <Clock size={14} />;
      case "error":
        return <AlertTriangle size={14} />;
      case "synced":
        return <CheckCircle2 size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{title}</h3>
        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}>
          {getStatusIcon()}
          <span>{status === "synced" ? "Synced" : status === "active" ? "Syncing" : status}</span>
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
            <img src={source.icon} alt={source.name} className="h-5 w-5" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/20")} />
          </div>
          <div className="ml-2">
            <p className="text-xs text-muted-foreground">Source</p>
            <p className="text-sm font-medium">{source.name}</p>
          </div>
        </div>
        
        <div className="mx-2 text-gray-400">→</div>
        
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
            <img src={destination.icon} alt={destination.name} className="h-5 w-5" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/20")} />
          </div>
          <div className="ml-2">
            <p className="text-xs text-muted-foreground">Destination</p>
            <p className="text-sm font-medium">{destination.name}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">{entityCount}</span> entities
        </div>
        <div>Last sync: {lastSync}</div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <a href={`/flows/${flowId}`} className="text-primary text-sm hover:underline">View details</a>
      </div>
    </div>
  );
};

export default SyncStatusCard;
