import { supabase } from "../config/supabase";

interface Connector {
    token_url: string;
    client_id: string;
    client_secret: string;
}

export async function getValidAccessToken(connectionId: string): Promise<string> {
    // 1) Load connection data
    const { data: connection, error } = await supabase
        .from("connections")
        .select("config, connector_id")
        .eq("id", connectionId)
        .single();

    if (error || !connection) {
        throw new Error("Connection not found");
    }

    const { config } = connection;
    const { access_token, refresh_token, expires_at } = config;

    const now = Date.now();

    //  if not exprired or if no expriration exists just retutn the access token.
    if (!expires_at || (expires_at && now < expires_at - 60 * 1000)) {
        // token valid for at least another minute
        return access_token;
    }

    // 2) Load connector details
    const { data: connectorData, error: connectorError } = await supabase
        .from("connectors")
        .select("config")
        .eq("id", connection.connector_id)
        .single();

    if (connectorError || !connectorData) {
        throw new Error("Connector config not found");
    }

    const connector: Connector = {
        token_url: connectorData.config.token_url,
        client_id: connectorData.config.client_id,
        client_secret: connectorData.config.client_secret
    };

    // 3) Refresh the token
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        client_id: connector.client_id,
        client_secret: connector.client_secret,
    });

    const response = await fetch(connector.token_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString()
    });

    if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const tokenData = await response.json();
    const newAccessToken = tokenData.access_token;
    const newExpiresAt = Date.now() + tokenData.expires_in * 1000;

    // 4) Update Supabase
    const { error: updateError } = await supabase
        .from("connections")
        .update({
            config: {
                ...config,
                access_token: newAccessToken,
                expires_at: newExpiresAt,
                refresh_token: tokenData.refresh_token || refresh_token,
            }
        })
        .eq("id", connectionId);

    if (updateError) {
        throw new Error("Failed to update token in database");
    }

    return newAccessToken;
}
