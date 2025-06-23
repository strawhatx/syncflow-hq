export async function validateSupabaseToken(authHeader: string | null): Promise<any> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const jwt = authHeader.split(' ')[1];

  const response = await fetch(Deno.env.get('SUPABASE_URL') + '/auth/v1/user', {
    headers: {
      Authorization: `Bearer ${jwt}`,
      apiKey: Deno.env.get('SUPABASE_ANON_KEY')!,
    },
  });

  if (!response.ok) {
    throw new Error('Invalid or expired JWT');
  }

  const user = await response.json();
  return user;
}
