// src/services/oauth/oauthState.ts
const OAUTH_STATE_KEY = "oauth_state";
const PKCE_VERIFIER_KEY = "pkce_code_verifier";

export const saveOAuthState = (state: string) => {
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
}
export const getOAuthState = (): string | null => {
  return sessionStorage.getItem(OAUTH_STATE_KEY);
}
export const clearOAuthState = () => {
  sessionStorage.removeItem(OAUTH_STATE_KEY);
}

export const savePkceVerifier = (verifier: string) => {
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
}
export const getPkceVerifier = (): string | null => {
  return sessionStorage.getItem(PKCE_VERIFIER_KEY);
}
export const clearPkceVerifier = () => {
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
}