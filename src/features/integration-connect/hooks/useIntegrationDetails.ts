
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchIntegrationById } from "@/services/integrationService";

export function useIntegrationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: integration,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["integration", id],
    queryFn: async () => {
      if (!id) return null;
      return await fetchIntegrationById(id);
    },
  });

  return {
    integration,
    isLoading,
    fetchError,
    navigate,
    integrationId: id,
  };
}
