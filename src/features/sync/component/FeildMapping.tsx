import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { SyncData } from "../helpers/sync-data";
import { TableMapSelect } from "@/components/sync/TableMapSelect";
import getIcon from "../helpers/util";
import { ConnectorProvider } from "@/types/connectors";



export const FieldMappingStep = ({ next, sync }: { next: () => void, sync: SyncData }) => {
    const { id } = useParams();
  
    const handleNext = () => {
      
    };
  
    return (
      <div className="space-y-4">
        <div className="border p-1 rounded">
          <TableMapSelect
            options={sync.config?.schema?.table_mappings.map((mapping, index) => ({
              id: index,
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
          
          <hr className=" border-gray-200" />
  
          <Button
            variant="link"
            className="py-1 h-4 text-xs text-purple-500"
            onClick={()=>{}}
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