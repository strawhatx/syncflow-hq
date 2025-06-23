import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { processOAuthCallback } from "@/services/oauthService";
import { useQueryClient } from "@tanstack/react-query";
import { useTeam } from "@/contexts/TeamContext";

const OAuthCallback = () => {
    const [isProcessing, setIsProcessing] = useState(true);
    const [searchParams] = useSearchParams();
    const { provider } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { team } = useTeam();


    useEffect(() => {
        const processCallback = async () => {
            try {
                const code = searchParams.get("code");
                const state = searchParams.get("state");
                const error = searchParams.get("error");

                if (error) {
                    toast({
                        title: "Authorization failed",
                        description: error,
                        variant: "destructive",
                    });
                    navigate("/integrations");
                    return;
                }

                if (!code || !state) {
                    throw new Error("Missing required parameters");
                }

                if (!provider) {
                    throw new Error("Provider not specified in callback URL");
                }

                // Process the callback
                await processOAuthCallback(team.id, code, state, provider, searchParams);

                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ["integrations"] });

                toast({
                    title: "Connection successful",
                    description: `Your ${provider} account has been connected successfully.`,
                });

                // Redirect to integrations page
                navigate("/integrations");
            } catch (error) {
                console.error("Error processing callback:", error);
                toast({
                    title: "Connection failed",
                    description: error instanceof Error ? error.message : "An unknown error occurred",
                    variant: "destructive",
                });
                navigate("/connections");
            } finally {
                setIsProcessing(false);
            }
        };

        processCallback();
    }, [searchParams, navigate, queryClient, provider]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {isProcessing ? (
                <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Completing connection...</h2>
                    <p className="text-muted-foreground">Please wait while we finalize your connection.</p>
                </>
            ) : null}
        </div>
    );
};

export default OAuthCallback;