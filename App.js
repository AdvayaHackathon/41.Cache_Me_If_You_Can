document.addEventListener('DOMContentLoaded', () => {
    const chatOutput = document.getElementById('chat-output');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    async function getBotResponse(message) {
        try {
            const response = await fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            return { response: "Sorry, the server is not responding." };
        }
    }

    function addMessage(text, isUser) {
        const msg = document.createElement('div');
        msg.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        msg.textContent = text;
        chatOutput.appendChild(msg);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }

    async function handleSend() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = '';

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot-message';
        typingIndicator.textContent = '...';
        typingIndicator.id = 'typing-indicator';
        chatOutput.appendChild(typingIndicator);

        try {
            const { response } = await getBotResponse(message);
            document.getElementById('typing-indicator')?.remove();
            addMessage(response, false);
        } catch (err) {
            document.getElementById('typing-indicator')?.remove();
            addMessage("Oops! Something went wrong.", false);
        }
    }

    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    addMessage("Hello! I'm your AI Journal companion. How are you feeling today?", false);
});
