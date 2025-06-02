import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConnectionInfoCardProps {
  connectionId: string;
  createdAt: string;
  updatedAt: string;
}

export const ConnectionInfoCard = ({
  connectionId,
  createdAt,
  updatedAt
}: ConnectionInfoCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Connection ID</p>
          <p className="text-sm font-mono">{connectionId}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="text-sm">{formatDate(createdAt)}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Last Updated</p>
          <p className="text-sm">{formatDate(updatedAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}; 