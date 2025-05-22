
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight } from "lucide-react";

const IndexPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="max-w-3xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M13 3L21 7V17L13 21L3 17V7L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 12V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 12L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Welcome to SyncStack
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Connect and automate your data syncs with our powerful integration platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button asChild size="lg" className="text-lg px-8 h-12">
              <Link to="/dashboard" className="flex items-center gap-2">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="text-lg px-8 h-12">
                <Link to="/auth">Login / Register</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 h-12">
                <Link to="/templates" className="flex items-center gap-2">
                  Explore Templates <ArrowRight size={18} />
                </Link>
              </Button>
            </>
          )}
        </div>
        
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-left">
          <div className="p-6 border rounded-lg bg-card">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2">Seamless Syncs</h3>
            <p className="text-muted-foreground">Connect your data sources with zero code and automatic syncing.</p>
          </div>
          
          <div className="p-6 border rounded-lg bg-card">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M12 16V21M12 16L18 21M12 16L6 21M6 9L12 4M12 4L18 9M12 4V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2">Data Transformation</h3>
            <p className="text-muted-foreground">Transform and map your data automatically between systems.</p>
          </div>
          
          <div className="p-6 border rounded-lg bg-card">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M10 13C10.4295 13.5741 10.9774 14.0492 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.362 15.0435 15.0796 14.9404 15.7513 14.6898C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4528 9.59699 21.989 8.33397 21.9848 7.02299C21.9806 5.71201 21.4363 4.45251 20.5168 3.51677C19.5973 2.58103 18.3378 2.01786 17.0268 1.99079C15.7158 1.96372 14.4374 2.47906 13.48 3.36L11.76 5.00" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60706C11.7642 9.26329 11.0684 9.05886 10.3532 9.00765C9.63794 8.95643 8.92038 9.05951 8.24861 9.31012C7.57684 9.56073 6.96684 9.95275 6.45996 10.46L3.45996 13.46C2.54717 14.403 2.01093 15.666 2.01511 16.977C2.01929 18.288 2.56362 19.5475 3.48305 20.4832C4.40247 21.419 5.66198 21.9633 6.97296 21.9674C8.28394 21.9716 9.54696 21.4354 10.49 20.53L12.21 18.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2">Multiple Integrations</h3>
            <p className="text-muted-foreground">Connect with hundreds of systems through our integration library.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
