document.addEventListener('DOMContentLoaded', () => {
    // Get all DOM elements
    const container = document.querySelector('.container');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatList = document.getElementById('chat-list');
    const userInfo = document.getElementById('user-info');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userMenu = document.getElementById('user-menu');
    
    // Chat management variables
    let currentChatId = null;
    let chats = {};
    let user = null;

    const addMessage = (content, sender) => {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message', `${sender}-message`);

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');
        
        const text = document.createElement('p');
        text.innerHTML = content;

        const timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageContentDiv.appendChild(text);
        messageContentDiv.appendChild(timestamp);

        const icon = document.createElement('i');
        icon.classList.add('fa-solid', sender === 'user' ? 'fa-user' : 'fa-robot', 'message-icon');
        
        if (sender === 'user') {
            messageWrapper.appendChild(messageContentDiv);
            messageWrapper.appendChild(icon);
        } else {
            messageWrapper.appendChild(icon);
            messageWrapper.appendChild(messageContentDiv);
        }

        chatMessages.appendChild(messageWrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // User authentication functions
    const loadUserInfo = async () => {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                user = await response.json();
                updateUserDisplay();
            } else {
                // User not authenticated, redirect to signin
                window.location.href = '/signin';
            }
        } catch (error) {
            console.error('Error loading user info:', error);
            window.location.href = '/signin';
        }
    };

    const updateUserDisplay = () => {
        if (!user) return;
        
        userName.textContent = user.name;
        userEmail.textContent = user.email;
        
        if (user.picture) {
            userAvatar.innerHTML = `<img src="${user.picture}" alt="${user.name}">`;
        } else {
            // Show initials if no picture
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.textContent = initials;
        }
    };

    const showSettings = () => {
        alert('Settings panel coming soon!');
        toggleUserMenu();
    };

    window.clearAllChats = async () => {
        const chatCount = Object.keys(chats).length;
        if (chatCount === 0) {
            alert('No chats to clear!');
            toggleUserMenu();
            return;
        }
        
        if (confirm(`Are you sure you want to delete all ${chatCount} chat${chatCount > 1 ? 's' : ''}? This action cannot be undone.`)) {
            try {
                // Delete all chats one by one
                const deletePromises = Object.keys(chats).map(chatId => 
                    fetch(`/api/chats/${chatId}`, { method: 'DELETE' })
                );
                
                await Promise.all(deletePromises);
                
                // Clear local state
                chats = {};
                currentChatId = null;
                chatMessages.innerHTML = '';
                
                // Create a new chat automatically
                await createNewChat();
                
                // Reload chat history
                await loadChatHistory();
                
                toggleUserMenu();
            } catch (error) {
                console.error('Error clearing all chats:', error);
                alert('Failed to clear all chats. Please try again.');
            }
        } else {
            toggleUserMenu();
        }
    };

    const toggleUserMenu = () => {
        userMenu.classList.toggle('show');
    };

    // Close user menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!userInfo.contains(event.target)) {
            userMenu.classList.remove('show');
        }
    });

    // Chat history functions
    const loadChatHistory = async () => {
        try {
            const response = await fetch('/api/chats');
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/signin';
                    return;
                }
                throw new Error('Failed to load chat history');
            }
            
            const chatHistory = await response.json();
            
            chatList.innerHTML = '';
            chatHistory.forEach(chat => {
                createChatItem(chat);
                chats[chat.chat_id] = chat;
            });
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const createChatItem = (chat) => {
        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-item');
        chatItem.onclick = (e) => {
            // Don't trigger if clicking on delete button
            if (!e.target.classList.contains('chat-delete-btn') && !e.target.closest('.chat-delete-btn')) {
                loadChat(chat.chat_id);
            }
        };

        chatItem.innerHTML = `
            <div class="chat-item-content">${chat.title}</div>
            <div class="chat-item-actions">
                <button class="chat-delete-btn" onclick="deleteChatWithConfirmation('${chat.chat_id}')" title="Delete chat">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        chatList.appendChild(chatItem);
        return chatItem;
    };

    const createNewChat = async () => {
        try {
            const response = await fetch('/api/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const newChat = await response.json();
            
            currentChatId = newChat.chat_id;
            chats[newChat.chat_id] = { title: newChat.title, history: [] };
            
            // Add to UI
            const chatItem = document.createElement('button');
            chatItem.classList.add('chat-item', 'active');
            chatItem.textContent = newChat.title;
            chatItem.onclick = () => loadChat(newChat.chat_id);
            chatList.insertBefore(chatItem, chatList.firstChild);
            
            // Clear active class from other chats
            document.querySelectorAll('.chat-item').forEach(item => {
                if (item !== chatItem) item.classList.remove('active');
            });
            
            // Clear messages and show welcome
            chatMessages.innerHTML = '';
            addMessage("Hello! I'm your AI assistant. How can I help you today?", 'ai');
            
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    };

    const loadChat = async (chatId) => {
        try {
            const response = await fetch(`/api/chats/${chatId}`);
            const chat = await response.json();
            
            currentChatId = chatId;
            chatMessages.innerHTML = '';
            
            // Load messages
            chat.history.forEach(msg => {
                addMessage(msg.content, msg.role === 'user' ? 'user' : 'ai');
            });
            
            if (chat.history.length === 0) {
                addMessage("Hello! I'm your AI assistant. How can I help you today?", 'ai');
            }
            
            // Update active chat in sidebar
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.remove('active');
                if (item.textContent === chat.title) {
                    item.classList.add('active');
                }
            });
            
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    };

    window.deleteChatWithConfirmation = async (chatId) => {
        const chat = chats[chatId];
        const chatTitle = chat ? chat.title : 'this chat';
        
        if (confirm(`Are you sure you want to delete "${chatTitle}"? This action cannot be undone.`)) {
            try {
                const response = await fetch(`/api/chats/${chatId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    // Remove from local chats object
                    delete chats[chatId];
                    
                    // If this was the current chat, create a new one
                    if (currentChatId === chatId) {
                        currentChatId = null;
                        chatMessages.innerHTML = '';
                        
                        // Create a new chat automatically
                        await createNewChat();
                    }
                    
                    // Reload chat history to update the sidebar
                    await loadChatHistory();
                } else {
                    alert('Failed to delete chat. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting chat:', error);
                alert('Failed to delete chat. Please try again.');
            }
        }
    };

    const handleSendMessage = async () => {
        const messageText = messageInput.value.trim();
        if (!messageText || !currentChatId) return;

        addMessage(messageText, 'user');
        messageInput.value = '';

        addMessage("💭 Thinking...", 'ai');
        const thinkingMessage = chatMessages.lastChild;

        try {
            const response = await fetch(`/api/chats/${currentChatId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });

            if (!response.ok) { throw new Error('Network response was not ok.'); }

            const data = await response.json();
            const aiReply = data.reply.replace(/\n/g, '<br>');

            const aiMessageContent = thinkingMessage.querySelector('.message-content p');
            aiMessageContent.innerHTML = aiReply;

            // Reload chat history to update titles
            loadChatHistory();

        } catch (error) {
            console.error('Error:', error);
            const aiMessageContent = thinkingMessage.querySelector('.message-content p');
            aiMessageContent.textContent = "Sorry, I couldn't connect to the server. Please try again.";
        }
    };

    // Event listeners
    menuToggleBtn.addEventListener('click', () => {
        container.classList.toggle('sidebar-closed');
    });

    sendBtn.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keydown', (event) => { 
        if (event.key === 'Enter') { 
            handleSendMessage(); 
        } 
    });
    newChatBtn.addEventListener('click', createNewChat);
    userMenuBtn.addEventListener('click', toggleUserMenu);

    // Initialize app
    const initializeApp = async () => {
        // First load user info to ensure authentication
        await loadUserInfo();
        
        // Then load chat history
        await loadChatHistory();
        
        // If no chats exist or no current chat, create a new one
        if (Object.keys(chats).length === 0 || !currentChatId) {
            await createNewChat();
        } else {
            // Load the first chat
            const firstChatId = Object.keys(chats)[0];
            await loadChat(firstChatId);
        }
    };

    // Start the app
    initializeApp();
});