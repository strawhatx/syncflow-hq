import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NoResults = memo(({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="flex flex-col items-center justify-center h-[90vh] px-4">
    <Card className="w-full max-w-sm border-0 bg-muted/50">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-md font-medium">No Syncs Found</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Get started by creating your first sync to connect your data sources.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-4">
        <Button onClick={onGetStarted} size="sm" className="gap-1.5">
          <Plus size={14} />
          Create New Sync
        </Button>
      </CardContent>
    </Card>
  </div>
));

export default NoResults; 