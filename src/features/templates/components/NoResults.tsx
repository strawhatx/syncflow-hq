import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NoResults = () => (
  <div className="flex flex-col items-center justify-center h-[20vh] px-4 ">
    <Card className="w-full max-w-sm border-0 bg-muted/50">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-md font-medium">No Templates</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          No templates found matching your criteria
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
);

export default NoResults; 