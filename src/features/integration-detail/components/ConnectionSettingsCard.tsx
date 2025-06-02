import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ConnectionSettingsCardProps {
  connectionName: string;
  setConnectionName: (name: string) => void;
  settings: {
    syncInterval: string;
    enableWebhooks: boolean;
  };
  setSettings: (settings: any) => void;
  isUpdating: boolean;
  onUpdateSettings: () => void;
  onDelete: () => void;
  integrationName: string;
}

export const ConnectionSettingsCard = ({
  connectionName,
  setConnectionName,
  settings,
  setSettings,
  isUpdating,
  onUpdateSettings,
  onDelete,
  integrationName
}: ConnectionSettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Settings</CardTitle>
        <CardDescription>Configure how your {integrationName} connection works</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="connection-name">Connection Name</Label>
          <Input
            id="connection-name"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sync-interval">Sync Interval</Label>
          <select
            id="sync-interval"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={settings.syncInterval}
            onChange={(e) => setSettings({ ...settings, syncInterval: e.target.value })}
          >
            <option value="realtime">Real-time</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="manual">Manual only</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="webhook-toggle">Enable Webhooks</Label>
            <p className="text-xs text-muted-foreground">
              Receive real-time updates when data changes
            </p>
          </div>
          <Switch
            id="webhook-toggle"
            checked={settings.enableWebhooks}
            onCheckedChange={(checked) => setSettings({ ...settings, enableWebhooks: checked })}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Connection
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the connection "{connectionName}" and remove all associated data. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={onDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Button 
          onClick={onUpdateSettings}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}; 