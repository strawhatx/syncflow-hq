import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UsageCardProps {
  recordsSynced: number;
  recordsSyncedLimit: number;
  apiRequests: number;
  apiRequestsLimit: number;
}

export const UsageCard = ({
  recordsSynced,
  recordsSyncedLimit,
  apiRequests,
  apiRequestsLimit
}: UsageCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm">Records synced this month</p>
            <p className="text-sm font-medium">{recordsSynced.toLocaleString()} / {recordsSyncedLimit.toLocaleString()}</p>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full" 
              style={{ width: `${(recordsSynced / recordsSyncedLimit) * 100}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm">API requests</p>
            <p className="text-sm font-medium">{apiRequests.toLocaleString()} / {apiRequestsLimit.toLocaleString()}</p>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full" 
              style={{ width: `${(apiRequests / apiRequestsLimit) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 