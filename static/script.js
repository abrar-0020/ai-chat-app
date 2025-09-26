document.addEventListener('DOMContentLoaded', () => {
    // Get all DOM elements
    const container = document.querySelector('.container');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const fileUploadBtn = document.getElementById('file-upload-btn');
    const fileInput = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');
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
    let selectedFiles = [];
    
    // File handling functions
    const handleFileUpload = () => {
        fileInput.click();
    };
    
    const handleFileSelection = (event) => {
        const files = Array.from(event.target.files);
        selectedFiles = [...selectedFiles, ...files];
        updateFilePreview();
        // Clear the input so the same file can be selected again
        fileInput.value = '';
    };
    
    const removeFile = (index) => {
        selectedFiles.splice(index, 1);
        updateFilePreview();
    };
    
    const updateFilePreview = () => {
        filePreview.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'file-preview-item';
            
            // Check if file is an image
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.onload = () => URL.revokeObjectURL(img.src);
                previewItem.appendChild(img);
            } else {
                // Show file icon based on type
                const fileIcon = document.createElement('div');
                fileIcon.className = 'file-icon';
                const extension = file.name.split('.').pop().toLowerCase();
                
                let iconClass = 'fa-file';
                if (['pdf'].includes(extension)) iconClass = 'fa-file-pdf';
                else if (['doc', 'docx'].includes(extension)) iconClass = 'fa-file-word';
                else if (['txt'].includes(extension)) iconClass = 'fa-file-text';
                else if (['json'].includes(extension)) iconClass = 'fa-file-code';
                else if (['csv'].includes(extension)) iconClass = 'fa-file-csv';
                
                fileIcon.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
                previewItem.appendChild(fileIcon);
            }
            
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            fileName.title = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file';
            removeBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
            removeBtn.onclick = () => removeFile(index);
            
            previewItem.appendChild(fileName);
            previewItem.appendChild(removeBtn);
            filePreview.appendChild(previewItem);
        });
    };
    
    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };
    
    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const addMessage = (content, sender, files = []) => {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message', `${sender}-message`);

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');
        
        // Add file attachments if any
        if (files && files.length > 0) {
            const attachments = document.createElement('div');
            attachments.className = 'message-attachments';
            
            files.forEach(file => {
                const attachment = document.createElement('div');
                attachment.className = 'attachment-item';
                
                if (file.type && file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = file.data || URL.createObjectURL(file);
                    img.alt = file.name;
                    img.style.maxWidth = '200px';
                    img.style.maxHeight = '150px';
                    img.style.borderRadius = '8px';
                    attachment.appendChild(img);
                } else {
                    attachment.innerHTML = `
                        <i class="fa-solid fa-file"></i>
                        <span>${file.name}</span>
                    `;
                    attachment.style.padding = '0.5rem';
                    attachment.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    attachment.style.borderRadius = '8px';
                    attachment.style.display = 'flex';
                    attachment.style.alignItems = 'center';
                    attachment.style.gap = '0.5rem';
                    attachment.style.marginBottom = '0.5rem';
                }
                
                attachments.appendChild(attachment);
            });
            
            messageContentDiv.appendChild(attachments);
        }
        
        if (content.trim()) {
            const text = document.createElement('p');
            text.innerHTML = content;
            messageContentDiv.appendChild(text);
        }

        const timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
        
        if (user.is_guest) {
            userEmail.textContent = 'Guest Mode - Limited Features';
            userAvatar.innerHTML = `<i class="fa-solid fa-user-secret"></i>`;
            updateUserMenu(true); // Guest menu
        } else {
            userEmail.textContent = user.email;
            if (user.picture) {
                userAvatar.innerHTML = `<img src="${user.picture}" alt="${user.name}">`;
            } else {
                // Show initials if no picture
                const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
                userAvatar.textContent = initials;
            }
            updateUserMenu(false); // Regular user menu
        }
    };

    const updateUserMenu = (isGuest) => {
        const userMenu = document.getElementById('user-menu');
        
        if (isGuest) {
            userMenu.innerHTML = `
                <button class="user-menu-item" onclick="signInWithGoogle()">
                    <i class="fa-brands fa-google"></i>
                    Sign in with Google
                </button>
                <button class="user-menu-item" onclick="showSettings()">
                    <i class="fa-solid fa-cog"></i>
                    Settings
                </button>
                <button class="user-menu-item" onclick="clearAllChats()">
                    <i class="fa-solid fa-trash-can"></i>
                    Clear All Chats
                </button>
                <button class="user-menu-item" onclick="window.location.href='/logout'">
                    <i class="fa-solid fa-sign-out-alt"></i>
                    Exit Guest Mode
                </button>
            `;
        } else {
            userMenu.innerHTML = `
                <button class="user-menu-item" onclick="window.open('https://myaccount.google.com', '_blank')">
                    <i class="fa-solid fa-user"></i>
                    Manage Account
                </button>
                <button class="user-menu-item" onclick="showSettings()">
                    <i class="fa-solid fa-cog"></i>
                    Settings
                </button>
                <button class="user-menu-item" onclick="clearAllChats()">
                    <i class="fa-solid fa-trash-can"></i>
                    Clear All Chats
                </button>
                <button class="user-menu-item" onclick="window.location.href='/logout'">
                    <i class="fa-solid fa-sign-out-alt"></i>
                    Sign Out
                </button>
            `;
        }
    };

    const signInWithGoogle = () => {
        window.location.href = '/login';
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
        if (!messageText && selectedFiles.length === 0) return;
        if (!currentChatId) return;

        // Process files
        let processedFiles = [];
        let fileContents = [];
        
        if (selectedFiles.length > 0) {
            for (const file of selectedFiles) {
                try {
                    if (file.type.startsWith('image/')) {
                        const dataUrl = await readFileAsDataURL(file);
                        processedFiles.push({
                            name: file.name,
                            type: file.type,
                            data: dataUrl
                        });
                        fileContents.push(`[Image: ${file.name}]`);
                    } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.csv')) {
                        const content = await readFileAsText(file);
                        processedFiles.push({
                            name: file.name,
                            type: file.type,
                            content: content
                        });
                        fileContents.push(`[File: ${file.name}]\n${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}`);
                    } else {
                        processedFiles.push({
                            name: file.name,
                            type: file.type
                        });
                        fileContents.push(`[File: ${file.name} - ${file.type}]`);
                    }
                } catch (error) {
                    console.error('Error processing file:', file.name, error);
                    fileContents.push(`[Error reading file: ${file.name}]`);
                }
            }
        }

        // Combine message text with file contents for AI processing
        let fullMessage = messageText;
        if (fileContents.length > 0) {
            fullMessage = `${messageText}\n\nAttached files:\n${fileContents.join('\n\n')}`;
        }

        // Add message to chat UI
        addMessage(messageText, 'user', processedFiles);
        messageInput.value = '';
        selectedFiles = [];
        updateFilePreview();

        addMessage("💭 Thinking...", 'ai');
        const thinkingMessage = chatMessages.lastChild;

        try {
            const response = await fetch(`/api/chats/${currentChatId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: fullMessage,
                    files: processedFiles.map(f => ({ name: f.name, type: f.type }))
                }),
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
    fileUploadBtn.addEventListener('click', handleFileUpload);
    fileInput.addEventListener('change', handleFileSelection);

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