
interface FieldMapperItemProps {
  sourceField: {
    name: string;
    type: string;
  };
  destinationField: {
    name: string;
    type: string;
  };
  mapped: boolean;
}

const FieldMapperItem = ({ sourceField, destinationField, mapped }: FieldMapperItemProps) => {
  return (
    <div className={`flex items-center p-3 rounded-lg ${mapped ? "bg-accent/70" : "bg-white border border-dashed border-border"}`}>
      <div className="flex-1">
        <div className="text-sm font-medium">{sourceField.name}</div>
        <div className="text-xs text-muted-foreground">{sourceField.type}</div>
      </div>
      
      <div className="mx-4 text-muted-foreground">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <div className="flex-1">
        {mapped ? (
          <>
            <div className="text-sm font-medium">{destinationField.name}</div>
            <div className="text-xs text-muted-foreground">{destinationField.type}</div>
          </>
        ) : (
          <select className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background">
            <option value="">Select field...</option>
            <option value={destinationField.name}>{destinationField.name}</option>
            <option value="custom">Custom value</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default FieldMapperItem;
