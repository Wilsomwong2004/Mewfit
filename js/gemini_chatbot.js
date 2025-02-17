class FitnessChatbot {
    constructor() {
        this.apiKey = 'AIzaSyASC--w_GL2ve7fSqpKBYG4YUSffkek3AM';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.chatHistory = [];
        this.userContext = {};
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

        // NEW: Conversation analysis
        this.analyzeMessage(message);

        // NEW: Add human-like typing variation
        const typingDelay = Math.random() * 300 + 100; // 100-400ms

        // UPDATED: Enhanced error handling
        try {
            const response = await this.getBotResponse(message);
            await this.typeMessage(response, 'bot', typingDelay);

            if (this.chatHistory.length % 3 === 0) {
                await this.suggestFollowUp();
            }
        } catch (error) {
            await this.typeMessage("Hmm, my circuits are feeling tired 🥱. Could you rephrase that?", 'bot', 50);
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


    isGreeting(message) {
        const greetings = [
            'hi', 'hello', 'hey', 'good morning', 'good afternoon',
            'good evening', 'hi there', 'greetings', 'sup', 'howdy'
        ];
        const cleanMsg = message.toLowerCase().replace(/[^a-z ]/g, '');
        return greetings.some(g => cleanMsg === g);
    }

    formatContextPrompt() {
        let context = [];
        if (this.userContext.goal) context.push(`- User's goal: ${this.userContext.goal}`);
        if (this.userContext.injuries) context.push(`- Injuries: ${this.userContext.injuries}`);
        return context.join('\n') || '- No known context yet';
    }

    // NEW: Conversation analysis
    analyzeMessage(message) {
        // Detect goals/intents
        if (/(lose weight|slim down)/i.test(message)) {
            this.userContext.goal = 'weight loss';
        }
        if (/(gain muscle|bulk up)/i.test(message)) {
            this.userContext.goal = 'muscle gain';
        }

        // Detect personal mentions
        const nameMatch = message.match(/my name is (\w+)/i);
        if (nameMatch) this.userContext.name = nameMatch[1];
    }

    async suggestFollowUp() {
        const followUps = [
            "Would you like me to elaborate on any of this?",
            "Need clarification on anything I mentioned? 😊",
            "Want me to create a sample routine for you?",
        ];
        const question = followUps[Math.floor(Math.random() * followUps.length)];
        await this.typeMessage(question, 'bot');
    }

    // UPDATED: Enhanced typing simulation
    async typeMessage(content, sender, baseDelay = 50) { // Ensure default parameter is set
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        this.messagesContainer.appendChild(messageDiv);

        const words = content.split(/\s+/);
        let currentText = '';

        // FIX 3: Add missing words declaration
        for (let word of words) {
            const delay = baseDelay + (Math.random() * 50);
            currentText += word + ' ';
            messageDiv.textContent = currentText.trim();
            await new Promise(resolve => setTimeout(resolve, delay));
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }

        await new Promise(resolve => setTimeout(resolve, 300));
    }

    formatMessage(text) {
        // Replace line breaks with proper spacing
        return text.replace(/\s*\*\s*/g, '\n').trim();
    }

    async getBotResponse(message) {
        try {
            const workoutData = window.workouts || [];
            const dietData = window.diets || [];

            // Modified data access with proper error handling
            const workoutTypes = [...new Set(workoutData.flatMap(w => w.type || []))].filter(Boolean).join(', ') || 'General Fitness';
            const dietTypes = [...new Set(dietData.flatMap(d => d.type || []))].filter(Boolean).join(', ') || 'Balanced Nutrition';

            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Act as a human-like fitness expert. Follow these rules:
                        
                                1. RESPONSE POLICY:
                                - Only answer fitness/diet/nutrition questions
                                - For other topics: "I specialize in fitness/health. How can I assist?"
                                - Never mention celebrities or unrelated figures

                                2. DATA INTEGRATION:
                                Available Workout Types: ${workoutTypes}
                                Available Diet Types: ${dietTypes}

                                3. RECOMMENDATION ENGINE:
                                ${this.generateDataPrompt(message, workoutData, dietData)}

                                4. RESPONSE FORMAT:
                                - Use workout/diet data from app
                                - Suggest specific routines from these categories:
                                Beginner: ${workoutData.filter(w => w?.level === 'Beginner').length} options
                                Intermediate: ${workoutData.filter(w => w?.level === 'Intermediate').length} options
                                Advanced: ${workoutData.filter(w => w?.level === 'Advanced').length} options

                                5. USER CONTEXT:
                                ${this.chatHistory.slice(-3).map(m => `${m.role}: ${m.text}`).join('\n')}

                                6. PERSONALITY TRAITS:
                                - Show empathy ("I understand how challenging...")
                                - Add motivational phrases ("You've got this!")

                                7. CONTEXT HANDLING:
                                ${this.formatContextPrompt()}
                                
                                8. RESPONSE GUIDELINES:
                                - Ask follow-up questions after 3 exchanges
                                - Admit uncertainty when needed ("Great question! While I'm not a doctor...")
                                - Use analogies ("Building muscle is like saving money...")

                                9.SPECIAL CASE HANDLING:
                                - If user requests specific workout type (like cardio):
                                1. Acknowledge the request positively
                                2. List 3 matching workouts with duration/calories
                                3. Add follow-up question

                                Example cardio response:
                                "Great choice! Cardio workouts boost endurance and heart health. 
                                Here are our top cardio routines:
                                - 10 Minute Cardio (10 mins, 150 kcal) - Quick energy boost
                                - No Joke Cardio (30 mins, 350 kcal) - High-intensity challenge
                                - Quick Cardio Starter (10 mins, 80 kcal) - Perfect for beginners
                                
                                Would you like detailed instructions for any of these?"

                            User Query: ${message}
                            
                            Respond conversationally while maintaining expertise:`
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

    generateDataPrompt(message, workouts, diets) {
        let prompt = '';
        const lowerMessage = message.toLowerCase();

        // Workout recommendations
        if (/workout|exercise|training/i.test(message)) {
            const levels = ['beginner', 'intermediate', 'advanced'];
            const matchedLevel = levels.find(l => lowerMessage.includes(l)) || 'beginner';

            prompt += `Recommend from ${matchedLevel} workouts:\n${workouts.filter(w => w?.level?.toLowerCase() === matchedLevel)
                .slice(0, 3)
                .map(w => `- ${w.title} (${w.duration}, ${w.calories})`)
                .join('\n') || 'No workout data available'
                }`;
        }

        // Diet recommendations
        if (/diet|nutrition|meal/i.test(message)) {
            const dietTypes = ['vegetarian', 'vegan', 'meat'];
            const matchedType = dietTypes.find(t => lowerMessage.includes(t)) || 'balanced';

            prompt += `Suggest ${matchedType} diets:\n${diets.filter(d => d?.type?.includes(matchedType))
                .slice(0, 3)
                .map(d => `- ${d.title} (${d.duration}, ${d.calories})`)
                .join('\n') || 'No diet data available'
                }`;
        }

        return prompt;
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