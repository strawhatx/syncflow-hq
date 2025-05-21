import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type LogStatus = "success" | "warning" | "error" | "pending";

interface Log {
  id: string;
  timestamp: string;
  flow: string;
  action: string;
  status: LogStatus;
  message: string;
}

interface LogsTableProps {
  logs: Log[];
}

const LogsTable: React.FC<LogsTableProps> = ({ logs }) => {
  const getStatusBadgeClass = (status: LogStatus) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "error":
        return "bg-red-100 text-red-800 border-red-300";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Flow</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {log.timestamp}
                </TableCell>
                <TableCell className="font-medium">{log.flow}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full border ${getStatusBadgeClass(
                      log.status
                    )}`}
                  >
                    {log.status}
                  </span>
                </TableCell>
                <TableCell className="max-w-md truncate">{log.message}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-muted-foreground">No logs found</p>
                  <button
                    className="text-primary text-sm hover:underline focus:outline-none"
                    onClick={() => {
                      console.log("Refreshing logs...");
                    }}
                  >
                    Refresh
                  </button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LogsTable;