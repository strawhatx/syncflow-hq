import { useParams } from 'react-router-dom';

const SyncCreateAuthorize = () => {
  const { syncId } = useParams();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Authorize</h2>
      <p className="text-muted-foreground">
        preview and authorize the sync.
      </p>
      {/* Table mapping configuration will go here */}
    </div>
  );
};

export default SyncCreateAuthorize; 