

CREATE OR REPLACE VIEW public.connector_oauth_configs_public AS
SELECT
  id,
  name,
  type,
  provider,
  config->>'icon' AS icon,
  config->>'client_id' AS client_id,
  config->>'auth_url' AS auth_url,
  config->>'token_url' AS token_url,
  config->>'redirect_url' AS redirect_url,
  config->'scopes' AS scopes,
  config->'required_parameters' AS required_parameters,
  config->'required_fields' AS required_fields,
  config->>'code_challenge_required' AS code_challenge_required,
  config->>'description' AS description,
  created_at,
  updated_at
FROM public.connectors
WHERE type = 'oauth';

CREATE OR REPLACE VIEW public.connectors_public AS
SELECT
    id,
    name,
    type,
    provider,
    config ->> 'icon' AS icon,
    config ->> 'client_id' AS client_id,
    config ->> 'auth_url' AS auth_url,
    config ->> 'token_url' AS token_url,
    config ->> 'redirect_url' AS redirect_url,
    config -> 'scopes' AS scopes,
    config -> 'required_fields' AS required_fields,
    config -> 'required_parameters' AS required_parameters,
    config ->> 'code_challenge_required' AS code_challenge_required,
    config ->> 'description' AS description,
    created_at,
    updated_at
FROM public.connectors
WHERE
    is_active = true;