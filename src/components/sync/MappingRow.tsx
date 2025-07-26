import { CustomSelect } from "@/components/ui_custom/CustomSelect";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

export interface MappingRowProps {
  index: number;
  sourceValue: string;
  destinationValue: string;
  sourceOptions: any[];
  destinationOptions: any[];
  syncSeparator: () => JSX.Element;
  isSourceLoading: boolean;
  isDestinationLoading: boolean;
  onSourceChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onRemove: (value: number) => void;

}

export const MappingRow = ({
  index,
  sourceValue,
  destinationValue,
  sourceOptions,
  destinationOptions,
  syncSeparator,
  isSourceLoading,
  isDestinationLoading,
  onSourceChange,
  onDestinationChange,
  onRemove
}: MappingRowProps) => {
  return (
    <div key={index} className="flex w-full text-black gap-2 items-center py-1">
      <div className="flex w-full items-center justify-between gap-2">
        <CustomSelect
          value={sourceValue}
          onValueChange={(value: string) => onSourceChange(value)}
          options={sourceOptions}
          placeholder="Select source table"
          disabled={isSourceLoading}
          isLoading={isSourceLoading}
        />

          {syncSeparator()}

        <CustomSelect
          value={destinationValue}
          onValueChange={(value: string) => onDestinationChange(value)}
          options={destinationOptions}
          placeholder="Select destination table"
          disabled={isDestinationLoading}
          isLoading={isDestinationLoading}
        />
      </div>

      <Button
        variant="link"
        className="text-red-500 py-1 h-6 text-xs"
        onClick={() => onRemove(index)}
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </div>
  )
}