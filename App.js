document.addEventListener('DOMContentLoaded', () => {
    const chatOutput = document.getElementById('chat-output');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // Function to call your backend API
    async function getBotResponse(message) {
        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching from API:', error);
            return { 
                response: "Sorry, I couldn't connect to the server. Please try again later."
            };
        }
    }

    // Add message to chat UI
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = text;
        chatOutput.appendChild(messageDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }

    // Handle sending messages
    async function handleSend() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = '';
        userInput.focus();

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot-message';
        typingIndicator.textContent = '...';
        typingIndicator.id = 'typing-indicator';
        chatOutput.appendChild(typingIndicator);
        chatOutput.scrollTop = chatOutput.scrollHeight;

        try {
            const { response } = await getBotResponse(message);
            // Remove typing indicator
            document.getElementById('typing-indicator')?.remove();
            addMessage(response, false);
        } catch (error) {
            document.getElementById('typing-indicator')?.remove();
            addMessage("Sorry, I encountered an error. Please try again.", false);
            console.error('Error:', error);
        }
    }

    // Event listeners
    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Initial greeting
    addMessage("Hello! I'm your AI Journal companion. How are you feeling today?", false);
});