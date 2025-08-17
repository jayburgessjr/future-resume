# Stripe Configuration

This app uses Stripe for subscription billing. You'll need to configure the following environment variables in your Supabase Edge Function Secrets:

## Required Secrets
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
- `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret for signature verification
- `STRIPE_PRICE_PRO` - (Optional) Pre-configured price ID for Pro plan
- `SITE_URL` - Your site URL (e.g., https://yourapp.com)

## Setup Steps
1. Create a Stripe account and get your API keys
2. Add the secrets to Supabase Edge Function Secrets
3. Configure webhook endpoint in Stripe Dashboard pointing to `/functions/v1/stripe-webhook`
4. Test with Stripe test mode before going live

## Features
- **Free Plan**: 1 resume, basic AI optimization, ATS checking
- **Pro Plan**: Unlimited resumes, version history, interview toolkit, advanced exports, priority support

For production, switch to live Stripe keys and update webhook endpoint.