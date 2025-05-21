
interface TemplateCardProps {
  title: string;
  description: string;
  source: {
    name: string;
    icon: string;
  };
  destination: {
    name: string;
    icon: string;
  };
  direction: "one-way" | "two-way";
}

const TemplateCard = ({ title, description, source, destination, direction }: TemplateCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-border p-5 card-hover">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
          <img src={source.icon} alt={source.name} className="h-6 w-6" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/24")} />
        </div>
        
        <div className="mx-3 text-muted-foreground">
          {direction === "one-way" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 8L21 12M21 12L17 16M21 12H3M7 16L3 12M3 12L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        
        <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
          <img src={destination.icon} alt={destination.name} className="h-6 w-6" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/24")} />
        </div>
      </div>
      
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      <div className="flex">
        <button className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-1">
          Use Template
        </button>
        <button className="ml-2 text-muted-foreground hover:text-foreground border border-border hover:bg-secondary px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
          Preview
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
