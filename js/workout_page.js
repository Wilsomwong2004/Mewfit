let selectedWorkout = null;
class WorkoutCarousel {
    constructor() {
        this.carousel = document.querySelector('.workout-carousel');
        this.track = document.querySelector('.workout-slides');
        this.slides = [
            {
                title: "Today Workout",
                description: "Carefully crafted by AI, this invigorating routine is designed to jumpstart your day with movements that enhance flexibility, improve overall stamina, and uplift your mood.",
                duration: "15 Minutes",
                calories: "200 kcal",
                image: "./assets/workout_pics/workout9.jpg"
            },
            {
                title: "10 Minute Cardio",
                description: "This fast-paced, high-energy cardio session is perfect for those with a busy schedule. Designed to elevate your heart rate and improve cardiovascular health in 10 minutes.",
                duration: "10 Minutes",
                calories: "150 kcal",
                image: "./assets/workout_pics/workout11.jpg"
            },
            {
                title: "No Joke Cardio",
                description: "Push your limits with this advanced, high-intensity cardio workout that’s not for the faint of heart. Make you feel suffering and don't want to do again.  ",
                duration: "30 Minutes",
                calories: "350 kcal",
                image: "./assets/workout_pics/workout10.jpg"
            }
        ];

        this.currentIndex = 0;
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.autoSlideInterval = null;
        this.autoSlideDelay = 10000;
        this.init();
    }

    init() {
        this.createSlides();
        this.createNavigation();
        this.bindEvents();
        this.updateSlidePosition();
        this.updateSlideVisibility();
        this.startAutoSlide();
    }

    startAutoSlide() {
        // Clear any existing interval
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
        }

