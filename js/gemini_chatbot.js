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
                this.chatContainer.style.display = 'none'; // Add this line
                this.toggleBtn.style.display = 'block';
            }, 300);
        } else {
            this.chatContainer.style.display = 'block';
            setTimeout(() => {  // Add small delay to ensure display:block is applied first
                this.chatContainer.classList.add('active');
                this.toggleBtn.style.display = 'none';
            }, 10);
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
                            text: `You are a professional fitness coach. Answer questions related to fitness, exercise, and nutrition.
    
                            Rules:
                            1. If the message is ONLY a greeting (like "hi", "hello", "hey"), respond with: "Hello, I'm your fitness assistant. What can I help you today?"
                            2. If the message is a fitness/health question, provide a helpful, detailed response about that specific topic.
                            3. If the message is unrelated to fitness/health, respond with: "I specialize only in fitness and health-related topics. How can I assist you with your fitness goals?"
                            
                            Important formatting rules:
                            - Do not use asterisks (*) or special characters
                            - Use clear paragraphs with line breaks between sections
                            - Use simple headings followed by a colon or period
                            - Keep responses well-structured but informal
                            
                            For weight loss questions, structure the response with these sections:
                            
                            Caloric Planning:
                            [Provide specific advice]
                            
                            Exercise Plan:
                            [List specific activities]
                            
                            Nutrition Guidelines:
                            [Provide eating recommendations]
                            
                            Healthy Habits:
                            [List sustainable practices]
                            
                            Current query: ${message}`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No valid responses from API');
            }

            // Clean up any remaining asterisks that might come through
            let response_text = data.candidates[0].content.parts[0].text;
            response_text = response_text.replace(/\*/g, '');

            return response_text;
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