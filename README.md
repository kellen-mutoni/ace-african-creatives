# ACE: African Creatives Empowered

ACE is a web platform for Rwanda's creative industry. It has two sides:
- **Discovery:** anyone can browse and search Rwandan films and music videos without an account.
- **Networking:** a protected space for creative professionals who are approved by an admin. Members build profiles, find each other, post and apply to casting calls, and submit their work to Discovery.

**Live site:** https://ace-african-creatives.vercel.app/
**SRS document:** https://docs.google.com/document/d/12yT5XrDfCS38UQs1fc2x53V3oKnmJOtH/edit?rtpof=true&sd=true&tab=t.0

## Features

- Guest browsing, search, and content detail pages (FR 1)
- Registration with verification details, pending approval screen, and login (FR 2)
- Profile editing, creative search, and a contact form (FR 3)
- Casting calls: post, browse, apply, and view applications (FR 4)
- Content submission for admin review (FR 5)
- Admin dashboard to approve, reject, suspend, or remove accounts, content, and casting calls, with an audit log (FR 6)

## Tech stack

- React (Vite) with Tailwind CSS and React Router
- Supabase for the database, authentication, and security rules
- Deployed on Vercel

## How to run it locally

1. **Install Node.js** (version 18 or newer) and Git.
2. **Clone the repo and install packages:**
```bash
   git clone https://github.com/kellen-mutoni/ace-african-creatives
   cd ace-african-creatives
   npm install
```
3. **Create a Supabase project** at https://supabase.com (the free plan is enough).
4. **Set up the database:** in your Supabase project open **SQL Editor**, click **New query**, paste the full contents of `supabase/schema.sql`, and click **Run**. If a popup asks about Row Level Security, choose the option that enables it.
5. **Get your keys:** in Supabase open **Project Settings**, then **API Keys**, and copy the project URL and the publishable key.
6. **Create a file named `.env.local`** in the project root with:
```
   VITE_SUPABASE_URL=your project url
   VITE_SUPABASE_PUBLISHABLE_KEY=your publishable key
```
7. **Start the app:**
```bash
   npm run dev
```
   Open http://localhost:5173/ in your browser.

## How to try the Networking side

1. Click **Join** and register an account.
2. Make your account the admin by running this in the Supabase SQL Editor, using your own email:
```sql
   update profiles set is_admin = true, status = 'approved' where email = 'your email';
   update auth.users set email_confirmed_at = now() where email = 'your email';
```
3. Log in. You will see the members area with the **Admin** link.
4. Register a second account to test the approval flow: it lands on a "under review" page until you approve it from the Admin dashboard.
5. Roles (Actor, Filmmaker, and so on) are set on your profile. Filmmakers, directors, and producers can post casting calls, and actors can apply.

## Known limits of this prototype

- Contact form messages are saved in the database. Email delivery is planned for a later version.
- Users can edit their own role on their profile. Admin-verified roles are planned for a later version.

## Project structure

- `src/pages` holds one file per page.
- `src/lib` holds the Supabase connection and the member access check.
- `supabase/schema.sql` holds the full database setup.
- `vercel.json` makes page links keep working when refreshed on Vercel.

Built by Ashley Kellen Mutoni for the African Leadership University summative project.