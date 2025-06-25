import { useParams } from 'react-router-dom';

export default function ScheduleStep() {
  const { syncId } = useParams();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Schedule Sync</h2>
      <p className="text-muted-foreground">
        Configure how data is mapped between source and destination tables.
      </p>
      {/* Table mapping configuration will go here */}
    </div>
  );
}; 