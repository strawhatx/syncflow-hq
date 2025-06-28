# Syncflow HQ

A modern data synchronization platform that enables seamless integration between various data sources and applications.

## 🚀 Features

- **Multi-Provider OAuth Integration** - Connect to popular services like Airtable, Supabase, and more
- **Dynamic Data Source Management** - Support for databases, spreadsheets, and APIs
- **Team-Based Access Control** - Secure multi-tenant architecture with role-based permissions
- **Real-Time Synchronization** - Keep your data in sync across platforms
- **Modern Web Interface** - Built with React and Tailwind CSS for a great user experience

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library

### Backend
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Edge Functions** - Serverless functions for API endpoints
- **Row Level Security (RLS)** - Database-level security
- **OAuth 2.0** - Secure authentication flows

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd syncflow-hq
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Fill in your environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
```bash
# Start Supabase locally
supabase start

# Apply migrations
supabase db push
```

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see the application.

## 🔧 Development

### Edge Functions

#### Start Edge Functions Server
```bash
supabase functions serve --env-file supabase/.env
```

#### Debug Edge Functions
```bash
# Debug a specific function
supabase functions serve oauth-callback --env-file supabase/.env --inspect-mode brk

# Debug all functions
supabase functions serve --env-file supabase/.env --inspect-mode brk
```

### Database Migrations

#### Create a New Migration
```bash
supabase migrations new [migration_name]
```

#### Apply Migrations
```bash
supabase db push
```

#### Reset Database
```bash
supabase db reset
```

## 🔌 Data Source Configuration

### Supported Data Sources

Syncflow HQ supports various data sources with different connection requirements:

#### MySQL
```bash
mysql://<username>:<password>@<host>:<port>/<database>
```

#### MongoDB
```bash
mongodb+srv://<username>:<password>@<host>/<database>?retryWrites=true&w=majority&appName=<appname>
```

**Note:** If your MongoDB username contains an `@` symbol, replace it with `%40`.

#### PostgreSQL
```bash
postgresql://<username>:<password>@<host>:<port>/<database>
```

#### Amazon S3
```bash
s3://<bucket>/<prefix>
```

## 🔐 OAuth Providers

### Supported Providers
- **Airtable** - Spreadsheet and database integration
- **Supabase** - PostgreSQL database integration
- **Google Sheets** - Spreadsheet integration
- **More coming soon...**

### Adding New OAuth Providers
1. Add the provider to `ConnectorProvider` type in `src/types/connectors.ts`
2. Add provider-specific parameters to `getProviderSpecificParameters()` in `src/services/oauth/service.ts`
3. Configure the connector in the database with required OAuth settings

## 🏗️ Project Structure

```
syncflow-hq/
├── src/
│   ├── components/          # Reusable UI components
│   ├── features/           # Feature-based modules
│   ├── services/           # API and business logic
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── integrations/       # Third-party integrations
├── supabase/
│   ├── functions/          # Edge functions
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
└── public/                 # Static assets
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Supabase
```bash
# Deploy database changes
supabase db push

# Deploy edge functions
supabase functions deploy
```

## 📝 API Documentation

### Edge Functions

#### OAuth Callback
- **Endpoint:** `/functions/v1/oauth-callback`
- **Method:** POST
- **Purpose:** Handle OAuth callback and create connections

#### Get Tables
- **Endpoint:** `/functions/v1/get-schema`
- **Method:** POST
- **Purpose:** Fetch available data sources/tables for a provider

#### Validate Connection
- **Endpoint:** `/functions/v1/validate-connection`
- **Method:** POST
- **Purpose:** Validate connection configuration

## 🔒 Security

- **Row Level Security (RLS)** - Database-level access control
- **OAuth 2.0** - Secure authentication flows
- **PKCE** - Proof Key for Code Exchange for enhanced security
- **JWT Tokens** - Secure session management

## 🚧 Limitations

- **Internet Accessibility** - Data sources must be accessible on the internet
- **Provider Support** - Limited to currently supported OAuth providers
- **Data Size** - Large datasets may require optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Built with ❤️ by the Syncflow Team**
