# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4a54184e-bd45-4db7-924d-f5b0521c8d3f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4a54184e-bd45-4db7-924d-f5b0521c8d3f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

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
- supabase functions serve validate-connection --env-file supabase/.env --inspect-mode brk

**Migrations**
 - supabase db diff --use-migra -f [migration name]


## Limitations 
- Datasources must be accessable on the internet

## Connection String formats
- MYSQL
-- mysql://<username>:<password>@<host>:<port>/<database>
-- mysql://user_abc:secret123@containers-us-west-45.railway.app:6582/railway

-MONGODB
-- if you have a @ in your user name relace with %40
-- mongodb+srv://<username>:<password>@<host>/<database>?retryWrites=true&w=majority&appName=Cluster18426