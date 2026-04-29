# HeriWill

A comprehensive open-source inheritance planning and vault management application built with Next.js and Supabase.

## Features

- **Vault Management**: Create and organize digital vaults for different purposes (share or delete after death)
- **Heir Management**: Add heirs and manage their permissions with secure invitation codes or magic links
- **Asset Tracking**: Keep track of digital assets and their designated recipients
- **Legal Documents**: Store and manage important legal documents
- **Inheritance Triggers**: Set up automatic inheritance activation based on predefined conditions
- **Secure Storage**: End-to-end encryption for all sensitive data
- **Role-Based Access**: Different permission levels for owners, heirs, and trusted contacts
- **Magic Link Authentication**: Passwordless login/signup via email magic links (Supabase Auth)
- **Notary Integration**: Invite and manage notaries for document verification
- **Inheritance Triggers**: Automated inheritance trigger system with verification workflows
- **Secure Storage**: File upload and secure storage with signed URLs
- **Real-time Notifications**: In-app notification system
- **Self-Hosted**: Full control over your data with no subscription tiers or limits

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **PDF Generation**: @react-pdf/renderer, react-pdf
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
   
   **Optional Variables:**
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics measurement ID (leave empty to disable analytics)

4. **Note**: Supabase email configuration is required for magic link authentication. Configure SMTP in your Supabase project dashboard under Authentication → Providers → Email.

4. **Update heirs table schema**

   Run this SQL in your Supabase SQL editor to update the heirs table column names and add the 'notary' heir type:

   ```sql
   -- Add notary to heir_type check constraint
   ALTER TABLE public.heirs DROP CONSTRAINT IF EXISTS heirs_heir_type_check;
   ALTER TABLE public.heirs ADD CONSTRAINT heirs_heir_type_check CHECK (
     heir_type = ANY (
       array[
         'family'::text,
         'friend'::text,
         'professional'::text,
         'organization'::text,
         'notary'::text
       ]
     )
   );
   ```

5. **Set up Supabase database**
   
   Run the schema migration in your Supabase SQL editor:
   ```bash
   # Copy the contents of schema.sql and run it in your Supabase dashboard
   ```

   The schema includes:
   - Tables: assets, heirs, inheritance_triggers, legal, notaries, notifications, shared_vaults, users, vault_items, vaults
   - Row Level Security (RLS) policies
   - Database indexes
   - Functions and triggers

5. **Run the development server**
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
- **legal**: Legal documents and templates
- **notaries**: Notary contacts and invitations
- **inheritance_triggers**: Trigger events for inheritance activation
- **notifications**: User notifications
- **shared_vaults**: Vault sharing between users

See `schema.sql` for the complete database schema.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

Ensure all environment variables are set in your deployment environment.

## Security Features

- Row Level Security (RLS) on all database tables
- Input sanitization using DOMPurify
- Rate limiting on API routes
- Secure file upload with signed URLs
- Audit logging for sensitive operations
- Encrypted heir contact information

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
