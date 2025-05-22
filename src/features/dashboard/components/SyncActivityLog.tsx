
import { Check, ChevronRight, ShieldAlert } from "lucide-react";

interface LogItem {
  id: string;
  timestamp: string;
  action: string;
  sync: string;
  status: "success" | "error" | "warning";
  message: string;
}

interface SyncActivityLogProps {
  logs: LogItem[];
}

const SyncActivityLog = ({ logs }: SyncActivityLogProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Check size={16} className="text-green-500" />;
      case "error":
        return <ShieldAlert size={16} className="text-red-500" />;
      case "warning":
        return <ShieldAlert size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border oversync-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-medium">Recent Sync Activity</h3>
      </div>
      
      <div className="divide-y divide-border">
        {logs.map((log) => (
          <div key={log.id} className="px-6 py-3 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center">
              <div className="mr-3">
                {getStatusIcon(log.status)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{log.action}</span>
                  <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">{log.message}</p>
                <div className="text-xs text-muted-foreground mt-1">Sync: {log.sync}</div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground ml-2" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-6 py-3 border-t border-border text-center">
        <a href="/logs" className="text-primary text-sm hover:underline">View all logs</a>
      </div>
    </div>
  );
};

export default SyncActivityLog;
