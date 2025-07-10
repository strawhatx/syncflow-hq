import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { processOAuthCallback } from "@/services/oauth/service";
import { useQueryClient } from "@tanstack/react-query";
import { useTeam } from "@/contexts/TeamContext";
import { addMetadataSyncJob } from "@/services/jobs/service";

/**
 * Handles the OAuth callback flow for third-party integrations.
 * Displays a loading spinner while processing, and shows a toast on success or failure.
 */
const OAuthCallback = () => {
    const [isProcessing, setIsProcessing] = useState(true);
    const [searchParams] = useSearchParams();
    const { provider } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { team, loading: isTeamLoading } = useTeam();

    // Extract and validate required params
    const getCallbackParams = useCallback(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        return { code, state, error };
    }, [searchParams]);

    // Handle the OAuth callback logic
    const handleCallback = useCallback(async () => {
        const { code, state, error } = getCallbackParams();

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
            toast({
                title: "Missing parameters",
                description: "Missing required parameters from OAuth provider.",
                variant: "destructive",
            });
            navigate("/connectors");
            return;
        }

        if (!provider) {
            toast({
                title: "Provider missing",
                description: "Provider not specified in callback URL.",
                variant: "destructive",
            });
            navigate("/connectors");
            return;
        }

        if (!team?.id) {
            toast({
                title: "Team not loaded",
                description: "Team information is not available. Please try again.",
                variant: "destructive",
            });
            navigate("/connectors");
            return;
        }

        try {
            // process the oauth callback & get the connector
            const result = await processOAuthCallback(team.id, code, state, provider, searchParams);

            // add metadata sync job to start syncing the metadata
            await addMetadataSyncJob(result.id, team.id);
            queryClient.invalidateQueries({ queryKey: ["connectors"] });

            toast({
                title: "Connection successful",
                description: `Your ${provider} account has been connected successfully.`,
            });

            navigate("/connectors");
        } catch (err) {
            console.error("Error processing callback:", err);
            toast({
                title: "Connection failed",
                description: err instanceof Error ? err.message : "An unknown error occurred",
                variant: "destructive",
            });
            navigate("/connectors");
        } finally {
            setIsProcessing(false);
        }
    }, [getCallbackParams, provider, team, searchParams, queryClient, navigate]);

    useEffect(() => {
        // if team is loading, don't do anything
        if (isTeamLoading || !team) return;

        handleCallback();

    }, [handleCallback, isTeamLoading, team]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {isProcessing && (
                <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Completing connection...</h2>
                    <p className="text-muted-foreground">Please wait while we finalize your connection.</p>
                </>
            )}
        </div>
    );
};

export default OAuthCallback;