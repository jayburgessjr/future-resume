# Deployment Guide

## Prerequisites

1. **Supabase Project**: Set up at [supabase.com](https://supabase.com)
2. **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com)
3. **Netlify Account**: For hosting (or Vercel/other)

## Environment Setup

### 1. Supabase Configuration

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

### 2. Set OpenAI API Key in Supabase

```bash
# Set the secret for Edge Functions
supabase secrets set OPENAI_API_KEY=sk-your-actual-key-here

# Verify the secret is set
supabase secrets list
```

### 3. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy generate-resume
```

### 4. Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DEV_MODE=false
```

## Database Setup

### Run Migrations

```bash
# Apply database migrations
supabase db push

# Or reset and apply all
supabase db reset
```

### Enable Row Level Security

Ensure RLS is enabled on all tables:
- profiles
- resumes  
- resume_versions

## Production Deployment

### Netlify

1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Vercel

1. Import project from GitHub
2. Set framework preset to "Vite"
3. Add environment variables

## Health Checks

After deployment, verify:

1. **Frontend loads**: Check your domain
2. **Authentication works**: Try sign up/sign in
3. **Resume generation**: Test with sample content
4. **Edge Functions**: Check Supabase dashboard

## Monitoring

Set up monitoring for:
- Edge Function logs: `supabase functions logs`
- Database performance: Supabase dashboard
- Frontend errors: Browser console + analytics

## Troubleshooting

### Common Issues

**Resume generation fails**:
- Check OpenAI API key is set correctly
- Verify Edge Function deployment
- Check function logs for errors

**Authentication issues**:
- Verify Supabase URL/keys
- Check RLS policies
- Ensure proper redirects are configured

**Build failures**:
- Clear node_modules and reinstall
- Check TypeScript compilation
- Verify all environment variables are set