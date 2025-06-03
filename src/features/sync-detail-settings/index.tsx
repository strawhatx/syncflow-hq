import { useParams } from 'react-router-dom';

const SyncDetailSettings = () => {
  const { syncId } = useParams();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Operations</h2>
      <p className="text-muted-foreground">
        Monitor and manage sync operations and history.
      </p>
      {/* Operations history and controls will go here */}
    </div>
  );
};

export default SyncDetailSettings; 