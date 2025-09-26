# Supabase React App

A learning project to explore Supabase features including authentication, database operations, and real-time functionality with React, TypeScript, and Vite.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- pnpm, npm, or yarn package manager
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- A Supabase account and project

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd supabase-react-app
```

### 2. Install dependencies

```bash
pnpm install
# or
npm install
```

### 3. Environment Setup

Copy the `.env.example` file to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Update the `.env` file with your Supabase project details:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

Run the following commands to set up and configure your Supabase project:

### 1. Link your local project to Supabase

```bash
npx supabase link --project-ref <project-id>
```

This command connects your local development environment to your remote Supabase project.

### 2. Push database changes

```bash
npx supabase db push
```

This applies any local database migrations to your remote Supabase database.

### 3. Generate TypeScript types

```bash
npx supabase gen types typescript --project-id "<project-id>" --schema public > src/database.types.ts
```

This generates TypeScript type definitions based on your database schema for type-safe database operations.

### Additional Supabase Commands

#### Export/Dump database schema

```bash
npx supabase db dump --schema public -f supabase/migrations/initial_schema.sql
```

Export your current database schema into a migration file. Useful for capturing database changes or creating backups.

#### Generate migration from database changes

```bash
npx supabase db diff --schema public
```

Compare your local database with remote and generate a migration file for the differences.

#### Create a new migration file

```bash
npx supabase migration new <migration_name>
```

Create a new empty migration file for manual SQL changes.

#### Reset local database

```bash
npx supabase db reset
```

Reset your local database to a clean state and reapply all migrations.

#### Start local Supabase development stack

```bash
npx supabase start
```

Start local Supabase services (database, auth, storage, etc.) for development.

#### Stop local Supabase services

```bash
npx supabase stop
```

Stop all local Supabase services.

#### Check migration status

```bash
npx supabase migration list
```

List all migrations and their application status.

#### Pull remote database changes

```bash
npx supabase db pull
```

Pull schema changes from your remote database to create a new migration locally.

## Development

### Available Scripts

- **`pnpm dev`** - Start the development server
- **`pnpm build`** - Build for production
- **`pnpm lint`** - Run ESLint to check code quality
- **`pnpm preview`** - Preview the production build locally

### Running the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase
- **Package Manager**: pnpm

## Project Structure

```
supabase-react-app/
├── src/                    # Source code
├── public/                 # Static assets
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   └── config.toml        # Supabase configuration
├── .env.example           # Environment variables template
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```
