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
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-1.5-flash"
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
        if 'user' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- AUTHENTICATION ROUTES ---
@app.route('/')
def home():
    """
    Serves the main index.html file from the 'templates' folder.
    """
    if 'user' not in session:
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

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('chats', None)
    return redirect('/signin')

@app.route('/api/user')
def get_user():
    if 'user' in session:
        return jsonify(session['user'])
    return jsonify({'error': 'Not authenticated'}), 401

def query_gemini_text(prompt: str, history=None) -> str:
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        chat = model.start_chat(history=history or [])
        response = chat.send_message(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "❌ Error: Could not get a response from the AI."


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
    data = request.get_json()
    user_message = data.get('message')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
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
    ai_reply = query_gemini_text(user_message, history)
    # Save to history
    chat["history"].append({"role": "user", "content": user_message})
    chat["history"].append({"role": "model", "content": ai_reply})
    # Optionally update title if first message
    if chat["title"] == "New Chat" and len(chat["history"]) == 2:
        chat["title"] = user_message[:30] + ("..." if len(user_message) > 30 else "")
    chats[chat_id] = chat
    session['chats'] = chats
    return jsonify({"reply": ai_reply})

if __name__ == '__main__':
    # You can now change this port to 5500 if you want
    app.run(debug=True, port=5500)