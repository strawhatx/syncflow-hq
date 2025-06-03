import { useParams } from 'react-router-dom';

const SyncDetailIssues = () => {
  const { syncId } = useParams();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Issues</h2>
      <p className="text-muted-foreground">
        View and manage sync-related issues and errors.
      </p>
      {/* Issues list and management will go here */}
    </div>
  );
};

export default SyncDetailIssues; 