
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

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
  onSelect?: (value: string) => void;
}

const FieldMapperItem = ({ 
  sourceField, 
  destinationField, 
  mapped,
  onSelect
}: FieldMapperItemProps) => {
  return (
    <div className={`flex items-center p-3 rounded-lg ${mapped ? "bg-accent/70" : "bg-card border border-dashed border-border"}`}>
      <div className="flex-1">
        <div className="text-sm font-medium">{sourceField.name}</div>
        <div className="text-xs text-muted-foreground">{sourceField.type}</div>
      </div>
      
      <div className="mx-4 text-muted-foreground">
        <ArrowRight size={20} />
      </div>
      
      <div className="flex-1">
        {mapped ? (
          <>
            <div className="text-sm font-medium">{destinationField.name}</div>
            <div className="text-xs text-muted-foreground">{destinationField.type}</div>
          </>
        ) : (
          <Select onValueChange={onSelect}>
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder="Select field..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Available Fields</SelectLabel>
                <SelectItem value={destinationField.name}>{destinationField.name}</SelectItem>
                <SelectItem value="custom">Custom value</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default FieldMapperItem;
