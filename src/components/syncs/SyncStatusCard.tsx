import { Clock, AlertTriangle, CheckCircle2, NotepadText } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getImagePath } from "@/lib/utils";
import { SyncStage, SyncStatus } from "@/types/sync";

interface SyncStatusCardProps {
  title: string;
  status: SyncStatus;
  is_completed: boolean;
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
  syncId: string;
  stage?: SyncStage;
}

const statusConfig = {
  pending: {
    styles: "text-gray-600 bg-gray-50",
    icon: NotepadText,
    label: "Setup Required"
  },
  active: {
    styles: "text-blue-600 bg-blue-50",
    icon: Clock,
    label: "Syncing"
  },
  paused: {
    styles: "text-amber-600 bg-amber-50",
    icon: Clock,
    label: "Paused"
  },
  error: {
    styles: "text-red-600 bg-red-50",
    icon: AlertTriangle,
    label: "Error"
  },
  synced: {
    styles: "text-green-600 bg-green-50",
    icon: CheckCircle2,
    label: "Synced"
  }
} as const;

const SyncStatusCard = ({
  title,
  status,
  is_completed,
  lastSync,
  source,
  destination,
  entityCount,
  syncId
}: SyncStatusCardProps) => {
  const navigate = useNavigate();
  const statusInfo = is_completed ? statusConfig[status] : statusConfig.pending;

  const handleCardClick = () => {
    if (is_completed) {
      navigate(`/syncs/view/${syncId}`);
    } else {
      navigate(`/syncs/edit/${syncId}`);
    }
  };

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md cursor-pointer hover:bg-accent/50" 
      onClick={handleCardClick}
      data-sync-id={syncId}
      data-sync-status={status}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <h3 className="font-medium">{title}</h3>
        <Badge variant="outline" className={statusInfo.styles}>
          <statusInfo.icon className="mr-1 h-3.5 w-3.5" />
          <span>{statusInfo.label}</span>
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
              <img src={getImagePath(source?.icon)} alt={source?.name} className="h-5 w-5" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/20")} />
            </div>
            <div className="ml-2">
              <p className="text-xs text-muted-foreground">Source</p>
              <p className="text-sm font-medium">{source?.name}</p>
            </div>
          </div>
          
          <div className="mx-2 text-gray-400">→</div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
              <img src={destination?.icon} alt={destination?.name} className="h-5 w-5" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/20")} />
            </div>
            <div className="ml-2">
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="text-sm font-medium">{destination?.name}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">{entityCount ?? 0}</span> entities
        </div>
        <div>Last sync: {lastSync ?? "N/A"}</div>
      </CardFooter>
    </Card>
  );
}; 

export default SyncStatusCard;