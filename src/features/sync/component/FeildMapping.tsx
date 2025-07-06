import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { SyncData } from "../helpers/sync-data";
import { TableMapSelect } from "@/components/sync/TableMapSelect";
import getIcon from "../helpers/util";
import { ConnectorProvider } from "@/types/connectors";
import { FC, useEffect, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { getImagePath } from "@/lib/utils";

interface SelectOption {
  id: string;
  source: {
    name: string;
    icon?: string;
  };
  destination: {
    name: string;
    icon?: string;
  }
}

interface SelectedItemProps {
  option: SelectOption;
  onSelect: () => void;
}

const selectedItem: FC<SelectedItemProps> = ({ option, onSelect }) => {
  return (
    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-md p-2" onClick={onSelect}>
      <div className="flex items-center gap-2">
        <img
          src={getImagePath(option?.source?.icon)}
          alt={option?.source?.name}
          className="h-6 w-6 object-contin"
        />
        <span className="text-sm">{option?.source?.name}</span>
      </div>

      <ArrowRightLeft className="h-4 w-4" />

      <div className="flex items-center justify-end gap-2">
        <img
          src={getImagePath(option?.destination?.icon)}
          alt={option?.destination?.name}
          className="h-6 w-6 object-contain"
        />
        <span className="text-sm">{option?.destination?.name}</span>
      </div>
    </div>
  )
}

const header = (sync: SyncData, selectedMap: string, setSelectedMap: (value: string) => void) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const selectedOption = sync.config?.schema?.table_mappings.find((mapping) => mapping.id === selectedMap);

  // if we are editing, show the table map select
  // if we are not editing, show the selected item
  return (
    isEditing ? (
      <TableMapSelect
        value={selectedMap}
        setValue={setSelectedMap}
        onSelect={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
        options={sync.config?.schema?.table_mappings.map((mapping) => ({
          id: mapping.id,
          source: {
            name: mapping.source_table,
            icon: getIcon(sync.source?.connector?.provider)
          },
          destination: {
            name: mapping.destination_table,
            icon: getIcon(sync.destination?.connector?.provider)
          }
        }))}
        isLoading={false}
      />
    ) : (
      selectedOption && selectedItem({
        onSelect: () => setIsEditing(true),
        option: {
          id: selectedOption.id,
          source: {
            name: selectedOption?.source_table,
            icon: getIcon(sync.source?.connector?.provider)
          },
          destination: {
            name: selectedOption?.destination_table,
            icon: getIcon(sync.destination?.connector?.provider)
          }
        }
      })
    )
  )
}


export const FieldMappingStep = ({ next, sync }: { next: () => void, sync: SyncData }) => {
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    // if we have no selected map, set the first one
    if (sync.config?.schema?.table_mappings.length > 0) {
      setSelectedMap(sync.config?.schema?.table_mappings[0].id);
    }
  }, [sync.config?.schema?.table_mappings]);

  const handleNext = () => {

  };

  return (
    <div className="space-y-4">
      <div className="border p-1 rounded">
        {header(sync, selectedMap, setSelectedMap)}
        <hr className=" border-gray-200" />

        {/* columns */}
        <div className="grid grid-cols-3 gap-2">

        </div>

        <Button
          variant="link"
          className="py-1 h-4 text-xs text-purple-500"
          onClick={() => { }}
        >
          + Add Column
        </Button>
      </div>

      <div className="mt-4">
        <Button
          onClick={handleNext}
          disabled={true}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 h-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
}