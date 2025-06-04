import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NoResults = () => (
  <div className="flex flex-col items-center justify-center h-[90vh] px-4">
    <Card className="w-full max-w-sm border-0 bg-muted/50">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-md font-medium">No Templates</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          No templates found matching your criteria
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
));

export default NoResults; 