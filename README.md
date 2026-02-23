# AI Chat Assistant 🤖

A modern web-based AI chat application built with Flask and Google's **Gemini 1.5 Flash** model, featuring Google OAuth 2.0 authentication, persistent multi-session chat history, file uploads, and an interactive 3D AI avatar.

![AI Chat Assistant](https://via.placeholder.com/800x400/2a1154/ffffff?text=AI+Chat+Assistant)

## ✨ Features

### 🔐 Authentication
- **Google OAuth 2.0 Sign-In** — Secure sign-in via OpenID Connect discovery (`server_metadata_url`)
- **Guest Mode** — Try the app without signing in
- **User Profile Panel** — Displays avatar, name, and email in the sidebar (ChatGPT-style)
- **Session Management** — Secure server-side Flask session handling with proper `session.modified` tracking

### 💬 Chat Features
- **AI-Powered Conversations** — Powered by `gemini-1.5-flash` (fast, free-tier friendly)
- **Full Conversation Memory** — Chat history is passed to Gemini on every request so the AI remembers context
- **Real-time Responses** — Instant AI replies with a "Thinking…" indicator
- **File Uploads** — Attach images, `.txt`, `.pdf`, `.json`, `.csv` files alongside messages

### 📱 Chat Management (ChatGPT-style)
- **Multiple Conversations** — Create and switch between chat sessions
- **Chat History Sidebar** — Collapsible sidebar with all past chats
- **Auto-Generated Titles** — First message becomes the chat title
- **Delete Individual Chats** — Remove specific conversations with confirmation
- **Clear All Chats** — Bulk delete from the user menu

### 🎨 User Interface
- **Modern Dark Theme** — Purple gradient design
- **3D AI Avatar Panel** — Interactive Sketchfab-embedded 3D companion
- **Responsive Design** — Works on desktop and mobile
- **Smooth Animations** — Polished sidebar slide and button transitions

### 🛡️ Security
- **Protected API Endpoints** — `@login_required` decorator on all `/api/*` routes
- **User-Isolated Data** — Chat history scoped to each user session
- **Proper OAuth Token Handling** — Uses OpenID Connect userinfo with `sub`/`id` fallback

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Google Cloud Project with OAuth 2.0 credentials
- Google Gemini API key (get one free at [aistudio.google.com](https://aistudio.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abrar-0020/ai-chat-app.git
   cd ai-chat-app
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create a `.env` file** in the project root:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   SECRET_KEY=any_random_secret_string
   ```

4. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
   - Create an OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `http://localhost:5500/authorize`
   - See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for full instructions

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Open your browser**
   Navigate to `http://localhost:5500`

## 📁 Project Structure

```
ai-chat-app/
├── app.py                  # Main Flask app — routes, Gemini API, OAuth, session logic
├── index.py                # Vercel entry point
├── requirements.txt        # Python dependencies
├── vercel.json             # Vercel deployment config
├── .env                    # Environment variables (not committed)
├── .gitignore
├── GOOGLE_OAUTH_SETUP.md   # Step-by-step OAuth setup guide
├── VERCEL_DEPLOYMENT.md    # Vercel deployment guide
├── templates/
│   ├── index.html          # Main chat UI
│   └── signin.html         # Sign-in page
└── static/
    ├── script.js           # Frontend logic (chat, file uploads, user menu)
    └── style.css           # Styles and animations
```

## 🔧 API Endpoints

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Main chat interface (redirects to sign-in if unauthenticated) |
| `GET` | `/signin` | Sign-in page |
| `GET` | `/login` | Initiates Google OAuth flow |
| `GET` | `/authorize` | OAuth callback handler |
| `GET` | `/guest` | Enter guest mode |
| `GET` | `/logout` | Sign out and clear session |
| `GET` | `/api/user` | Get current user info |

### Chat Management
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/chats` | List all chats |
| `POST` | `/api/chats` | Create a new chat |
| `GET` | `/api/chats/<id>` | Get chat history |
| `POST` | `/api/chats/<id>/message` | Send a message |
| `DELETE` | `/api/chats/<id>` | Delete a chat |

## 🎯 Usage

### Starting a Conversation
1. Sign in with Google (or continue as Guest)
2. A new chat is created automatically
3. Type your message and press **Enter** or click **Send**
4. The AI responds using Gemini 1.5 Flash with full conversation memory

### Managing Chats
- **New Chat** — Click "New Chat" in the sidebar
- **Switch Chats** — Click any chat in the history list
- **Delete Chat** — Hover a chat → click the trash icon
- **Clear All** — Click your profile → "Clear All Chats"

### Uploading Files
- Click the **+** button next to the input box
- Select images, text, JSON, or CSV files
- Add an optional message and send — file contents are included in the AI prompt

## 🛠️ Technologies

| Layer | Tech |
|-------|------|
| Backend | Flask, Flask-CORS, python-dotenv |
| AI | Google Gemini 1.5 Flash (`google-generativeai`) |
| Auth | Google OAuth 2.0 via Authlib (OpenID Connect) |
| Frontend | Vanilla JS, CSS3, Font Awesome, Google Fonts (Poppins) |
| Deployment | Vercel (serverless Python) |

## 🌟 Features Comparison

| Feature | This App | ChatGPT |
|---------|----------|---------|
| Google Sign-In | ✅ | ❌ |
| Guest Mode | ✅ | ❌ |
| Multiple Conversations | ✅ | ✅ |
| Conversation Memory | ✅ | ✅ |
| File Uploads | ✅ | ✅ |
| Delete / Clear Chats | ✅ | ✅ |
| 3D Avatar | ✅ | ❌ |
| Mobile Responsive | ✅ | ✅ |
| Dark Theme | ✅ | ✅ |

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Acknowledgments

- Google for the Gemini AI API and OAuth services
- Flask community for the excellent web framework
- Font Awesome for the beautiful icons
- Sketchfab for the 3D avatar embed

## 📞 Support

If you encounter any issues:

1. Check the [Google OAuth Setup Guide](GOOGLE_OAUTH_SETUP.md)
2. Ensure all environment variables are set correctly
3. Verify your Google Cloud Console OAuth configuration
4. Open an issue on GitHub if problems persist

---

**Made with ❤️ using Flask and Google Gemini AI**
