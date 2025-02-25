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
    {
        title: 'Quick Cardio Starter',
        duration: '10 minutes',
        calories: '80Kcal',
        level: 'Beginner',
        description: 'A quick and easy cardio workout to get started.',
        image: '',
        type: ['All', 'Cardio'],
        sets: 1,
        exercises: [
            { exercise: 'March in Place', duration: '3 minutes', video: '' },
            { exercise: 'Side Steps', duration: '3 minutes', video: '' },
            { exercise: 'Low Impact Jumping Jacks', duration: '3 minutes', video: '' },
            { exercise: 'Cool Down Stretches', duration: '1 minutes', video: '' }
        ]
    },
    {
        title: 'Push-Up Basics',
        duration: '15 minutes',
        calories: '150Kcal',
        level: 'Beginner',
        description: 'Learn the basics of push-ups and build strength.',
        image: '',
        video: '',
        type: ['All', 'Weightfree'],
        sets: 3,
        exercises: [
            { exercise: 'Knee Push-ups', reps: 12, video: '' },
            { exercise: 'Incline Push-ups', reps: 10, video: '' },
            { exercise: 'Wide Arm Push-ups', reps: 8, video: '' },
            { exercise: 'Rest', duration: '2 minutes', video: '' }
        ]
    },
    {
        title: 'Yoga for Relaxation',
        duration: '20 minutes',
        calories: '120Kcal',
        level: 'Beginner',
        description: 'A calming yoga session for flexibility and stress relief.',
        image: '',
        video: '',
        type: ['All', 'Yoga'],
        sets: 1,
        exercises: [
            { pose: 'Child’s Pose', duration: '5 minutes', video: '' },
            { pose: 'Cat-Cow Stretch', duration: '5 minutes', video: '' },
            { pose: 'Seated Forward Bend', duration: '5 minutes', video: '' },
            { pose: 'Corpse Pose', duration: '5 minutes', video: '' }
        ]
    },
    {
        title: 'Mindful Breathing',
        duration: '15 minutes',
        calories: '50Kcal',
        level: 'Beginner',
        description: 'Focus on your breath to relax your body and mind.',
        image: '',
        video: '',
        type: ['All', 'Meditation'],
        sets: 1,
        exercises: [
            { activity: 'Breathing Exercise', duration: '5 minutes', video: '' },
            { activity: 'Body Awareness Meditation', duration: '5 minutes', video: '' },
            { activity: 'Closing Reflection', duration: '5 minutes', video: '' }
        ]
    },
    {
        title: 'Core Strength Builder',
        duration: '20 minutes',
        calories: '200Kcal',
        level: 'Intermediate',
        description: 'Strengthen your core with targeted exercises.',
        image: '',
        video: '',
        type: ['All', 'Weightfree'],
        sets: 3,
        exercises: [
            { exercise: 'Plank Hold', duration: '1 minute', video: '' },
            { exercise: 'Bicycle Crunches', reps: 20, video: '' },
            { exercise: 'Leg Raises', reps: 15, video: '' },
            { exercise: 'Side Planks', duration: '30 seconds each side', video: '' },
            { exercise: 'Rest', duration: '2 minutes', video: '' }
        ]
    },
    {
        title: 'Pull-Up Progression',
        duration: '25 minutes',
        calories: '300Kcal',
        level: 'Intermediate',
        description: 'Improve your pull-up form and strength.',
        image: '',
        video: '',
        type: ['All', 'Weighted'],
        sets: 3,
        exercises: [
            { exercise: 'Assisted Pull-ups', reps: 10, video: '' },
            { exercise: 'Chin-ups', reps: 8, video: '' },
            { exercise: 'Negative Pull-ups', reps: 6, video: '' },
            { exercise: 'Wide-grip Pull-ups', reps: 6, video: '' },
            { exercise: 'Rest', duration: '2 minutes', video: '' }
        ]
    },
    {
        title: 'Dynamic Yoga Flow',
        duration: '25 minutes',
        calories: '200Kcal',
        level: 'Intermediate',
        description: 'A more active yoga sequence for flexibility and strength.',
        image: '',
        video: '',
        type: ['All', 'Yoga'],
        sets: 1,
        exercises: [
            { pose: 'Sun Salutations', duration: '10 minutes', video: '' },
            { pose: 'Warrior I and II', duration: '5 minutes', video: '' },
            { pose: 'Triangle Pose', duration: '5 minutes', video: '' },
            { pose: 'Pigeon Pose', duration: '5 minutes', video: '' }
        ]
    },
    {
        title: 'Cardio Extreme',
        duration: '20 minutes',
        calories: '300Kcal',
        level: 'Advanced',
        description: 'A high-intensity cardio session for experienced athletes.',
        image: '',
        video: '',
        type: ['All', 'Cardio'],
        sets: 3,
        exercises: [
            { exercise: 'Sprint Intervals', duration: '4 minutes', video: '' },
            { exercise: 'Burpees', duration: 'llenge', video: '' },
            { exercise: 'Jump Squats', duration: '4 minutes', video: '' },
            { exercise: 'Mountain Climbers', duration: '4 minutes', video: '' },
            { exercise: 'Cool Down', duration: '4 minutes', video: '' }
        ]
    },
    {
        title: 'Strength Max',
        duration: '30 minutes',
        calories: '350Kcal',
        level: 'Advanced',
        description: 'Build maximum strength with a challenging routine.',
        image: '',
        video: '',
        type: ['All', 'Weighted'],
        sets: 3,
        exercises: [
            { exercise: 'Deadlifts', reps: 10, video: '' },
            { exercise: 'Barbell Squats', reps: 10, video: '' },
            { exercise: 'Bench Press', reps: 8, video: '' },
            { exercise: 'Pull-ups', reps: 10, video: '' },
            { exercise: 'Rest', duration: '3 minutes', video: '' }
        ]
    },
    {
        title: 'Advanced Yoga Challenge',
        duration: '30 minutes',
        calories: '250Kcal',
        level: 'Advanced',
        description: 'A powerful yoga sequence for flexibility and strength.',
        image: '',
        video: '',
        type: ['All', 'Yoga'],
        sets: 1,
        exercises: [
            { pose: 'Handstand Practice', duration: '10 minutes', video: '' },
            { pose: 'Crow Pose', duration: '5 minutes', video: '' },
            { pose: 'Wheel Pose', duration: '10 minutes', video: '' },
            { pose: 'Savasana', duration: '5 minutes', video: '' }
        ]
    }
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

                // Show popup
                popup.classList.add('active');
            });
        });
    });
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
