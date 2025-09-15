# Google OAuth Setup Instructions

To enable Google Sign-In for your AI Chat Assistant, follow these steps:

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and OAuth 2.0 API

## 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "AI Chat Assistant"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `openid`, `email`, `profile`
5. Add test users (during development)

## 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5500/authorize` (for local development)
   - `https://yourdomain.com/authorize` (for production)
5. Copy the Client ID and Client Secret

## 4. Update Environment Variables

1. Copy `.env.example` to `.env`
2. Update the following variables:
   ```
   GOOGLE_CLIENT_ID=your_actual_client_id
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   SECRET_KEY=generate_a_random_secret_key
   ```

## 5. Install Required Dependencies

```bash
pip install authlib requests flask flask-cors python-dotenv google-generativeai
```

## 6. Run the Application

```bash
python app.py
```

The application will be available at `http://localhost:5500`

## Features Added

- ✅ Google OAuth 2.0 authentication
- ✅ User profile display in sidebar
- ✅ Sign-in page with Google button
- ✅ User account management section
- ✅ Secure session management
- ✅ Protected API endpoints
- ✅ Sign-out functionality

## Notes

- Chat history is now tied to user sessions
- Users must be signed in to access the chat interface
- User profile information is displayed in the sidebar
- All API endpoints are protected and require authentication
