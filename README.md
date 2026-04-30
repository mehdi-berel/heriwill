# HeriWill

A comprehensive open-source inheritance planning and vault management application built with Next.js and Supabase.

## Features

- **Vault Management**: Create and organize digital vaults for different purposes (share or delete after death)
- **Heir Management**: Add heirs and manage their permissions with secure invitation codes
- **Asset Tracking**: Keep track of digital assets and their designated recipients with total value calculation
- **Inheritance Triggers**: Set up automatic inheritance activation based on predefined conditions
- **Secure Storage**: End-to-end encryption for all sensitive data
- **Role-Based Access**: Different permission levels for owners, heirs, and trusted contacts
- **Inheritance Triggers**: Automated inheritance trigger system with verification workflows
- **File Storage**: Secure file upload and storage with signed URLs
- **Real-time Notifications**: In-app notification system
- **Self-Hosted**: Full control over your data with no subscription tiers or limits
- **Heir Assignment**: Select which heirs inherit specific assets directly from asset details
- **Consistent UX/UI**: Unified design language across vaults, inheritance, and assets sections

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Sanitization**: DOMPurify, isomorphic-dompurify

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mehdi-berel/heriwill.git
   cd heriwill
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables:
   
   **Required Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `CRON_SECRET`: Secure secret for cron job authentication (generate with `openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL`: Your application URL (e.g., `http://localhost:3000` for development)

4. **Set up Supabase database**

   Copy the contents of `schema.sql` and run it in your Supabase SQL editor to create the database tables.

   The schema includes:
   - Tables: assets, heirs, inheritance_triggers, notaries, notifications, shared_vaults, users, vault_items, vaults
   - Row Level Security (RLS) policies
   - Database indexes
   - Functions and triggers

5. **Create storage buckets**

   Create storage buckets in your Supabase project:
   - Go to Storage in your Supabase dashboard
   - Click "New bucket"

   **Required Buckets:**
   - `vault-files`: For storing vault item files
   - `documents`: For storing asset-related documents

   Configure bucket settings as needed (public/private access, file size limits, etc.)

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **users**: User profiles and settings
- **vaults**: Digital vaults for organizing assets and documents
- **vault_items**: Items stored within vaults
- **assets**: Detailed asset information and metadata
- **heirs**: Designated heirs with invitation and verification status
- **inheritance_triggers**: Trigger events for inheritance activation
- **notifications**: User notifications
- **shared_vaults**: Vault sharing between users

See `schema.sql` for the complete database schema.

## Deployment

**Infrastructure Preference:** This project is optimized for **Vercel** (hosting + cron jobs) and **Supabase** (backend). This combination provides a seamless development and deployment experience with built-in cron job support, automatic scaling, and seamless integration with Supabase.

**Adaptability:** If you prefer using other services (e.g., Netlify, Railway, DigitalOcean, or self-hosted PostgreSQL), the code can be easily adapted with minimal changes. The modular architecture allows for swapping:
- Hosting providers (Next.js is framework-agnostic)
- Database providers (Supabase uses standard PostgreSQL)
- Cron job services (replace Vercel Cron with any scheduler)
- Storage providers (replace Supabase Storage with S3-compatible services)

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Note:** The inheritance trigger cron job is automatically configured when deployed on Vercel. No additional setup required.

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

Ensure all environment variables are set in your deployment environment.

**Important:** The inheritance trigger cron job (`/api/cron/check-triggers`) must be manually configured on non-Vercel platforms to run periodically (recommended: every hour). Configure your platform's cron job or scheduler to call this endpoint with the `CRON_SECRET` in the Authorization header.

## Security Features

- Row Level Security (RLS) on all database tables
- Input sanitization using DOMPurify
- Secure file upload with signed URLs
- Audit logging for sensitive operations

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Supabase](https://supabase.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
