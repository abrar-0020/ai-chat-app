# Vercel Deployment Configuration

## Important: Update Google OAuth Settings

After deploying to Vercel, you need to update your Google Cloud Console OAuth settings:

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add these authorized redirect URIs:
   - https://YOUR-VERCEL-DOMAIN.vercel.app/authorize
   - http://localhost:5500/authorize (for local development)

Replace YOUR-VERCEL-DOMAIN with your actual Vercel deployment URL.

## Environment Variables on Vercel

Make sure to set these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Click Settings → Environment Variables
3. Add these variables:
   - GOOGLE_CLIENT_ID=your_google_client_id
   - GOOGLE_CLIENT_SECRET=your_google_client_secret  
   - GEMINI_API_KEY=your_gemini_api_key
   - SECRET_KEY=your_secret_key

## Deployment Commands

After making these changes:

```bash
git add .
git commit -m "🚀 Configure for Vercel deployment - Add vercel.json, requirements.txt, and index.py entry point"
git push origin main
```

Then redeploy on Vercel - it should work properly!
