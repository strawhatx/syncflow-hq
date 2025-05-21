
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <p className="text-muted-foreground mb-6 md:mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
