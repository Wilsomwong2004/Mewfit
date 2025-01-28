class FitnessChatbot {
    constructor() {
        this.apiKey = 'AIzaSyASC--w_GL2ve7fSqpKBYG4YUSffkek3AM';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.chatHistory = [];
        this.initChatbot();
    }

    initChatbot() {
        this.toggleBtn = document.querySelector('.chatbot-toggle');
        this.chatContainer = document.querySelector('.chatbot-container');
        this.messagesContainer = document.querySelector('.chatbot-messages');
        this.inputField = document.querySelector('.chatbot-input input');
        this.sendBtn = document.querySelector('.send-btn');
        this.closeBtn = document.querySelector('.close-chat');

        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
    }

    toggleChat() {
        if (this.chatContainer.classList.contains('active')) {
            this.chatContainer.classList.add('closing');
            this.chatContainer.classList.remove('active');

            setTimeout(() => {
                this.chatContainer.classList.remove('closing');
                this.toggleBtn.style.display = 'block';
            }, 300);
        } else {
            this.chatContainer.style.display = 'block';
            this.chatContainer.classList.add('active');
            this.toggleBtn.style.display = 'none';
        }
    }

    async handleSend() {
        const message = this.inputField.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.inputField.value = '';

        try {
            const response = await this.getBotResponse(message);
            await this.typeMessage(response, 'bot');
        } catch (error) {
            await this.typeMessage("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
        }
    }

    async typeMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        this.messagesContainer.appendChild(messageDiv);

        const words = content.split(/\s+/);
        let currentText = '';

        for (let word of words) {
            currentText += word + ' ';
            messageDiv.textContent = currentText.trim();
            await new Promise(resolve => setTimeout(resolve, 50)); // Adjust typing speed here
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }
    formatMessage(text) {
        // Replace line breaks with proper spacing
        return text.replace(/\s*\*\s*/g, '\n').trim();
    }

    async getBotResponse(message) {
        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a professional fitness coach. Only answer questions related to fitness, exercise, nutrition, and health.
                            IF asked about Hi or Hello or related to greetings, respond with "Hello, I'm your fitness assistants. What can i help you today?"
                            If asked about other topics, respond with "I specialize only in fitness and health-related topics. How can I assist you with your fitness goals?"
                            Current query: ${message}`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No valid responses from API');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('API Error:', error);
            return "Sorry, I'm having trouble processing your request. Please try again.";
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = content;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FitnessChatbot();
});