import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { SyncData } from "../hooks/useSync";

export const FieldMappingStep = ({ next, sync }: { next: () => void, sync: SyncData }) => {
    const { id } = useParams();
  
    return (
      <div className="space-y-4">
        Field Mapping

         <div className="mt-4">
          <Button
            onClick={() => {}}
            disabled={true}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 h-8"
          >
            Next
          </Button>
        </div>
      </div>
    );
  }