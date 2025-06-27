# Syncflow HG

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

**Run Edge Functions:** 
supabase functions serve --env-file supabase/.env

**Debug Edge Functions:**
- supabase functions serve oauth-callback--env-file supabase/.env --inspect-mode brk

**Migrations**
 - supabase db diff --use-migra -f [migration name]


## Limitations 
- Datasources must be accessable on the internet

## Connection String formats
- MYSQL
-- mysql://<username>:<password>@<host>:<port>/<database>

-MONGODB
-- if you have a @ in your user name relace with %40
-- mongodb+srv://<username>:<password>@<host>/<database>?retryWrites=true&w=majority&appName=<appname>
