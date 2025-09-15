# AI Chat Assistant 🤖

A modern web-based AI chat application built with Flask and Google's Gemini AI, featuring Google OAuth authentication and persistent chat history.

![AI Chat Assistant](https://via.placeholder.com/800x400/2a1154/ffffff?text=AI+Chat+Assistant)

## ✨ Features

### 🔐 Authentication
- **Google OAuth 2.0 Sign-In** - Secure authentication with your Google account
- **User Profile Management** - Display user info in sidebar like ChatGPT
- **Session Management** - Secure server-side session handling

### 💬 Chat Features
- **AI-Powered Conversations** - Powered by Google's Gemini 1.5 Flash model
- **Real-time Messaging** - Instant AI responses with typing indicators
- **Message History** - Complete conversation persistence per user

### 📱 Chat Management (ChatGPT-style)
- **Multiple Conversations** - Create and manage multiple chat sessions
- **Chat History Sidebar** - Easy navigation between conversations
- **Auto-Generated Titles** - Chat titles from first message
- **Delete Individual Chats** - Remove specific conversations with confirmation
- **Clear All Chats** - Bulk delete all conversations from user menu
- **Active Chat Highlighting** - Visual indication of current conversation

### 🎨 User Interface
- **Modern Dark Theme** - Beautiful purple gradient design
- **Responsive Design** - Works on desktop and mobile devices
- **Collapsible Sidebar** - Maximize chat area when needed
- **User Account Panel** - Profile management at bottom of sidebar
- **Smooth Animations** - Polished user experience

### 🛡️ Security
- **Protected API Endpoints** - All chat operations require authentication
- **User-Specific Data** - Chat history isolated per user account
- **Secure Token Handling** - Proper OAuth token validation

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Google Cloud Project with OAuth 2.0 credentials
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-chat-app-main
   ```

2. **Install dependencies**
   ```bash
   pip install flask flask-cors python-dotenv authlib requests google-generativeai
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   SECRET_KEY=your_secret_key
   ```

4. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:5500/authorize`
   - See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for detailed instructions

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Open your browser**
   Navigate to `http://localhost:5500`

## 📁 Project Structure

```
ai-chat-app-main/
├── app.py                 # Main Flask application
├── .env.example          # Environment variables template
├── .env                  # Your environment variables (not in git)
├── .gitignore           # Git ignore rules
├── GOOGLE_OAUTH_SETUP.md # OAuth setup guide
├── templates/
│   ├── index.html       # Main chat interface
│   └── signin.html      # Google sign-in page
└── static/
    ├── script.js        # Frontend JavaScript
    └── style.css        # Styling and animations
```

## 🔧 API Endpoints

### Authentication
- `GET /` - Main chat interface (redirects to sign-in if not authenticated)
- `GET /signin` - Sign-in page
- `GET /login` - Initiate Google OAuth flow
- `GET /authorize` - OAuth callback handler
- `GET /logout` - Sign out and clear session
- `GET /api/user` - Get current user info

### Chat Management
- `GET /api/chats` - List all user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/<chat_id>` - Get specific chat history
- `POST /api/chats/<chat_id>/message` - Send message to chat
- `DELETE /api/chats/<chat_id>` - Delete specific chat

## 🎯 Usage

### Starting a Conversation
1. Sign in with your Google account
2. A new chat is automatically created
3. Type your message and press Enter or click Send
4. The AI will respond using Google's Gemini model

### Managing Chats
- **New Chat**: Click the "New Chat" button in the sidebar
- **Switch Chats**: Click on any chat in the history sidebar
- **Delete Chat**: Hover over a chat and click the trash icon
- **Clear All**: Click your profile → "Clear All Chats"

### User Account
- View your profile info at the bottom of the sidebar
- Access account settings and sign out from the user menu

## 🔒 Security Features

- All API endpoints are protected with authentication decorators
- User sessions are managed server-side with Flask sessions
- Chat history is isolated per user account
- OAuth tokens are properly validated with time tolerance
- Sensitive data is excluded from version control

## 🛠️ Technologies Used

### Backend
- **Flask** - Python web framework
- **Authlib** - OAuth 2.0 client library
- **Google Generative AI** - Gemini API client
- **Flask-CORS** - Cross-origin resource sharing
- **python-dotenv** - Environment variable management

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **Font Awesome** - Icons and UI elements
- **Google Fonts** - Poppins font family
- **CSS3** - Modern styling with flexbox and animations

### Authentication & AI
- **Google OAuth 2.0** - Secure user authentication
- **Google Gemini 1.5 Flash** - AI conversation model
- **Session-based Auth** - Server-side session management

## 🌟 Features Comparison

| Feature | This App | ChatGPT |
|---------|----------|---------|
| Google Sign-In | ✅ | ❌ |
| Multiple Conversations | ✅ | ✅ |
| Delete Individual Chats | ✅ | ✅ |
| Clear All Chats | ✅ | ✅ |
| Real-time Responses | ✅ | ✅ |
| User Profile in Sidebar | ✅ | ✅ |
| Mobile Responsive | ✅ | ✅ |
| Dark Theme | ✅ | ✅ |

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Acknowledgments

- Google for the Gemini AI API and OAuth services
- Flask community for the excellent web framework
- Font Awesome for the beautiful icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Google OAuth Setup Guide](GOOGLE_OAUTH_SETUP.md)
2. Ensure all environment variables are set correctly
3. Verify your Google Cloud Console OAuth configuration
4. Open an issue on GitHub if problems persist

---

**Made with ❤️ using Flask and Google Gemini AI**