        // Start new interval
        this.autoSlideInterval = setInterval(() => {
            if (this.currentIndex < this.slides.length - 1) {
                this.nextSlide();
            } else {
                this.goToSlide(0); // Return to first slide
            }
        }, this.autoSlideDelay);
    }

    pauseAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    resumeAutoSlide() {
        // Wait for transition and user interaction to complete before resuming
        setTimeout(() => {
            this.startAutoSlide();
        }, 500);
    }

    createSlides() {
        const slidesHTML = this.slides.map((slide, index) => `
            <div class="workout-slide" data-index="${index}">
                <div class="workout-card">
                    <div class="card-content">
                        <h3>${slide.title}</h3>
                        <p>${slide.description}</p>
                        <div class="workout-meta">
                            <span class="duration">
                                <i class="fas fa-clock"></i> ${slide.duration}
                            </span>
                            <span class="calories">
                                <i class="fas fa-fire"></i> ${slide.calories}
                            </span>
                        </div>
                        <button class="start-workout">Start Workout</button>
                    </div>
                    <div class="seperate-workout-transparent"></div>
                    <div class="card-image">
                        <img src="${slide.image}" alt="Workout">
                    </div>
                </div>
            </div>
        `).join('');

        this.track.innerHTML = slidesHTML;
        this.slides = document.querySelectorAll('.workout-slide');
    }

    createNavigation() {
        const nav = document.createElement('div');
        nav.className = 'carousel-nav';

        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `nav-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(index));
            nav.appendChild(dot);
        });

        this.carousel.appendChild(nav);
    }

    bindEvents() {
        // Touch/Trackpad events
        this.carousel.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        this.carousel.addEventListener('touchmove', (e) => {
            if (this.isTransitioning) return;

            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;

            // Calculate horizontal and vertical distance moved
            const deltaX = this.touchStartX - touchEndX;
            const deltaY = this.touchStartY - touchEndY;

            // If horizontal movement is greater than vertical movement,
            // prevent default scrolling behavior
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault();
            }
        }, { passive: false });

        this.carousel.addEventListener('touchend', (e) => {
            if (this.isTransitioning) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = this.touchStartX - touchEndX;
            const deltaY = this.touchStartY - touchEndY;

            // Only handle horizontal swipes if they're more significant than vertical movement
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
        });

        // Mouse wheel event
        this.carousel.addEventListener('wheel', (e) => {
            // If it's primarily horizontal scrolling (e.g., trackpad gesture)
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();

                if (this.isTransitioning) return;

                // Accumulate deltaX until it reaches a threshold
                if (Math.abs(e.deltaX) > 50) {
                    if (e.deltaX > 0) {
                        this.nextSlide();
                    } else {
                        this.previousSlide();
                    }
                }
            }
            // If it's primarily vertical scrolling, let the page scroll naturally
        }, { passive: false });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isTransitioning) return;

            if (e.key === 'ArrowRight') {
                this.nextSlide();
            } else if (e.key === 'ArrowLeft') {
                this.previousSlide();
            }
        });

        // Navigation dots
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
    }

    updateSlidePosition() {
        this.isTransitioning = true;

        this.slides.forEach((slide, index) => {
            const offset = (index - this.currentIndex) * 100;
            slide.style.transform = `translateX(${offset}%)`;
        });

        this.updateSlideVisibility();
        this.updateDots();

        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    updateSlideVisibility() {
        this.slides.forEach((slide, index) => {
            const distance = Math.abs(index - this.currentIndex);
            if (distance <= 1) {
                slide.style.opacity = distance === 0 ? '1' : '0.5';
                slide.style.visibility = 'visible';
                slide.style.zIndex = distance === 0 ? '1' : '0';
            } else {
                slide.style.opacity = '0';
                slide.style.visibility = 'hidden';
            }
        });
    }

    updateDots() {
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    goToSlide(index) {
        if (this.isTransitioning) return;
        this.currentIndex = index;
        this.updateSlidePosition();
    }

    nextSlide() {
        if (this.currentIndex < this.slides.length - 1) {
            this.goToSlide(this.currentIndex + 1);
        }
    }

    previousSlide() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        }
    }
}

const styles = `
`;

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Initialize carousel
    new WorkoutCarousel();
});

// -------------------------------------------------------------------------------------------------------------------------------------- //
// Activity Types
document.addEventListener('DOMContentLoaded', () => {
    // Dark mode initialization
    const darkModeToggle = document.querySelector('input[name="dark-mode-toggle"]');
    const cards = document.querySelectorAll('.activity-card');
    const defaultSelection = document.getElementById('default-selection');

    function setupActivityTypesScroll() {
        const cardContainer = document.querySelector('.activity-cards-container');
        if (!cardContainer) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        cardContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            cardContainer.style.cursor = 'grabbing';
            startX = e.pageX - cardContainer.offsetLeft;
            scrollLeft = cardContainer.scrollLeft;
            e.preventDefault();
        });

        cardContainer.addEventListener('mouseleave', () => {
            isDown = false;
            cardContainer.style.cursor = 'grab';
        });

        cardContainer.addEventListener('mouseup', () => {
            isDown = false;
            cardContainer.style.cursor = 'grab';
        });

        cardContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - cardContainer.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed multiplier
            cardContainer.scrollLeft = scrollLeft - walk;
        });

        // Touch events
        cardContainer.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - cardContainer.offsetLeft;
            scrollLeft = cardContainer.scrollLeft;
        });

        cardContainer.addEventListener('touchend', () => {
            isDown = false;
        });

        cardContainer.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - cardContainer.offsetLeft;
            const walk = (x - startX) * 1.5;
            cardContainer.scrollLeft = scrollLeft - walk;
            e.preventDefault();
        });
    }

    function applyDarkMode(isDarkMode) {
        document.documentElement.classList.toggle('dark-mode', isDarkMode);

        cards.forEach(card => {
            updateCardStyles(card, card === defaultSelection && card.classList.contains('active'));
        });

        // Dispatch a custom event to notify changes
        const event = new CustomEvent('darkModeChange', { detail: { isDarkMode } });
        window.dispatchEvent(event);
    }

    function checkDarkMode() {
        return document.documentElement.classList.contains('dark-mode');
    }

    function initializeDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        darkModeToggle.checked = isDarkMode;
        applyDarkMode(isDarkMode);
    }

    function updateCardStyles(card, isActive = false) {
        const isDark = checkDarkMode();

        if (isDark) {
            card.style.background = isActive ? '#ffa07a' : '#4d4d4e';
            card.style.color = isActive ? '#ffffff' : '#E5E7EB';
            card.style.border = isActive ? '2px solid#ea8b47' : '1px solid #374151';
        } else {
            card.style.background = isActive ? '#FFAD84' : '#ffffff';
            card.style.color = isActive ? '#ffffff' : '#000000';
            card.style.border = isActive ? '2px solid #FFAD84' : '1px solid #E5E7EB';
        }
        card.style.transition = 'all 0.3s ease';
    }

    // Toggle dark mode when the checkbox changes
    darkModeToggle.addEventListener('change', (event) => {
        const isDarkMode = event.target.checked;
        localStorage.setItem('darkMode', isDarkMode);
        applyDarkMode(isDarkMode);
    });

    // Add event handlers to all cards
    cards.forEach(card => {
        updateCardStyles(card, card === defaultSelection && card.classList.contains('active'));

        // Click to toggle active state
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            cards.forEach(c => updateCardStyles(c, c.classList.contains('active')));
        });

        // Mouseover (hover) to temporarily highlight the card
        card.addEventListener('mouseover', () => {
            const isDark = checkDarkMode();
            if (!card.classList.contains('active')) {
                card.style.background = isDark ? '#cc916a' : '#FFE4D2';
            }
        });

        // Mouseout to revert the card's style
        card.addEventListener('mouseout', () => {
            if (!card.classList.contains('active')) {
                updateCardStyles(card);
            }
        });

        // Update card styles on dark mode change
        window.addEventListener('darkModeChange', () => {
            updateCardStyles(card, card.classList.contains('active'));
        });
    });

    // Initialize dark mode and activity types scroll
    initializeDarkMode();
    setupActivityTypesScroll();
});

// -------------------------------------------------------------------------------------------------------------------------------------- //
// Workout Cards
const workouts = [
    // Cardio
    {
        "title": "Jumpstart Cardio",
        "duration": "12 minutes",
        "calories": "130Kcal",
        "level": "Beginner",
        "description": "Simple moves to get your heart pumping.",
        "image": '',
        "type": ["All", "Cardio"],
        "sets": 3,
        "exercises": [
            { "exercise": "March On The Spot", "duration": "1 minute", "video": "./assets/workout_video/Jumpstart Cardio/How_to_do_March_On_The_Spot_Joanna_Soh.mp4" },
            { "exercise": "Low Impact High Knee", "duration": "1 minute", "video": "./assets/workout_video/Jumpstart Cardio/How_to_do_Low_Impact_High_Knee_Joanna_Soh.mp4" },
            { "exercise": "Side to Side Step", "duration": "1 minute", "video": "./assets/workout_video/Jumpstart Cardio/How_to_do_Side_to_Side_Step_Joanna_Soh.mp4" },
            { "exercise": "Twist & Reach", "duration": "1 minute", "video": "./assets/workout_video/Jumpstart Cardio/How_to_do_Twist_Reach_Joanna_Soh.mp4" }
        ]
    },
    {
        "title": "Power HIIT Cardio",
        "duration": "20 minutes",
        "calories": "220Kcal",
        "level": "Advanced",
        "description": "High-intensity intervals for explosive results.",
        "image": '',
        "type": ["All", "Cardio", "HIIT"],
        "sets": 4,
        "exercises": [
            { "exercise": "Burpee", "reps": 12, "video": "./assets/workout_video/Power HIIT Cardio/How_to_do_Burpee_Joanna_Soh.mp4" },
            { "exercise": "High Knees", "duration": "45 seconds", "video": "./assets/workout_video/Power HIIT Cardio/How_to_do_High_Knees_Joanna_Soh.mp4" },
            { "exercise": "Mountain Climbers", "duration": "45 seconds", "video": "./assets/workout_video/Power HIIT Cardio/How_to_do_Mountain_Climbers_Joanna_Soh.mp4" },
            { "exercise": "Jump Squat With Punches", "reps": 15, "video": "./assets/workout_video/Power HIIT Cardio/How_to_Do_Jump_Squat_Joanna_Soh.mp4" }
        ]
    },
    {
        "title": "Stepper Cardio Blast",
        "duration": "18 minutes",
        "calories": "180Kcal",
        "level": "Intermediate",
        "description": "Use a stepper for dynamic movements.",
        "image": '',
        "type": ["All", "Cardio"],
        "sets": 3,
        "exercises": [
            { "exercise": "Step-Ups", "reps": 20, "video": ".assets/workout_video/Stepper Cardio Blast/How_to_do_Side_Step-Ups_Joanna_Soh.mp4" },
            { "exercise": "Step Hop Overs", "reps": 15, "video": ".assets/workout_video/Stepper Cardio Blast/How_to_do_Step_Hop_Overs_Joanna_Soh.mp4" },
            { "exercise": "Wide to Narrow Step Jump", "reps": 12, "video": ".assets/workout_video/Stepper Cardio Blast/How_to_do_Wide_to_Narrow_Step_Jump_Joanna_Soh.mp4" },
        ]
    },
    {
        "title": "Punch & Burn",
        "duration": "15 minutes",
        "calories": "150Kcal",
        "level": "Intermediate",
        "description": "Cardio with boxing-inspired moves.",
        "image": '',
        "type": ["All", "Cardio"],
        "sets": 2,
        "exercises": [
            { "exercise": "Squat With Punches", "reps": 20, "video": ".assets/workout_video/Stepper Cardio Blast/How_to_do_Squat_Hold_With_Punches_Joanna_Soh.mp4" },
            { "exercise": "Cross High Punches", "reps": 15, "video": ".assets/workout_video/Stepper Cardio Blast/How_to_do_Cross_High_Punches_Joanna_Soh.mp4" },
            { "exercise": "Straight Punches", "reps": 30, "video": ".assets/workout_video/Stepper Cardio Blast/How_to_do_Straight_Punches_Joanna_Soh.mp4" }
        ]
    },
    {
        "title": "Low Impact Steady State",
        "duration": "25 minutes",
        "calories": "160Kcal",
        "level": "Beginner",
        "description": "Gentle cardio for joint-friendly sweating.",
        "image": '',
        "type": ["All", "Cardio"],
        "sets": 1,
        "exercises": [
            { "exercise": "Shuffle Forward and Backward", "duration": "8 minutes", "video": ".assets/workout_video/Low Impact Steady State/How_to_do_Shuffle_Forward_and_Backward_Joanna_Soh.mp4" },
            { "exercise": "Ice Ski", "duration": "8 minutes", "video": ".assets/workout_video/Low Impact Steady State/How_to_do_Ice_Ski_Joanna_Soh.mp4" },
            { "exercise": "Side Step Shuffle", "duration": "8 minutes", "video": ".assets/workout_video/Low Impact Steady State/Side_Step_Shuffle.mp4" }
        ]
    },
    {
        "title": "Full-Body Cardio Fusion",
        "duration": "20 minutes",
        "calories": "200Kcal",
        "level": "Intermediate",
        "description": "Mix of jumps and agility drills.",
        "image": '',
        "type": ["All", "Cardio"],
        "sets": 3,
        "exercises": [
            { "exercise": "Kangaroo Hops", "reps": 15, "video": ".assets/workout_video/Full-Body Cardio Fusion/Kangaroo_Hops.mp4" },
            { "exercise": "Sprint", "duration": "30 seconds", "video": ".assets/workout_video/Full-Body Cardio Fusion/Sprint.mp4" },
            { "exercise": "Ice Skater", "reps": 20, "video": ".assets/workout_video/Full-Body Cardio Fusion/Ice Skater.mp4" },
        ]
    },
    {
        "title": "Step-Up Challenge",
        "duration": "15 minutes",
        "calories": "140Kcal",
        "level": "Intermediate",
        "description": "Elevate your heart rate with step-ups.",
        "image": '',
        "type": ["All", "Cardio"],
        "sets": 4,
        "exercises": [
            { "exercise": "Step-Ups With Knee To Elbow", "reps": 15, "video": ".assets/workout_video/Step-Up Challenge/Step-Ups.mp4" },
            { "exercise": "Step Jump", "reps": 12, "video": ".assets/workout_video/Step-Up Challenge/Step Jump.mp4" },
            { "exercise": "Burpee Step-Up", "reps": 10, "video": ".assets/workout_video/Step-Up Challenge/Burpee Step-Up.mp4" }
        ]
    },
    {
        "title": "Dance Cardio Groove",
        "duration": "20 minutes",
        "calories": "180Kcal",
        "level": "Beginner",
        "description": "Fun moves to keep you moving.",
        "image": '',
        "type": ["All", "Cardio"],
        "sets": 1,
        "exercises": [
            { "exercise": "Lateral Shuttle Steps", "duration": "5 minutes", "video": ".assets/workout_video/Dance Cardio Groove/Lateral Shuttle StepsLateral Shuttle Steps.mp4" },
            { "exercise": "Side to Side Step", "duration": "5 minutes", "video": ".assets/workout_video/Dance Cardio Groove/Side to Side Step.mp4" },
            { "exercise": "Twist & Reach", "duration": "5 minutes", "video": ".assets/workout_video/Dance Cardio Groove/Twist & Reach.mp4" }
        ]
    },
    {
        "title": "HIIT & Core Combo",
        "duration": "25 minutes",
        "calories": "240Kcal",
        "level": "Advanced",
        "description": "Blast fat while engaging your core.",
        "image": '',
        "type": ["All", "Cardio", "HIIT"],
        "sets": 4,
        "exercises": [
            { "exercise": "Plank Jacks", "reps": 20, "video": ".assets/workout_video/HIIT & Core Combo/Plank Jacks.mp4" },
            { "exercise": "Frogger To Squat", "reps": 15, "video": ".assets/workout_video/HIIT & Core Combo/Frogger To Squat.mp4" },
            { "exercise": "Decline Mountain Climbers", "reps": 20, "video": ".assets/workout_video/HIIT & Core Combo/Decline Mountain Climbers.mp4" },
        ]
    },
    {
        "title": "Quick Morning Cardio",
        "duration": "10 minutes",
        "calories": "90Kcal",
        "level": "Beginner",
        "description": "Fast routine to kickstart your day.",
        "image": '',
        "type": ["All", "Cardio"],
        "sets": 1,
        "exercises": [
            { "exercise": "Jog On The Spot", "duration": "3 minutes", "video": ".assets/workout_video/Quick Morning Cardio/Jog On The Spot.mp4" },
            { "exercise": "Butt Kicks", "duration": "3 minutes", "video": ".assets/workout_video/Quick Morning Cardio/Butt Kicks.mp4" },
            { "exercise": "High Punches", "duration": "3 minutes", "video": ".assets/workout_video/Quick Morning Cardio/High Punches.mp4" }
        ]
    },
    // Weighted
    {
        "title": "Full-Body Dumbbell Burn",
        "duration": "30 minutes",
        "calories": "250Kcal",
        "level": "Intermediate",
        "description": "Compound lifts for total strength.",
        "image": '',
        "type": ["All", "Weighted"],
        "sets": 3,
        "exercises": [
            { "exercise": "Dumbbell Squat", "reps": 12, "video": ".assets/workout_video/Full-Body Dumbbell Burn/Dumbbell SquatDumbbell Squat.mp4" },
            { "exercise": "Shoulder Press", "reps": 10, "video": ".assets/workout_video/Full-Body Dumbbell Burn/o7HCVmBwlGM - How_to_do_Shoulder_Press_Joanna_Soh.mp4" },
            { "exercise": "Reverse Lunge to Shoulder Press", "reps": 10, "video": ".assets/workout_video/Full-Body Dumbbell Burn/FxLiuvBL5Cs - How_to_do_Reverse_Lunge_to_Shoulder_Press_Joanna_Soh.mp4" },
            { "exercise": "Bicep Curls", "reps": 15, "video": ".assets/workout_video/Full-Body Dumbbell Burn/nLAbP19S2hk - How_to_do_Bicep_Curls_to_Outward_Abductor_Joanna_Soh.mp4" }
        ]
    },
    {
        "title": "Upper Body Sculpt",
        "duration": "25 minutes",
        "calories": "200Kcal",
        "level": "Intermediate",
        "description": "Target arms, shoulders, and back.",
        "image": '',
        "type": ["All", "Weighted"],
        "sets": 3,
        "exercises": [
            { "exercise": "Tricep Kickback", "reps": 12, "video": ".assets/workout_video/Upper Body Sculpt/Urn2TycUVjw - How_to_do_Tricep_Kickback_Joanna_Soh.mp4" },
            { "exercise": "Front Raise", "reps": 15, "video": ".assets/workout_video/Upper Body Sculpt/4Uyhk2qaFrg - How_to_do_Front_Raise_Joanna_Soh.mp4" },
            { "exercise": "Single Arm Dumbbell Row", "reps": 10, "video": ".assets/workout_video/Upper Body Sculpt/Single Arm Dumbbell Row.mp4" },
            { "exercise": "Upright Dumbbell Row", "reps": 12, "video": ".assets/workout_video/Upper Body Sculpt/Upright Dumbbell Row.mp4" }
        ]
    },
    {
        "title": "Leg Day Strength",
        "duration": "25 minutes",
        "calories": "220Kcal",
        "level": "Intermediate",
        "description": "Build lower body power.",
        "image": '',
        "type": ["All", "Weighted"],
        "sets": 3,
        "exercises": [
            { "exercise": "Dumbbell Sumo Squat", "reps": 15, "video": ".assets/workout_video/Leg Day Strength/Dumbbell Sumo Squat.mp4" },
            { "exercise": "Walking Lunges", "reps": 12, "video": ".assets/workout_video/Leg Day Strength/Walking Lunges.mp4" },
            { "exercise": "Deadlift", "reps": 10, "video": ".assets/workout_video/Leg Day Strength/Deadlift.mp4" },
            { "exercise": "Goblet Squat", "reps": 12, "video": ".assets/workout_video/Leg Day Strength/Goblet Squat.mp4" }
        ]
    },
    {
        "title": "Functional Strength",
        "duration": "20 minutes",
        "calories": "180Kcal",
        "level": "Intermediate",
        "description": "Real-world movement patterns.",
        "image": '',
        "type": ["All", "Weighted"],
        "sets": 3,
        "exercises": [
            { "exercise": "Woodchop", "reps": 15, "video": ".assets/workout_video/Functional Strength/Woodchop.mp4" },
            { "exercise": "Snatch to Shoulder Press", "reps": 10, "video": ".assets/workout_video/Functional Strength/Snatch to Shoulder Press.mp4" },
            { "exercise": "Dumbbell Swing", "reps": 12, "video": ".assets/workout_video/Functional Strength/Dumbbell Swing.mp4" },
            { "exercise": "Overhead Squat", "reps": 10, "video": ".assets/workout_video/Functional Strength/Overhead Squat.mp4" }
        ]
    },
    {
        "title": "Back & Shoulders Focus",
        "duration": "25 minutes",
        "calories": "190Kcal",
        "level": "Advanced",
        "description": "Strengthen posterior chain.",
        "image": '',
        "type": ["All", "Weighted"],
        "sets": 3,
        "exercises": [
            { "exercise": "Single Leg Deadlift", "reps": 12, "video": ".assets/workout_video/Back & Shoulders Focus/Single Leg Deadlift.mp4" },
            { "exercise": "Reverse Fly", "reps": 15, "video": ".assets/workout_video/Back & Shoulders Focus/Reverse Fly.mp4" },
            { "exercise": "Plank Row", "reps": 10, "video": ".assets/workout_video/Back & Shoulders Focus/Plank Row.mp4" },
            { "exercise": "Y to T Raises", "reps": 12, "video": ".assets/workout_video/Back & Shoulders Focus/Y to T Raises.mp4" }
        ]
    },
    {
        "title": "Stepper Strength",
        "duration": "20 minutes",
        "calories": "170Kcal",
        "level": "Intermediate",
        "description": "Use a stepper for resistance.",
        "image": '',
        "type": ["All", "Weighted"],
        "sets": 3,
        "exercises": [
            { "exercise": "Step-Ups With Knee To Elbow", "reps": 15, "video": ".assets/workout_video/Stepper Strength/Step-Ups With Knee To Elbow.mp4" },
            { "exercise": "Alternate Elevated Lunge (With Stepper)", "reps": 12, "video": ".assets/workout_video/Stepper Strength/Alternate Elevated Lunge (With Stepper).mp4" },
            { "exercise": "Tricep Dips", "reps": 15, "video": ".assets/workout_video/Stepper Strength/Tricep DipsTricep Dips.mp4" }
        ]
    },
    {
        "title": "Total Body Dumbbell",
        "duration": "30 minutes",
        "calories": "240Kcal",
        "level": "Advanced",
        "description": "Full-body endurance with weights.",
        "image": '',
        "type": ["All", "Weighted"],
        "sets": 4,
        "exercises": [
            { "exercise": "Burpees with Dumbbell Press", "reps": 10, "video": ".assets/workout_video/Total Body Dumbbell/Burpees with Dumbbell Press.mp4" },
            { "exercise": "Dumbbells High Pulls", "reps": 12, "video": ".assets/workout_video/Total Body Dumbbell/Dumbbells High Pulls.mp4" },
            { "exercise": "Alternate Lunge & Twist", "reps": 12, "video": ".assets/workout_video/Total Body Dumbbell/Alternate Lunge & Twist.mp4" },
            { "exercise": "Head Crusher", "reps": 10, "video": ".assets/workout_video/Total Body Dumbbell/Head Crusher.mp4" }
        ]
    },
    {
        "title": "Arm & Core Combo",
        "duration": "20 minutes",
        "calories": "160Kcal",
        "level": "Intermediate",
        "description": "Strengthen arms and abs.",
        "image": '',
        "type": ["All", "Weighted"],
        "sets": 3,
        "exercises": [
            { "exercise": "Russian Twist (Dumbbell)", "reps": 20, "video": ".assets/workout_video/Arm & Core Combo/Russian Twist (Dumbbell).mp4" },
            { "exercise": "Tricep Extension", "reps": 12, "video": ".assets/workout_video/Arm & Core Combo/Tricep Extension.mp4" },
            { "exercise": "Bicep Curls to Outward Abductor", "reps": 15, "video": ".assets/workout_video/Arm & Core Combo/Bicep Curls to Outward Abductor.mp4" }
        ]
    },
    {
        "title": "Power Endurance",
        "duration": "25 minutes",
        "calories": "210Kcal",
        "level": "Advanced",
        "description": "Build stamina with weights.",
        "image": '',
        "type": ["All", "Weighted"],
        "sets": 4,
        "exercises": [
            { "exercise": "Squat to Shoulder Press", "reps": 12, "video": ".assets/workout_video/Power Endurance/Squat to Shoulder Press.mp4" },
            { "exercise": "Single Arm Snatch to Shoulder Press", "reps": 10, "video": ".assets/workout_video/Power Endurance/Single Arm Snatch to Shoulder Press.mp4" },
            { "exercise": "Pull Over", "reps": 12, "video": ".assets/workout_video/Power Endurance/Pull Over.mp4" },
            { "exercise": "Fly Hip Bridge", "reps": 15, "video": ".assets/workout_video/Power Endurance/Fly Hip Bridge.mp4" }
        ]
    },
    {
        "title": "Functional Mobility",
        "duration": "20 minutes",
        "calories": "150Kcal",
        "level": "Intermediate",
        "description": "Improve movement quality.",
        "image": '',
        "type": ["All", "Weighted"],
        "sets": 3,
        "exercises": [
            { "exercise": "Overhead Arm Circle", "reps": 12, "video": ".assets/workout_video/Functional Mobility/Overhead Arm Circle.mp4" },
            { "exercise": "L Rotation", "reps": 10, "video": ".assets/workout_video/Functional Mobility/L Rotation.mp4" },
            { "exercise": "Side to Front Raise", "reps": 12, "video": ".assets/workout_video/Functional Mobility/Side to Front Raise.mp4" }
        ]
    },
    // Weight-Free
    {
        "title": "Core Crusher",
        "duration": "20 minutes",
        "calories": "150Kcal",
        "level": "Intermediate",
        "description": "Target abs with no equipment.",
        "image": '',
        "type": ["All", "Weight-free"],
        "sets": 3,
        "exercises": [
            { "exercise": "Plank", "duration": "1 minute", "video": ".assets/workout_video/Core Crusher/Plank Row.mp4" },
            { "exercise": "Russian Twist", "reps": 20, "video": ".assets/workout_video/Core Crusher/Russian Twist.mp4" },
            { "exercise": "Leg Raise with Hip Thrust", "reps": 15, "video": ".assets/workout_video/Core Crusher/Leg Raise with Hip Thrust.mp4" },
            { "exercise": "Side Plank Hip Dips", "reps": 12, "video": ".assets/workout_video/Core Crusher/Side Plank Hip Dips.mp4" }
        ]
    },
    {
        "title": "Low Impact Strength",
        "duration": "25 minutes",
        "calories": "160Kcal",
        "level": "Beginner",
        "description": "Gentle moves for joint health.",
        "image": '',
        "type": ["All", "Weight-free"],
        "sets": 3,
        "exercises": [
            { "exercise": "Chair Squat", "reps": 15, "video": ".assets/workout_video/Low Impact Strength/Chair Squat.mp4" },
            { "exercise": "Reverse Lunge", "reps": 12, "video": ".assets/workout_video/Low Impact Strength/Reverse Lunge.mp4" },
            { "exercise": "Hip Bridge Hold", "duration": "45 seconds", "video": ".assets/workout_video/Low Impact Strength/Hip Bridge Hold.mp4" },
            { "exercise": "Fire Hydrants", "reps": 15, "video": ".assets/workout_video/Low Impact Strength/Fire Hydrants.mp4" }
        ]
    },
    {
        "title": "Total Body Bodyweight",
        "duration": "30 minutes",
        "calories": "200Kcal",
        "level": "Intermediate",
        "description": "No equipment, full-body focus.",
        "image": '',
        "type": ["All", "Weight-free"],
        "sets": 3,
        "exercises": [
            { "exercise": "Push-Up", "reps": 12, "video": ".assets/workout_video/Total Body Bodyweight/Push-Up.mp4" },
            { "exercise": "Lunge Pulse", "reps": 15, "video": ".assets/workout_video/Total Body Bodyweight/Lunge Pulse.mp4" },
            { "exercise": "Sumo Squat", "reps": 15, "video": ".assets/workout_video/Total Body Bodyweight/Sumo Squat.mp4" },
            { "exercise": "Superman", "duration": "1 minute", "video": ".assets/workout_video/Total Body Bodyweight/Superman.mp4" }
        ]
    },
    {
        "title": "Dynamic Core",
        "duration": "20 minutes",
        "calories": "170Kcal",
        "level": "Advanced",
        "description": "Advanced ab challenges.",
        "image": '',
        "type": ["All", "Weight-free"],
        "sets": 3,
        "exercises": [
            { "exercise": "Windshield Wiper with Leg Extension", "reps": 10, "video": ".assets/workout_video/Dynamic Core/Windshield Wiper with Leg Extension.mp4" },
            { "exercise": "Plank Up-Down", "reps": 15, "video": ".assets/workout_video/Dynamic Core/Plank Up-Down.mp4" },
            { "exercise": "Flutter Kicks", "duration": "1 minute", "video": ".assets/workout_video/Dynamic Core/Flutter Kicks.mp4" }
        ]
    },
    {
        "title": "Lower Body Burn",
        "duration": "25 minutes",
        "calories": "180Kcal",
        "level": "Intermediate",
        "description": "Focus on legs and glutes.",
        "image": '',
        "type": ["All", "Weight-free"],
        "sets": 3,
        "exercises": [
            { "exercise": "Curtsy Lunge", "reps": 12, "video": "./assets/workout_video/Lower Body Burn/Curtsy Lunge.mp4" },
            { "exercise": "Squat Pulse", "reps": 15, "video": "./assets/workout_video/Lower Body Burn/Squat Pulse.mp4" },
            { "exercise": "Standing Side Leg Raise", "reps": 20, "video": "./assets/workout_video/Lower Body Burn/Standing Side Leg Raise.mp4" },
            { "exercise": "Calf Raises", "reps": 20, "video": "./assets/workout_video/Lower Body Burn/Calf Raises.mp4" }
        ]
    },
    {
        "title": "Mobility & Stability",
        "duration": "20 minutes",
        "calories": "140Kcal",
        "level": "Beginner",
        "description": "Improve balance and control.",
        "image": '',
        "type": ["All", "Weight-free"],
        "sets": 2,
        "exercises": [
            { "exercise": "Assisted Standing Kickbacks", "reps": 15, "video": ".assets/workout_video/Mobility & Stability/Assisted Standing Kickbacks.mp4" },
            { "exercise": "Clock Lunge", "reps": 10, "video": ".assets/workout_video/Mobility & Stability/Clock Lunge.mp4" },
            { "exercise": "Hip Bridge Circle", "reps": 12, "video": ".assets/workout_video/Mobility & Stability/Hip Bridge Circl.mp4" }
        ]
    },
    {
        "title": "Push-Up Progression",
        "duration": "20 minutes",
        "calories": "160Kcal",
        "level": "Intermediate",
        "description": "Master push-up variations.",
        "image": '',
        "type": ["All", "Weight-free"],
        "sets": 3,
        "exercises": [
            { "exercise": "Knee Push-Up", "reps": 12, "video": "./assets/workout_video/Push-Up Progression/Knee Push-Up.mp4" },
            { "exercise": "Wide To Narrow Push-Up", "reps": 10, "video": "./assets/workout_video/Push-Up Progression/Wide To Narrow Push-Up.mp4" },
            { "exercise": "Spiderman Push-Up", "reps": 8, "video": "./assets/workout_video/Push-Up Progression/Spiderman Push-Up.mp4" }
        ]
    },
    {
        "title": "Functional Flexibility",
        "duration": "25 minutes",
        "calories": "150Kcal",
        "level": "Beginner",
        "description": "Enhance movement range.",
        "image": '',
        "type": ["All", "Weight-free"],
        "sets": 2,
        "exercises": [
            { "exercise": "Forward To Back Lunge", "reps": 12, "video": ".assets/workout_video/Functional Flexibility/Forward To Back Lunge.mp4" },
            { "exercise": "The Bird", "reps": 15, "video": ".assets/workout_video/Functional Flexibility/The Bird.mp4" },
            { "exercise": "Bob Weave Circle", "duration": "5 minutes", "video": ".assets/workout_video/Functional Flexibility/Bob Weave Circle.mp4" }
        ]
    },

    {
        "title": "Total Body Tone",
        "duration": "30 minutes",
        "calories": "220Kcal",
        "level": "Advanced",
        "description": "High-effort bodyweight moves.",
        "image": '',
        "type": ["All", "Weight-free"],
        "sets": 4,
        "exercises": [
            { "exercise": "Burpee to Push-Up", "reps": 10, "video": ".assets/workout_video/Total Body Tone/Burpee to Push-Up.mp4" },
            { "exercise": "Split Jack Knife", "reps": 15, "video": ".assets/workout_video/Total Body Tone/Split Jack Knife.mp4" },
            { "exercise": "Sprinter Alternate Knee Tucks", "reps": 20, "video": ".assets/workout_video/Total Body Tone/Sprinter Alternate Knee Tucks.mp4" }
        ]
    },
    {
        "title": "Balance & Coordination",
        "duration": "20 minutes",
        "calories": "130Kcal",
        "level": "Beginner",
        "description": "Improve stability.",
        "image": '',
        "type": ["All", "Weight-free"],
        "sets": 2,
        "exercises": [
            { "exercise": "Single Leg Hip Bridge", "reps": 12, "video": ".assets/workout_video/Balance & Coordination/Single Leg Hip Bridge.mp4" },
            { "exercise": "Assisted Lunge", "reps": 10, "video": ".assets/workout_video/Balance & Coordination/Assisted Lunge.mp4" },
            { "exercise": "Standing Side Crunch", "reps": 15, "video": ".assets/workout_video/Balance & Coordination/Standing Side Crunch.mp4" }
        ]
    },
    // Yoga
    {
        "title": "Post-Workout Stretch",
        "duration": "15 minutes",
        "calories": "60Kcal",
        "level": "Beginner",
        "description": "Relax and recover.",
        "image": '',
        "type": ["All", "Yoga"],
        "sets": 1,
        "exercises": [
            { "pose": "Child Pose", "duration": "3 minutes", "video": ".assets/workout_video/Post-Workout Stretch/Child Pose.mp4" },
            { "pose": "Downward Facing Dog", "duration": "3 minutes", "video": ".assets/workout_video/Post-Workout Stretch/Downward Facing Dog.mp4" },
            { "pose": "Butterfly Stretch", "duration": "3 minutes", "video": ".assets/workout_video/Post-Workout Stretch/Butterfly Stretch.mp4" }
        ]
    },
    {
        "title": "Flexibility Flow",
        "duration": "20 minutes",
        "calories": "80Kcal",
        "level": "Intermediate",
        "description": "Improve mobility and posture.",
        "image": '',
        "type": ["All", "Yoga"],
        "sets": 1,
        "exercises": [
            { "pose": "Cat and Camel", "duration": "5 minutes", "video": ".assets/workout_video/Flexibility Flow/Cat and Camel.mp4" },
            { "pose": "Lying Spinal Twist", "duration": "5 minutes", "video": ".assets/workout_video/Flexibility Flow/Lying Spinal Twist.mp4" },
            { "pose": "Standing Hamstring Stretch", "duration": "5 minutes", "video": ".assets/workout_video/Flexibility Flow/Standing Hamstring Stretch.mp4" }
        ]
    },
    {
        "title": "Spine & Back Relief",
        "duration": "20 minutes",
        "calories": "70Kcal",
        "level": "Intermediate",
        "description": "Ease back stiffness.",
        "image": '',
        "type": ["All", "Yoga"],
        "sets": 1,
        "exercises": [
            { "pose": "Cobra", "duration": "5 minutes", "video": ".assets/workout_video/Spine & Back Relief/Cobra.mp4" },
            { "pose": "Bridge Stretch", "duration": "5 minutes", "video": ".assets/workout_video/Spine & Back Relief/Bridge Stretch.mp4" },
            { "pose": "Spinal Twist", "duration": "5 minutes", "video": ".assets/workout_video/Spine & Back Relief/Lying Spinal Twist.mp4" }
        ]
    },
    {
        "title": "Neck & Shoulder Relaxation",
        "duration": "10 minutes",
        "calories": "30Kcal",
        "level": "Beginner",
        "description": "Release upper body tension.",
        "image": '',
        "type": ["All", "Yoga"],
        "sets": 1,
        "exercises": [
            { "pose": "Neck Stretches", "duration": "3 minutes", "video": ".assets/workout_video/Neck & Shoulder Relaxation/Neck Stretches.mp4" },
            { "pose": "Shoulder Stretch", "duration": "3 minutes", "video": ".assets/workout_video/Neck & Shoulder Relaxation/Shoulder Stretch.mp4" },
            { "pose": "Chest Stretch", "duration": "3 minutes", "video": ".assets/workout_video/Neck & Shoulder Relaxation/Chest Stretch.mp4" }
        ]
    },
    {
        "title": "Morning Mobility",
        "duration": "15 minutes",
        "calories": "40Kcal",
        "level": "Beginner",
        "description": "Wake up your body gently.",
        "image": '',
        "type": ["All", "Yoga"],
        "sets": 1,
        "exercises": [
            { "pose": "Arm Circle", "duration": "3 minutes", "video": ".assets/workout_video/Morning Mobility/Overhead Arm Circle.mp4" },
            { "pose": "Alternate Cross Stretch", "duration": "3 minutes", "video": "assets/workout_video/Morning Mobility/Alternate Cross Stretch.mp4" },
            { "pose": "Hug Knees to Chest", "duration": "3 minutes", "video": "assets/workout_video/Morning Mobility/Hug Knees to Chest.mp4" }
        ]
    },
    {
        "title": "Active Stretch Flow",
        "duration": "25 minutes",
        "calories": "80Kcal",
        "level": "Intermediate",
        "description": "Dynamic stretching for athletes.",
        "image": '',
        "type": ["All", "Yoga"],
        "sets": 1,
        "exercises": [
            { "pose": "Hip Flexor Reach", "duration": "5 minutes", "video": ".assets/workout_video/Active Stretch Flow/Hip Flexor Reach.mp4" },
            { "pose": "Lying Hamstring Stretch", "duration": "5 minutes", "video": ".assets/workout_video/Active Stretch Flow/Lying Hamstring Stretch.mp4" },
            { "pose": "Wrist Stretch", "duration": "5 minutes", "video": ".assets/workout_video/Active Stretch Flow/Wrist Stretch.mp4" }
        ]
    },
    {
        "title": "Evening Wind-Down",
        "duration": "15 minutes",
        "calories": "40Kcal",
        "level": "Beginner",
        "description": "Unwind before bed.",
        "image": '',
        "type": ["All", "Yoga"],
        "sets": 1,
        "exercises": [
            { "pose": "Child Pose", "duration": "5 minutes", "video": ".assets/workout_video/Evening Wind-Down/Child Pose.mp4" },
            { "pose": "Butterfly Stretch", "duration": "5 minutes", "video": ".assets/workout_video/Evening Wind-Down/Butterfly Stretch.mp4" },
            { "pose": "Cat and Camel", "duration": "5 minutes", "video": ".assets/workout_video/Evening Wind-Down/Cat and Camel.mp4" }
        ]
    },
];


// Helper function to create a workout card
const createWorkoutCard = (workout, index) => {
    const image = workout.image ? `./assets/workouts/${workout.image}` : './assets/icons/error.svg';

    return `
        <div class="workout-card-content" data-workout-index="${index}" data-workout-type="${workout.type.join(',')}" data-workout-title="${workout.title}">
            <div class="workout-image">
                <img src="${image}" alt="${workout.title}">
            </div>
            <div class="workout-info">
                <h3 class="workout-title">${workout.title}</h3>
                <span class="workout-level">${workout.level}</span>
                <div class="workout-stats">
                    <span><i class="fas fa-clock"></i> ${workout.duration}</span>
                    <span><i class="fas fa-fire"></i> ${workout.calories}</span>
                </div>
            </div>
        </div>
    `;
};


function filterWorkouts(type) {
    if (type === 'All') return workouts;
    return workouts.filter(workout => workout.type.includes(type));
}

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Function to update the popup level display
function updatePopupLevel(level) {
    const popupLevel = document.getElementById('popup-level');
    const currentMeter = popupLevel.querySelector('.difficulty-meter');

    if (currentMeter) {
        currentMeter.remove();
    }

    const meterContainer = document.createElement('div');
    meterContainer.className = `difficulty-meter ${level.toLowerCase()}`;

    // Create three bars for the difficulty meter
    for (let i = 0; i < 3; i++) {
        const bar = document.createElement('div');
        bar.className = 'difficulty-bar';
        meterContainer.appendChild(bar);
    }

    // Set active bars based on level
    const bars = meterContainer.querySelectorAll('.difficulty-bar');
    const activeBars = level.toLowerCase() === 'beginner' ? 1
        : level.toLowerCase() === 'intermediate' ? 2
            : 3;

    for (let i = 0; i < activeBars; i++) {
        bars[i].classList.add('active');
    }

    popupLevel.innerHTML = '';
    popupLevel.appendChild(meterContainer);
}

// Modify your existing setupWorkoutCardClick function
function setupWorkoutCardClick() {
    document.querySelectorAll('.workout-card-content').forEach(card => {
        card.addEventListener('click', () => {
            const workoutIndex = parseInt(card.getAttribute('data-workout-index'));
            const workout = workouts[workoutIndex];

            if (!workout) {
                console.error('Workout not found for index:', workoutIndex);
                return;
            }

            // Store the selected workout
            selectedWorkout = workout;

            // Update popup content with the correct workout data
            const popup = document.getElementById('popup-container');

            // Update title
            document.getElementById('popup-title').textContent = workout.title.toUpperCase();

            // Update description
            document.getElementById('popup-desc').textContent = workout.description;

            // Update duration (extract numbers only)
            const durationNum = workout.duration.match(/\d+/)[0];
            document.getElementById('popup-duration').textContent = durationNum;

            // Update calories (extract numbers only)
            const caloriesNum = workout.calories.match(/\d+/)[0];
            document.getElementById('popup-calories').textContent = caloriesNum;

            // Update difficulty level
            updatePopupLevel(workout.level);

            // Update image
            const workoutImage = document.getElementById('popup-workout-image');
            if (workout.image) {
                workoutImage.src = workout.image;
                workoutImage.alt = `${workout.title} Image`;
                workoutImage.style.objectFit = 'cover';
            } else {
                workoutImage.src = './assets/icons/error.svg';
                workoutImage.alt = 'Workout Image Not Found';
                workoutImage.style.objectFit = 'contain';
                workoutImage.style.width = '60%';
                workoutImage.style.height = 'auto';
            }

            // Update exercise list
            updateExerciseList(workout);

            // Show popup
            popup.classList.add('active');
        });
    });

    // Setup popup close handlers
    const popup = document.getElementById('popup-container');
    popup.addEventListener('click', (e) => {
        if (e.target.classList.contains('popup-close') || e.target === popup) {
            popup.classList.remove('active');
            selectedWorkout = null;
        }
    });
}


document.querySelector('.popup-start-button').addEventListener('click', () => {
    if (selectedWorkout) {
        localStorage.setItem('currentWorkout', JSON.stringify([selectedWorkout]));
        window.location.href = 'subworkout_page.html';
    } else {
        console.error('No workout selected');
    }
});

function initializeWorkoutSections() {
    document.querySelectorAll('section.workout-body').forEach(section => {
        const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
        const workoutGrid = section.querySelector('.workout-grid');

        if (workoutGrid) {
            // Clear 'Top Picks' and 'Recently Workout' sections initially
            if (sectionTitle === 'Top Picks For You' || sectionTitle === 'Recently Workout') {
                workoutGrid.innerHTML = '';
                return;
            }

            const sectionType = sectionTitle.replace(/^(🔥|⚡|⏰|❤️|💪|🏋️|🧘‍♀️|🧘)?\s*/, '');
            const filteredWorkouts = filterWorkouts(sectionType);

            // Only add scroll layout for non-empty sections
            if (filteredWorkouts.length > 0) {
                workoutGrid.classList.add('scroll-layout');
                workoutGrid.innerHTML = filteredWorkouts.map((workout, index) =>
                    createWorkoutCard(workout, index)
                ).join('');
                setupScrollArrows(workoutGrid);
            }
        }
    });

    // Make sure to call setupWorkoutCardClick after creating cards
    setupWorkoutCardClick();
}

function setupScrollArrows(grid) {
    // Remove any existing wrapper and arrows
    const existingWrapper = grid.parentElement.querySelector('.grid-wrapper');
    if (existingWrapper) {
        const originalGrid = existingWrapper.querySelector('.workout-grid');
        if (originalGrid) {
            existingWrapper.replaceWith(originalGrid);
        }
    }

    // Create new wrapper and elements
    const gridWrapper = document.createElement('div');
    gridWrapper.className = 'grid-wrapper';
    grid.parentNode.insertBefore(gridWrapper, grid);
    gridWrapper.appendChild(grid);

    const gradientLeft = document.createElement('div');
    gradientLeft.className = 'scroll-gradient scroll-gradient-left';
    const gradientRight = document.createElement('div');
    gradientRight.className = 'scroll-gradient scroll-gradient-right';

    const leftArrow = document.createElement('div');
    leftArrow.className = 'scroll-arrow scroll-arrow-left';
    leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';

    const rightArrow = document.createElement('div');
    rightArrow.className = 'scroll-arrow scroll-arrow-right';
    rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';

    gridWrapper.appendChild(gradientLeft);
    gridWrapper.appendChild(gradientRight);
    gridWrapper.appendChild(leftArrow);
    gridWrapper.appendChild(rightArrow);

    const updateArrowVisibility = () => {
        const isAtStart = grid.scrollLeft <= 0;
        const isAtEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 1;
        const hasOverflow = grid.scrollWidth > grid.clientWidth;

        // Only show arrows and gradients if there's overflow
        const showControls = hasOverflow && grid.children.length > 0;

        gradientLeft.style.opacity = showControls && !isAtStart ? '1' : '0';
        leftArrow.style.display = showControls && !isAtStart ? 'flex' : 'none';

        gradientRight.style.opacity = showControls && !isAtEnd ? '1' : '0';
        rightArrow.style.display = showControls && !isAtEnd ? 'flex' : 'none';
    };

    // Handle arrow clicks with stopPropagation
    leftArrow.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        grid.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });

    rightArrow.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        grid.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });

    // Update arrow visibility on various events
    grid.addEventListener('scroll', updateArrowVisibility);
    window.addEventListener('resize', updateArrowVisibility);

    // Initial check
    updateArrowVisibility();

    // Add mutation observer to watch for content changes
    const observer = new MutationObserver(updateArrowVisibility);
    observer.observe(grid, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeWorkoutSections();

    const defaultCard = document.querySelector('.activity-card-all');
    if (defaultCard) {
        defaultCard.click();
    }
});

document.querySelectorAll('.activity-card').forEach(card => {
    card.addEventListener('click', () => {
        const selectedType = card.querySelector('p').textContent.trim();

        let displayedWorkouts = [];
        let currentIndex = 0;

        document.querySelectorAll('section.workout-body').forEach(section => {
            const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
            const workoutGrid = section.querySelector('.workout-grid');

            if (!workoutGrid) return;

            // Clear special sections when filter is applied
            if (['Top Picks For You', 'Recently Workout'].includes(sectionTitle)) {
                workoutGrid.innerHTML = '';
                section.style.display = selectedType === 'All' ? '' : 'none';
                return;
            }

            // Handle visibility and layout based on selection
            if (selectedType === 'All' || sectionTitle.includes(selectedType)) {
                section.style.display = '';
                const layout = selectedType === 'All' ? 'scroll-layout' : 'grid-layout';
                workoutGrid.classList.add(layout);
                workoutGrid.classList.remove(layout === 'scroll-layout' ? 'grid-layout' : 'scroll-layout');

                const sectionType = sectionTitle.replace(/^(🔥|⚡|⏰|❤️|💪|🏋️|🧘‍♀️|🧘)?\s*/, '');
                const filteredWorkouts = filterWorkouts(selectedType === 'All' ? sectionType : selectedType);

                filteredWorkouts.forEach(workout => {
                    displayedWorkouts.push({
                        workout: workout,
                        globalIndex: currentIndex
                    });
                    currentIndex++;
                });

                // Create workout cards with correct indices
                workoutGrid.innerHTML = filteredWorkouts.map((workout, index) => {
                    const globalIndex = displayedWorkouts.findIndex(w => w.workout === workout);
                    return createWorkoutCard(workout, globalIndex);
                }).join('');

                setupScrollArrows(workoutGrid);
            } else {
                section.style.display = 'none';
            }
        });

        // Modified setupWorkoutCardClick to use the displayed workouts array
        document.querySelectorAll('.workout-card-content').forEach(card => {
            card.addEventListener('click', () => {
                const workoutIndex = parseInt(card.getAttribute('data-workout-index'));
                const workoutData = displayedWorkouts.find(w => w.globalIndex === workoutIndex);

                if (!workoutData) {
                    console.error('Workout not found for index:', workoutIndex);
                    return;
                }

                const workout = workoutData.workout;
                selectedWorkout = workout;

                // Update popup content
                const popup = document.getElementById('popup-container');

                // Update title
                document.getElementById('popup-title').textContent = workout.title.toUpperCase();

                // Update description
                document.getElementById('popup-desc').textContent = workout.description;

                // Update duration
                document.getElementById('popup-duration').textContent = workout.duration.match(/\d+/)[0];

                // Update calories
                document.getElementById('popup-calories').textContent = workout.calories.match(/\d+/)[0];

                // Update difficulty level
                updatePopupLevel(workout.level);

                // Update image
                const workoutImage = document.getElementById('popup-workout-image');
                if (workout.image) {
                    workoutImage.src = workout.image;
                    workoutImage.alt = `${workout.title} Image`;
                    workoutImage.style.objectFit = 'cover';
                } else {
                    workoutImage.src = './assets/icons/error.svg';
                    workoutImage.alt = 'Workout Image Not Found';
                    workoutImage.style.objectFit = 'contain';
                    workoutImage.style.width = '60%';
                    workoutImage.style.height = 'auto';
                }

                // Update exercise list - NEW
                updateExerciseList(workout);

                // Show popup
                popup.classList.add('active');
            });
        });
    });
});

// -------------------------------------------------------------------------------------------------------------------------------------- //
// Exercise List

// Function to create thumbnail from video path
function generateThumbnail(videoPath) {
    // In a real implementation, you would generate thumbnails from the video
    // For now, we'll use a placeholder based on the exercise name
    const exerciseName = videoPath.split('/').pop().replace('.mp4', '');

    // First try to extract an image name from the exercise
    const imageUrl = `./assets/exercise_thumbs/${exerciseName.toLowerCase().replace(/\s+/g, '_')}.jpg`;

    // As a fallback, use a placeholder
    return `<div class="exercise-thumbnail">
        <img src="${imageUrl}" onerror="this.onerror=null;this.src='./assets/icons/video_placeholder.svg';" alt="${exerciseName}">
        <i class="fas fa-play-circle exercise-video-icon"></i>
    </div>`;
}

// Function to create exercise item
function createExerciseItem(exercise) {
    const thumbnail = generateThumbnail(exercise.video);

    // Determine if we have reps or duration
    const detailText = exercise.reps
        ? `${exercise.reps} reps`
        : exercise.duration
            ? exercise.duration
            : '';

    return `
        <div class="exercise-item" data-video="${exercise.video}">
            ${thumbnail}
            <div class="exercise-name">${exercise.exercise}</div>
            <div class="exercise-details">${detailText}</div>
        </div>
    `;
}

// Function to update the exercise list in the popup
function updateExerciseList(workout) {
    const container = document.getElementById('exercise-list-container');

    if (!workout || !workout.exercises || !container) {
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Add exercise items
    workout.exercises.forEach(exercise => {
        container.innerHTML += createExerciseItem(exercise);
    });

    // Set up exercise video click events
    document.querySelectorAll('.exercise-item').forEach(item => {
        item.addEventListener('click', () => {
            const videoPath = item.getAttribute('data-video');
            if (videoPath) {
                // Preview video logic here - could open in a modal or play inline
                console.log('Play video:', videoPath);
                // Example: window.open(videoPath, '_blank');
            }
        });
    });

    // Initialize the scroll arrows
    setupExerciseListArrows();
}

// Function to handle exercise list scroll arrows
function setupExerciseListArrows() {
    const container = document.getElementById('exercise-list-container');
    const leftArrow = document.querySelector('.exercise-arrow-left');
    const rightArrow = document.querySelector('.exercise-arrow-right');

    if (!container || !leftArrow || !rightArrow) {
        return;
    }

    // Function to update arrow visibility
    function updateArrowVisibility() {
        // Get the current scroll position and dimensions
        const isAtStart = container.scrollLeft <= 0;
        const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
        const hasOverflow = container.scrollWidth > container.clientWidth;

        // Show/hide arrows based on scroll position and if there's overflow
        leftArrow.classList.toggle('hidden', isAtStart);
        rightArrow.classList.toggle('hidden', isAtEnd);

        // Force arrows to be visible if there's overflow content and we're not at the edge
        if (hasOverflow) {
            if (!isAtStart) leftArrow.classList.remove('hidden');
            if (!isAtEnd) rightArrow.classList.remove('hidden');
        }

        console.log("Container width:", container.clientWidth, "Content width:", container.scrollWidth, "Has overflow:", hasOverflow);
    }

    // Initial check - but wait for content to be fully rendered
    setTimeout(updateArrowVisibility, 100);

    // Left arrow click
    leftArrow.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        container.scrollBy({
            left: -250,
            behavior: 'smooth'
        });
    });

    // Right arrow click
    rightArrow.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        container.scrollBy({
            left: 250,
            behavior: 'smooth'
        });
    });

    // Update on scroll
    container.addEventListener('scroll', updateArrowVisibility);

    // Update on window resize
    window.addEventListener('resize', updateArrowVisibility);

    // Use MutationObserver to detect when content changes
    const observer = new MutationObserver(entries => {
        // Wait a short time for the browser to calculate new dimensions
        setTimeout(updateArrowVisibility, 50);
    });

    // Start observing the container for content changes
    observer.observe(container, {
        childList: true,    // Watch for changes to child elements
        subtree: true,      // Watch the entire subtree
        attributes: true    // Watch for attribute changes that might affect size
    });
}

// Function to update the exercise list in the popup
function updateExerciseList(workout) {
    const container = document.getElementById('exercise-list-container');

    if (!workout || !workout.exercises || !container) {
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Add exercise items
    workout.exercises.forEach(exercise => {
        container.innerHTML += createExerciseItem(exercise);
    });

    // Set up exercise video click events
    document.querySelectorAll('.exercise-item').forEach(item => {
        item.addEventListener('click', () => {
            const videoPath = item.getAttribute('data-video');
            if (videoPath) {
                // Preview video logic here
                console.log('Play video:', videoPath);
            }
        });
    });

    // Add a small delay before initializing the scroll arrows to ensure
    // the content is fully rendered and dimensions are calculated
    setTimeout(() => {
        forceArrowCheck();
        setupExerciseListArrows();
    }, 200);
}

// Function to force arrow visibility check after content is loaded
function forceArrowCheck() {
    const container = document.getElementById('exercise-list-container');
    const leftArrow = document.querySelector('.exercise-arrow-left');
    const rightArrow = document.querySelector('.exercise-arrow-right');

    if (!container || !leftArrow || !rightArrow) {
        return;
    }

    // Force recalculation of dimensions
    const hasOverflow = container.scrollWidth > container.clientWidth;
    const isAtStart = container.scrollLeft <= 0;
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;

    // Make sure arrows are visible if content needs scrolling
    if (hasOverflow) {
        if (!isAtStart) leftArrow.classList.remove('hidden');
        if (!isAtEnd) rightArrow.classList.remove('hidden');

        // Additional backup - make right arrow visible if we have multiple items
        // and we're at the start position (common initial state)
        if (isAtStart && container.children.length > 1) {
            rightArrow.classList.remove('hidden');
        }
    }

    console.log("Force check - hasOverflow:", hasOverflow, "Items:", container.children.length);
}

// Touch scroll implementation for the exercise list
function setupExerciseListTouchScroll() {
    const container = document.getElementById('exercise-list-container');

    if (!container) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        container.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile
    container.addEventListener('touchstart', (e) => {
        isDown = true;
        container.classList.add('active');
        startX = e.touches[0].pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('touchend', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    });
}

// Add this to your document.addEventListener('DOMContentLoaded') function
document.addEventListener('DOMContentLoaded', () => {
    initializeWorkoutSections();
    setupExerciseListTouchScroll();

    const defaultCard = document.querySelector('.activity-card-all');
    if (defaultCard) {
        defaultCard.click();
    }
});

// -------------------------------------------------------------------------------------------------------------------------------------- //
// Search functionality
class SearchImplementation {
    constructor() {
        this.searchInput = document.querySelector('.search-bar input');
        this.searchBarSmall = document.querySelector('.search-bar-small');
        this.searchBar = document.querySelector('.search-bar');
        this.searchIcon = document.querySelector('.search-bar .search-icon');
        this.searchBarCloseIcon = document.getElementById('search-close-btn');
        this.dropdownContainer = null;
        this.workoutSections = document.querySelectorAll('section.workout-body');
        this.isDropdownVisible = false;
        this.searchBackdrop = document.querySelector('.search-backdrop');
        this.isMobile = window.innerWidth <= 768;
        this.isSearchOpen = false;
        this.isNavigating = false;

        this.currentQuery = '';
        this.cachedResults = [];

        this.init();
    }

    init() {
        this.createDropdownContainer();
        this.bindEvents();
        this.handleResize();
    }

    createDropdownContainer() {
        if (!this.dropdownContainer) {
            this.dropdownContainer = document.createElement('div');
            this.dropdownContainer.className = 'search-dropdown';
            this.dropdownContainer.style.maxHeight = '300px';
            this.dropdownContainer.style.overflowY = 'auto';
            this.searchInput.parentElement.appendChild(this.dropdownContainer);
            this.dropdownContainer.style.display = 'none';
        }
    }

    handleResize() {
        const wasSearchOpen = this.isSearchOpen;
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                // Switching to mobile
                this.searchBar.classList.remove('show-search');
                this.searchBackdrop.style.display = 'none';
                this.searchBarCloseIcon.style.display = 'none';
                this.hideDropdown();

                if (!wasSearchOpen) {
                    this.searchBarSmall.style.display = 'block';
                }
            } else {
                // Switching to desktop
                if (wasSearchOpen) {
                    // If search was open in mobile, keep it visible in desktop
                    this.searchBar.classList.remove('show-search');
                    this.searchBarSmall.style.display = 'none';
                    if (this.currentQuery.trim() && this.cachedResults.length > 0) {
                        this.updateDropdown(this.cachedResults);
                    }
                } else {
                    // Normal desktop view
                    this.searchBarSmall.style.display = 'none';
                    this.searchBar.classList.remove('show-search');
                }
                this.searchBackdrop.style.display = 'none';
                this.searchBarCloseIcon.style.display = 'none';
            }
        } else if (this.isMobile) {
            if (wasSearchOpen) {
                this.searchBarSmall.style.display = 'none';
                this.searchBar.classList.add('show-search');
                this.searchBarCloseIcon.style.display = 'block';
                if (this.currentQuery.trim() && this.cachedResults.length > 0) {
                    this.updateDropdown(this.cachedResults);
                }
            } else {
                this.searchBarSmall.style.display = 'block';
                this.searchBar.classList.remove('show-search');
            }
        }

    }

    updateDropdownPosition() {
        if (this.isMobile) {
            const inputRect = this.searchInput.getBoundingClientRect();
            this.dropdownContainer.style.position = 'fixed';
            this.dropdownContainer.style.top = `${inputRect.bottom + 10}px`;
            this.dropdownContainer.style.left = '20px';
            this.dropdownContainer.style.right = '20px';
            this.dropdownContainer.style.maxHeight = 'calc(100vh - 150px)';
        } else {
            this.dropdownContainer.style.position = 'absolute';
            this.dropdownContainer.style.top = '100%';
            this.dropdownContainer.style.left = '0';
            this.dropdownContainer.style.right = '0';
            this.dropdownContainer.style.maxHeight = '300px';
        }
    }

    bindEvents() {
        let debounceTimeout;

        window.addEventListener('resize', () => {
            this.handleResize();
        });

        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                this.currentQuery = e.target.value;
                this.handleSearch(e.target.value);
            }, 300);
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.currentQuery.trim() && this.cachedResults.length > 0) {
                this.updateDropdown(this.cachedResults);
            }
        });

        this.searchBarSmall.addEventListener('click', () => {
            this.openMobileSearch();
        });

        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('a[href]');
            if (navLink && navLink.getAttribute('href') !== '#') {
                this.isNavigating = true;
                this.handleNavigation();
            }
        });

        this.searchBarCloseIcon.addEventListener('click', () => {
            this.closeMobileSearch();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileSearch();
            }
        });
    }

    handleNavigation() {
        // Hide search elements during navigation
        this.searchBarSmall.style.display = 'none';
        this.searchBar.classList.remove('show-search');
        this.searchBackdrop.style.display = 'none';
        this.searchBarCloseIcon.style.display = 'none';
        this.hideDropdown();

        // Reset after navigation
        setTimeout(() => {
            this.isNavigating = false;
            if (this.isMobile && !this.isSearchOpen) {
                this.searchBarSmall.style.display = 'block';
            }
        }, 100);
    }

    openMobileSearch() {
        this.isSearchOpen = true;
        this.searchBar.classList.add('show-search');
        this.searchBackdrop.style.display = 'block';
        this.searchBarSmall.style.display = 'none';
        this.searchBarCloseIcon.style.display = 'block';
        this.searchInput.focus();
    }

    closeMobileSearch() {
        this.isSearchOpen = false;
        this.searchBar.classList.remove('show-search');
        this.searchBackdrop.style.display = 'none';
        this.searchBarCloseIcon.style.display = 'none';
        this.hideDropdown();

        if (this.isMobile) {
            this.searchBarSmall.style.display = 'block';
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.hideDropdown();
            return;
        }

        const searchResults = [];
        this.workoutSections.forEach((section) => {
            const sectionTitle = section.querySelector('.section-title')?.textContent;
            const workoutCards = section.querySelectorAll('.workout-card-content');

            workoutCards.forEach((card) => {
                const title = card.querySelector('.workout-title')?.textContent;
                const duration = card.querySelector('.workout-stats span:first-child')?.textContent;
                const calories = card.querySelector('.workout-stats span:last-child')?.textContent;
                const image = card.querySelector('img')?.src;

                if (this.startsWithSearch(query, title)) {
                    searchResults.push({ title, duration, calories, image, section: sectionTitle });
                }

                if (this.isMobile) {
                    const inputRect = this.searchInput.getBoundingClientRect();
                    this.dropdownContainer.style.top = `${inputRect.bottom + 10}px`;
                    this.dropdownContainer.style.left = '20px';
                    this.dropdownContainer.style.right = '20px';
                    this.dropdownContainer.style.maxHeight = 'calc(100vh - 150px)';
                }
            });
        });

        this.cachedResults = searchResults; // Cache the results
        this.updateDropdown(searchResults);
    }

    startsWithSearch(query, title) {
        if (!title) return false;
        return title.toLowerCase().startsWith(query.toLowerCase());
    }

    updateDropdown(results) {
        if (results.length === 0) {
            this.dropdownContainer.innerHTML = `
                <div class="no-results">
                    <p>No workouts found</p>
                </div>
            `;
        } else {
            const visibleResults = results.slice(0, 3);
            const remainingResults = results.slice(3);

            this.dropdownContainer.innerHTML = `
                <div class="visible-results">
                    ${visibleResults.map((result) => this.createResultItem(result)).join('')}
                </div>
                ${remainingResults.length > 0
                    ? `
                    <div class="remaining-results">
                        ${remainingResults.map((result) => this.createResultItem(result)).join('')}
                    </div>
                `
                    : ''
                }
            `;
        }

        this.showDropdown();
    }

    createResultItem(result) {
        return `
            <div class="search-result-item">
                <div class="result-image">
                    <img src="${result.image || './assets/icons/vegan.svg'}" alt="${result.title}">
                </div>
                <div class="result-content">
                    <h3 class="workout-title">${result.title}</h3>
                    <div class="result-meta">
                        <span class="duration">
                            <i class="fas fa-clock"></i> ${result.duration}
                        </span>
                        <span class="calories">
                            <i class="fas fa-fire"></i> ${result.calories}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    showDropdown() {
        this.dropdownContainer.style.display = 'block';
        this.isDropdownVisible = true;
        this.updateDropdownPosition();
    }

    hideDropdown() {
        this.dropdownContainer.style.display = 'none';
        this.isDropdownVisible = false;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SearchImplementation();
});

window.workouts = workouts;
