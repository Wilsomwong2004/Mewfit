class FitnessChatbot {
    constructor() {
        this.apiKey = 'AIzaSyASC--w_GL2ve7fSqpKBYG4YUSffkek3AM';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.chatHistory = [];
        this.userContext = {};
        this.userData = null; // Will store user data from database
        this.allWorkouts = [];
        this.allDiets = [];
        this.userWorkoutHistory = [];
        this.userDietHistory = [];
        this.userCustomDiets = [];
        this.initChatbot();
        this.fetchUserData(); // Fetch user data when chatbot loads
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

    async fetchUserData() {
        try {
            // Fetch user profile data
            const userResponse = await fetch('get_user_data.php');
            const userData = await userResponse.json();

            if (userData.error) {
                console.log('User data error:', userData.error);
                return;
            }

            this.userData = userData;

            // Pre-populate user context with database information
            if (userData.member) {
                this.userContext.name = userData.member.username;
                this.userContext.goal = userData.member.fitness_goal;
                this.userContext.weight = userData.member.weight;
                this.userContext.targetWeight = userData.member.target_weight;
                this.userContext.level = userData.member.level;
                this.userContext.age = userData.member.age;
                this.userContext.gender = userData.member.gender;

                // Add performance data if available
                if (userData.performance) {
                    this.userContext.currentWeight = userData.performance.current_weight;
                    this.userContext.workoutCount = userData.performance.workout_history_count;
                    this.userContext.dietCount = userData.performance.diet_history_count;
                }

                // Store workout and diet history
                this.userWorkoutHistory = userData.workout_history || [];
                this.userDietHistory = userData.diet_history || [];
                this.userCustomDiets = userData.custom_diets || [];
                this.userNutrition = userData.nutrition || [];

                // Fetch all workouts and diets for recommendations
                await this.fetchWorkoutsAndDiets();

                console.log('User context initialized:', this.userContext);

                // Update the initial message to personalize if user data is available
                if (this.userContext.name) {
                    this.addMessage(`Welcome back, ${this.userContext.name}! How can I help with your ${this.userContext.goal} journey today?`, 'bot');
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    async fetchWorkoutsAndDiets() {
        try {
            // Fetch all workouts and diets for recommendations
            const response = await fetch('get_all_workouts_diets.php');
            const data = await response.json();

            if (!data.error) {
                this.allWorkouts = data.workouts || [];
                this.allDiets = data.diets || [];
            }
        } catch (error) {
            console.error('Error fetching workouts and diets:', error);
        }
    }

    formatWorkoutDietData() {
        // Format workout data
        let workoutTypes = this.allWorkouts.length > 0
            ? [...new Set(this.allWorkouts.map(w => w.workout_type))].join(', ')
            : 'Cardio, Strength, Flexibility, HIIT';

        let difficultyLevels = this.allWorkouts.length > 0
            ? [...new Set(this.allWorkouts.map(w => w.difficulty))].join(', ')
            : 'Beginner, Intermediate, Advanced';

        // Format diet data
        let dietTypes = this.allDiets.length > 0
            ? [...new Set(this.allDiets.map(d => d.diet_type))].join(', ')
            : 'Balanced, Vegetarian, Vegan, Keto, Low-carb';

        // Format user history
        let recentWorkouts = this.userWorkoutHistory.length > 0
            ? this.userWorkoutHistory.slice(0, 5).map(w =>
                `${w.workout_name} (${w.date})`
            ).join(', ')
            : 'No recent workouts';

        let recentDiets = this.userDietHistory.length > 0
            ? this.userDietHistory.slice(0, 5).map(d =>
                `${d.diet_name} (${d.date})`
            ).join(', ')
            : 'No recent diets';

        return {
            workoutTypes,
            difficultyLevels,
            dietTypes,
            recentWorkouts,
            recentDiets
        };
    }

    // Update the formatContextPrompt method to include more user data
    formatContextPrompt() {
        let context = [];
        if (this.userContext.name) context.push(`- User's name: ${this.userContext.name}`);
        if (this.userContext.goal) context.push(`- User's goal: ${this.userContext.goal}`);
        if (this.userContext.level) context.push(`- User's fitness level: ${this.userContext.level}`);
        if (this.userContext.age) context.push(`- User's age: ${this.userContext.age}`);
        if (this.userContext.gender) context.push(`- User's gender: ${this.userContext.gender}`);
        if (this.userContext.weight) context.push(`- Starting weight: ${this.userContext.weight} kg`);
        if (this.userContext.currentWeight) context.push(`- Current weight: ${this.userContext.currentWeight} kg`);
        if (this.userContext.targetWeight) context.push(`- Target weight: ${this.userContext.targetWeight} kg`);
        if (this.userContext.workoutCount) context.push(`- Completed workouts: ${this.userContext.workoutCount}`);
        if (this.userContext.injuries) context.push(`- Injuries: ${this.userContext.injuries}`);
        return context.join('\n') || '- No known context yet';
    }

    async getBotResponse(message) {
        try {
            const workoutDietData = this.formatWorkoutDietData();

            // Modified data access with proper error handling
            const workoutTypes = workoutDietData.workoutTypes || 'General Fitness';
            const dietTypes = workoutDietData.dietTypes || 'Balanced Nutrition';
            const recentWorkouts = workoutDietData.recentWorkouts || 'No recent workouts';
            const recentDiets = workoutDietData.recentDiets || 'No recent diets';

            // Add user-specific information to the prompt
            let userSpecificInfo = '';
            if (this.userData && this.userData.member) {
                userSpecificInfo = `
                Current User:
                - Username: ${this.userData.member.username}
                - Age: ${this.userData.member.age}
                - Gender: ${this.userData.member.gender}
                - Fitness Goal: ${this.userData.member.fitness_goal}
                - Current Weight: ${this.userData.performance?.current_weight || this.userData.member.weight} kg
                - Target Weight: ${this.userData.member.target_weight} kg
                - Height: ${this.userData.member.height} cm
                - Level: ${this.userData.member.level}
                - Workout History Count: ${this.userData.performance?.workout_history_count || 'Unknown'}
                - Diet History Count: ${this.userData.performance?.diet_history_count || 'Unknown'}
                - Recent Workouts: ${recentWorkouts}
                - Recent Diets: ${recentDiets}
                `;

                // Add nutrition data if available
                if (this.userData.nutrition && this.userData.nutrition.length > 0) {
                    userSpecificInfo += `
                    - Recent Nutrition (${this.userData.nutrition[0].date}):
                      * Calories: ${this.userData.nutrition[0].calories_intake}
                      * Protein: ${this.userData.nutrition[0].protein}g
                      * Carbs: ${this.userData.nutrition[0].carbs}g
                      * Fats: ${this.userData.nutrition[0].fats}g
                      * Water: ${this.userData.nutrition[0].water}ml
                    `;
                }
            }

            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Act as a human-like fitness expert for the MewFit application. Follow these rules:
                        
                                1. RESPONSE POLICY:
                                - Only answer fitness/diet/nutrition questions
                                - For other topics: "I specialize in fitness/health. How can I assist?"
                                - Never mention celebrities or unrelated figures
                                - Only provide data about the currently logged-in member, never about other members
    
                                2. DATA INTEGRATION:
                                Available Workout Types: ${workoutTypes}
                                Available Diet Types: ${dietTypes}
                                ${userSpecificInfo}
    
                                3. RECOMMENDATION ENGINE:
                                ${this.generateDataPrompt(message)}
    
                                4. RESPONSE FORMAT:
                                - Use workout/diet data from the app
                                - Suggest specific routines from these categories:
                                Beginner: suitable for new members
                                Intermediate: for members with some experience
                                Advanced: for experienced members
                                - When the member asks about their workout or diet history, provide information from their personal history data
                                - When the member asks about their progress, reference their current weight vs. target weight
    
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
                                - If the member asks about another member's data, politely explain you can only provide information about the currently logged-in member
    
                                9. SPECIAL CASE HANDLING:
                                - If member requests specific workout type (like cardio):
                                1. Acknowledge the request positively
                                2. List 3 matching workouts with duration/calories
                                3. Add follow-up question
    
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

    generateDataPrompt(message) {
        let prompt = '';
        const lowerMessage = message.toLowerCase();

        // Workout recommendations
        if (/workout|exercise|training/i.test(message)) {
            let level = 'beginner';
            if (/intermediate/i.test(lowerMessage)) level = 'intermediate';
            if (/advanced/i.test(lowerMessage)) level = 'advanced';

            // Filter workouts by level
            const filteredWorkouts = this.allWorkouts.filter(w =>
                w.difficulty && w.difficulty.toLowerCase() === level.toLowerCase()
            ).slice(0, 3);

            if (filteredWorkouts.length > 0) {
                prompt += `Recommended ${level} workouts:\n`;
                filteredWorkouts.forEach(w => {
                    prompt += `- ${w.workout_name} (${w.duration} mins, ${w.calories} calories): ${w.description}\n`;
                });
            }
        }

        // Diet recommendations
        if (/diet|nutrition|meal/i.test(message)) {
            let type = 'balanced';
            if (/vegetarian/i.test(lowerMessage)) type = 'vegetarian';
            if (/vegan/i.test(lowerMessage)) type = 'vegan';
            if (/keto/i.test(lowerMessage)) type = 'keto';
            if (/low.?carb/i.test(lowerMessage)) type = 'low-carb';

            // Filter diets by type
            const filteredDiets = this.allDiets.filter(d =>
                d.diet_type && d.diet_type.toLowerCase().includes(type.toLowerCase())
            ).slice(0, 3);

            if (filteredDiets.length > 0) {
                prompt += `Recommended ${type} diets:\n`;
                filteredDiets.forEach(d => {
                    prompt += `- ${d.diet_name} (${d.preparation_min} mins, ${d.calories} calories): ${d.description}\n`;
                });
            }
        }

        // User history
        if (/history|progress|recent/i.test(message)) {
            if (/workout/i.test(message) && this.userWorkoutHistory.length > 0) {
                prompt += "User's recent workout history:\n";
                this.userWorkoutHistory.forEach(w => {
                    prompt += `- ${w.date}: ${w.workout_name} (${w.duration} mins, ${w.calories} calories)\n`;
                });
            }

            if (/diet/i.test(message) && this.userDietHistory.length > 0) {
                prompt += "User's recent diet history:\n";
                this.userDietHistory.forEach(d => {
                    prompt += `- ${d.date}: ${d.diet_name} (${d.calories} calories)\n`;
                });
            }

            if (/nutrition/i.test(message) && this.userData.nutrition && this.userData.nutrition.length > 0) {
                prompt += "User's recent nutrition data:\n";
                this.userData.nutrition.forEach(n => {
                    prompt += `- ${n.date}: Calories: ${n.calories_intake}, Protein: ${n.protein}g, Carbs: ${n.carbs}g, Fats: ${n.fats}g\n`;
                });
            }
        }

        // Progress tracking
        if (/progress|weight|goal/i.test(message)) {
            if (this.userData && this.userData.member) {
                const currentWeight = this.userData.performance?.current_weight || this.userData.member.weight;
                const targetWeight = this.userData.member.target_weight;
                const goal = this.userData.member.fitness_goal;

                prompt += `Weight progress:\n`;
                prompt += `- Starting weight: ${this.userData.member.weight} kg\n`;
                prompt += `- Current weight: ${currentWeight} kg\n`;
                prompt += `- Target weight: ${targetWeight} kg\n`;
                prompt += `- Goal: ${goal}\n`;

                // Calculate progress percentage
                if (goal === 'Lose Weight' && currentWeight < this.userData.member.weight) {
                    const weightToLose = this.userData.member.weight - targetWeight;
                    const weightLost = this.userData.member.weight - currentWeight;
                    const progressPercentage = Math.round((weightLost / weightToLose) * 100);
                    prompt += `- Progress: ${progressPercentage}% toward goal\n`;
                } else if (goal === 'Gain Muscle' && currentWeight > this.userData.member.weight) {
                    const weightToGain = targetWeight - this.userData.member.weight;
                    const weightGained = currentWeight - this.userData.member.weight;
                    const progressPercentage = Math.round((weightGained / weightToGain) * 100);
                    prompt += `- Progress: ${progressPercentage}% toward goal\n`;
                }
            }
        }

        return prompt;
    }

    formatContextPrompt() {
        let context = [];
        if (this.userContext.name) context.push(`- User's name: ${this.userContext.name}`);
        if (this.userContext.goal) context.push(`- User's goal: ${this.userContext.goal}`);
        if (this.userContext.level) context.push(`- User's fitness level: ${this.userContext.level}`);
        if (this.userContext.age) context.push(`- User's age: ${this.userContext.age}`);
        if (this.userContext.gender) context.push(`- User's gender: ${this.userContext.gender}`);
        if (this.userContext.weight) context.push(`- Starting weight: ${this.userContext.weight} kg`);
        if (this.userContext.currentWeight) context.push(`- Current weight: ${this.userContext.currentWeight} kg`);
        if (this.userContext.targetWeight) context.push(`- Target weight: ${this.userContext.targetWeight} kg`);
        if (this.userContext.workoutCount) context.push(`- Completed workouts: ${this.userContext.workoutCount}`);
        if (this.userContext.injuries) context.push(`- Injuries: ${this.userContext.injuries}`);
        return context.join('\n') || '- No known context yet';
    }

    // The remaining methods are unchanged
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