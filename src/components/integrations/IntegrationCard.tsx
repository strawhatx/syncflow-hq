
interface IntegrationCardProps {
  name: string;
  icon: string;
  description: string;
  isConnected: boolean;
  onConnect: () => void;
}

const IntegrationCard = ({ name, icon, description, isConnected, onConnect }: IntegrationCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-border p-5 card-hover">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
          <img src={icon} alt={name} className="h-8 w-8" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/32")} />
        </div>
        <div className="ml-4">
          <h3 className="font-medium">{name}</h3>
          {isConnected && (
            <span className="badge badge-success">Connected</span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      <button 
        className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isConnected 
            ? "bg-secondary text-muted-foreground hover:bg-secondary/80" 
            : "bg-primary text-white hover:bg-primary/90"
        }`}
        onClick={onConnect}
      >
        {isConnected ? "Manage Connection" : "Connect"}
      </button>
    </div>
  );
};

export default IntegrationCard;
