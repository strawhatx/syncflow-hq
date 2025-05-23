
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ConnectionHelpCardProps {
  authType: string;
  integrationName: string;
}

const ConnectionHelpCard = ({ authType, integrationName }: ConnectionHelpCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Help</CardTitle>
        <CardDescription>Tips for setting up your connection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {authType === "oauth" ? (
          <>
            <div>
              <h3 className="font-medium mb-1">OAuth Setup</h3>
              <p className="text-muted-foreground">
                You'll be redirected to {integrationName} to authorize access. 
                You'll need to login and approve the permissions.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Required Permissions</h3>
              <p className="text-muted-foreground">
                We'll request permissions to access your {integrationName.toLowerCase() === "shopify" ? "products and orders" : "data"} 
                to enable synchronization with other services.
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="font-medium mb-1">Where to find your credentials</h3>
              <p className="text-muted-foreground">
                Log in to your {integrationName} account and navigate to the API settings page. 
                You can generate a new API key there.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Permissions needed</h3>
              <p className="text-muted-foreground">
                Make sure your API key has permissions for reading and writing to the resources you want to sync.
              </p>
            </div>
          </>
        )}
        <div>
          <h3 className="font-medium mb-1">Need help?</h3>
          <p className="text-muted-foreground">
            Check our <a href="#" className="text-primary hover:underline">documentation</a> or 
            contact <a href="#" className="text-primary hover:underline">support</a>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionHelpCard;
