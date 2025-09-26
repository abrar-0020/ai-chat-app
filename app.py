# 👇 Add 'render_template' to your imports
from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv
from authlib.integrations.flask_client import OAuth
from functools import wraps
import json

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY not found in environment variables")
else:
    print(f"DEBUG: API Key loaded: {api_key[:10]}...")

genai.configure(api_key=api_key)

MODEL_NAME = "gemini-pro"
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "supersecretkey")  # Needed for session
CORS(app)

# OAuth setup
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    access_token_url='https://oauth2.googleapis.com/token',
    client_kwargs={
        'scope': 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
    }
)
# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session and not session.get('guest_mode', False):
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- AUTHENTICATION ROUTES ---
@app.route('/')
def home():
    """
    Serves the main index.html file from the 'templates' folder.
    """
    if 'user' not in session and not session.get('guest_mode', False):
        return render_template('signin.html')
    return render_template('index.html')

@app.route('/signin')
def signin():
    return render_template('signin.html')

@app.route('/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/authorize')
def authorize():
    try:
        # Get the access token without ID token validation
        token = google.authorize_access_token()
        
        # Manually get user info using the access token
        import requests
        headers = {'Authorization': f'Bearer {token["access_token"]}'}
        response = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', headers=headers)
        
        if response.status_code == 200:
            user_info = response.json()
            session['user'] = {
                'id': user_info.get('id'),
                'email': user_info['email'],
                'name': user_info['name'],
                'picture': user_info.get('picture', '')
            }
        else:
            raise Exception("Failed to get user info")
            
    except Exception as e:
        print(f"OAuth authorization error: {e}")
        # Redirect back to signin with error
        return redirect('/signin?error=auth_failed')
    
    return redirect('/')

@app.route('/guest')
def guest_mode():
    """Enable guest mode for users who don't want to sign in"""
    session['guest_mode'] = True
    session['user'] = {
        'id': 'guest',
        'email': 'guest@example.com',
        'name': 'Guest User',
        'picture': ''
    }
    return redirect('/')

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('chats', None)
    session.pop('guest_mode', None)
    return redirect('/signin')

@app.route('/api/user')
def get_user():
    if 'user' in session:
        user_data = session['user'].copy()
        user_data['is_guest'] = session.get('guest_mode', False)
        return jsonify(user_data)
    return jsonify({'error': 'Not authenticated'}), 401

def query_gemini_text(prompt: str, history=None) -> str:
    try:
        if not prompt or not prompt.strip():
            return "❌ Error: Empty message received."
        
        print(f"DEBUG: Using model: {MODEL_NAME}")
        print(f"DEBUG: Prompt length: {len(prompt)}")
        
        model = genai.GenerativeModel(MODEL_NAME)
        
        # Simple approach without chat history for now
        response = model.generate_content(prompt)
        result = response.text.strip() if response.text else "No response received"
        
        print(f"DEBUG: Response received: {result[:50]}...")
        return result
        
    except Exception as e:
        error_msg = str(e)
        print(f"Gemini API Error: {error_msg}")
        print(f"Prompt: {prompt[:100]}...")
        
        # Check for specific error types
        if "API_KEY" in error_msg.upper():
            return "❌ Error: Invalid API key. Please check your Gemini API key."
        elif "404" in error_msg:
            return "❌ Error: Model not found. The Gemini model may not be available."
        elif "403" in error_msg:
            return "❌ Error: Access denied. Please check your API key permissions."
        elif "QUOTA" in error_msg.upper():
            return "❌ Error: API quota exceeded. Please check your usage limits."
        else:
            return f"❌ Error: {error_msg}"


# --- Chat history endpoints ---
import uuid

def get_chats():
    return session.setdefault('chats', {})

@app.route('/api/chats', methods=['GET'])
@login_required
def list_chats():
    chats = get_chats()
    chat_list = [
        {"chat_id": cid, "title": chat["title"]} for cid, chat in chats.items()
    ]
    return jsonify(chat_list)

@app.route('/api/chats', methods=['POST'])
@login_required
def create_chat():
    chats = get_chats()
    chat_id = str(uuid.uuid4())
    chats[chat_id] = {"title": "New Chat", "history": []}
    session['chats'] = chats
    return jsonify({"chat_id": chat_id, "title": "New Chat"})

@app.route('/api/chats/<chat_id>', methods=['GET'])
@login_required
def get_chat(chat_id):
    chats = get_chats()
    chat = chats.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    return jsonify(chat)

@app.route('/api/chats/<chat_id>', methods=['DELETE'])
@login_required
def delete_chat(chat_id):
    chats = get_chats()
    if chat_id not in chats:
        return jsonify({"error": "Chat not found"}), 404
    
    del chats[chat_id]
    session['chats'] = chats
    return jsonify({"message": "Chat deleted successfully"})

@app.route('/api/chats/<chat_id>/message', methods=['POST'])
@login_required
def chat(chat_id):
    try:
        data = request.get_json()
        print(f"DEBUG: Received data: {data}")  # Debug log
        
        user_message = data.get('message', '')
        files = data.get('files', [])
        
        print(f"DEBUG: Message: {user_message[:100]}...")  # Debug log
        print(f"DEBUG: Files: {files}")  # Debug log
        
        # Check if we have either message or files
        if not user_message and not files:
            return jsonify({"error": "No message or files provided"}), 400
        
        chats = get_chats()
        chat = chats.get(chat_id)
        if not chat:
            return jsonify({"error": "Chat not found"}), 404
        
        # Build history for Gemini
        history = []
        for msg in chat["history"]:
            if msg["role"] == "user":
                history.append({"role": "user", "parts": [msg["content"]]})
            else:
                history.append({"role": "model", "parts": [msg["content"]]})
        
        # Use the full message (which may include file contents) for AI processing
        ai_reply = query_gemini_text(user_message, history)
        
        print(f"DEBUG: AI Reply: {ai_reply[:100]}...")  # Debug log
        
        # Save the original user message (without file contents) to history for display
        original_message = data.get('message', '') if 'files' not in data or not data['files'] else user_message.split('\n\nAttached files:')[0]
        
        # Save to history
        chat["history"].append({"role": "user", "content": original_message})
        chat["history"].append({"role": "model", "content": ai_reply})
        
        # Optionally update title if first message
        if chat["title"] == "New Chat" and len(chat["history"]) == 2:
            title_text = original_message or "File upload"
            chat["title"] = title_text[:30] + ("..." if len(title_text) > 30 else "")
        
        chats[chat_id] = chat
        session['chats'] = chats
        return jsonify({"reply": ai_reply})
        
    except Exception as e:
        print(f"ERROR in chat endpoint: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# Test endpoint for API debugging
@app.route('/api/test-gemini')
def test_gemini():
    try:
        test_response = query_gemini_text("Say hello!")
        return jsonify({"status": "success", "response": test_response})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)})

# For Vercel deployment - export the app object
# Vercel will use this as the WSGI application

if __name__ == '__main__':
    # Local development only
    app.run(debug=True, port=5500)