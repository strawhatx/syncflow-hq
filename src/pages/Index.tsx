
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const IndexPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to SyncStack
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          Connect and automate your data syncs
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/auth">Login / Register</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/templates">Explore Templates</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
