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
document.querySelectorAll('.activity-card').forEach(card => {
    const defaultSelection = document.getElementById('default-selection');

    function checkDarkMode() {
        const darkModeToggle = document.querySelector('input[name="dark-mode-toggle"]');
        if (darkModeToggle) {
            // Set initial state based on localStorage
            const isDarkMode = localStorage.getItem('darkMode') === 'true';
            darkModeToggle.checked = isDarkMode;
            document.documentElement.classList.toggle('dark-mode', isDarkMode);
        }
    }

    function updateCardStyles(card, isDefault = false) {
        const isDark = checkDarkMode();

        if (isDark) {
            card.style.background = isDefault ? '#F97316' : '#4d4d4e';
            card.style.color = '#E5E7EB';
            card.style.border = isDefault ? '1px solid #F97316' : '1px solid #374151';
        } else {
            card.style.background = isDefault ? '#FFAD84' : 'white';
            card.style.color = isDefault ? 'white' : 'black';
            card.style.border = '1px solid #E5E7EB';
        }
        card.style.transition = 'all 0.3s ease';
    }

    updateCardStyles(card, card === defaultSelection);

    card.addEventListener('mouseover', () => {
        const isDark = checkDarkMode();
        const isActive = isDark ?
            (card.style.background === 'rgb(249, 115, 22)') :
            (card.style.background === 'rgb(255, 173, 132)');

        if (!isActive) {
            card.style.background = isDark ? '#374151' : '#FFE4D2';
        }
    });

    card.addEventListener('mouseout', () => {
        const isDark = checkDarkMode();
        const isActive = isDark ?
            (card.style.background === 'rgb(249, 115, 22)') :
            (card.style.background === 'rgb(255, 173, 132)');

        if (!isActive) {
            updateCardStyles(card);
        }
    });

    // Handle click states
    card.addEventListener('click', () => {
        const isDark = checkDarkMode();
        const isActive = isDark ?
            (card.style.background === 'rgb(249, 115, 22)') :
            (card.style.background === 'rgb(255, 173, 132)');

        document.querySelectorAll('.activity-card').forEach(c => {
            updateCardStyles(c);
        });

        if (!isActive) {
            if (isDark) {
                card.style.background = '#F97316';
                card.style.border = '1px solid #F97316';
                card.style.color = 'white';
            } else {
                card.style.background = '#FFAD84';
                card.style.color = 'white';
            }
        }
    });

    window.addEventListener('darkModeChange', (event) => {
        const isDefault = card === defaultSelection;
        updateCardStyles(card, isDefault);
    });

    document.addEventListener('DOMContentLoaded', () => {
        updateCardStyles(card, card === defaultSelection);
    });
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
        video: '',
        type: ['All', 'Cardio'],
        sets: 1,
        exercises: [
            { exercise: 'March in Place', duration: '3 minutes' },
            { exercise: 'Side Steps', duration: '3 minutes' },
            { exercise: 'Low Impact Jumping Jacks', duration: '3 minutes' },
            { exercise: 'Cool Down Stretches', duration: '1 minute' }
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
            { exercise: 'Knee Push-ups', reps: 12 },
            { exercise: 'Incline Push-ups', reps: 10 },
            { exercise: 'Wide Arm Push-ups', reps: 8 },
            { exercise: 'Rest', duration: '2 minutes' }
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
            { pose: 'Child’s Pose', duration: '5 minutes' },
            { pose: 'Cat-Cow Stretch', duration: '5 minutes' },
            { pose: 'Seated Forward Bend', duration: '5 minutes' },
            { pose: 'Corpse Pose', duration: '5 minutes' }
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
            { activity: 'Breathing Exercise', duration: '5 minutes' },
            { activity: 'Body Awareness Meditation', duration: '5 minutes' },
            { activity: 'Closing Reflection', duration: '5 minutes' }
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
            { exercise: 'Plank Hold', duration: '1 minute' },
            { exercise: 'Bicycle Crunches', reps: 20 },
            { exercise: 'Leg Raises', reps: 15 },
            { exercise: 'Side Planks', duration: '30 seconds each side' },
            { exercise: 'Rest', duration: '2 minutes' }
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
            { exercise: 'Assisted Pull-ups', reps: 10 },
            { exercise: 'Chin-ups', reps: 8 },
            { exercise: 'Negative Pull-ups', reps: 6 },
            { exercise: 'Wide-grip Pull-ups', reps: 6 },
            { exercise: 'Rest', duration: '2 minutes' }
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
            { pose: 'Sun Salutations', duration: '10 minutes' },
            { pose: 'Warrior I and II', duration: '5 minutes' },
            { pose: 'Triangle Pose', duration: '5 minutes' },
            { pose: 'Pigeon Pose', duration: '5 minutes' }
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
            { exercise: 'Sprint Intervals', duration: '4 minutes' },
            { exercise: 'Burpees', duration: 'llenge' },
            { exercise: 'Jump Squats', duration: '4 minutes' },
            { exercise: 'Mountain Climbers', duration: '4 minutes' },
            { exercise: 'Cool Down', duration: '4 minutes' }
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
            { exercise: 'Deadlifts', reps: 10 },
            { exercise: 'Barbell Squats', reps: 10 },
            { exercise: 'Bench Press', reps: 8 },
            { exercise: 'Pull-ups', reps: 10 },
            { exercise: 'Rest', duration: '3 minutes' }
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
            { pose: 'Handstand Practice', duration: '10 minutes' },
            { pose: 'Crow Pose', duration: '5 minutes' },
            { pose: 'Wheel Pose', duration: '10 minutes' },
            { pose: 'Savasana', duration: '5 minutes' }
        ]
    }
];


// Helper function to create a workout card
const createWorkoutCard = (workout, index) => {
    return `
        <div class="workout-card-content" data-workout-index="${index}" data-workout-type="${workout.type.join(',')}" data-workout-title="${workout.title}">
            <div class="workout-image">
                <img src="${workout.image || './assets/default-workout.jpg'}" alt="${workout.title}">
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


const filterWorkouts = (type) => {
    if (type === 'All') return workouts;
    return workouts.filter(workout => workout.type.includes(type));
};

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Function to update the popup level display
function updatePopupLevel(level) {
    const popupLevel = document.getElementById('popup-level');
    const currentMeter = popupLevel.querySelector('.difficulty-meter');

    // Remove existing meter if it exists
    if (currentMeter) {
        currentMeter.remove();
    }

    // Create difficulty meter container
    const meterContainer = document.createElement('div');
    meterContainer.className = `difficulty-meter ${level.toLowerCase()}`;

    // Create three bars
    for (let i = 0; i < 3; i++) {
        const bar = document.createElement('div');
        bar.className = 'difficulty-bar';
        meterContainer.appendChild(bar);
    }

    // Determine how many bars to fill based on level
    let activeBars = 0;
    switch (level.toLowerCase()) {
        case 'beginner':
            activeBars = 1;
            break;
        case 'intermediate':
            activeBars = 2;
            break;
        case 'advanced':
            activeBars = 3;
            break;
    }

    // Activate the appropriate number of bars
    const bars = meterContainer.querySelectorAll('.difficulty-bar');
    for (let i = 0; i < activeBars; i++) {
        bars[i].classList.add('active');
    }

    // Replace the content of popup-level
    popupLevel.innerHTML = '';
    popupLevel.appendChild(meterContainer);
}

// Modify your existing setupWorkoutCardClick function
function setupWorkoutCardClick() {
    document.querySelectorAll('.workout-card-content').forEach(card => {
        card.addEventListener('click', () => {
            const workoutIndex = parseInt(card.getAttribute('data-workout-index'));
            const workoutTitle = card.getAttribute('data-workout-title');
            const workout = workouts.find(w => w.title === workoutTitle);

            if (!workout) {
                console.error('Workout not found:', workoutTitle);
                return;
            }

            selectedWorkout = workout;

            // Update popup content
            const workoutImage = document.getElementById('popup-workout-image');
            workoutImage.src = workout.image || './assets/default-workout.jpg';
            workoutImage.alt = `${workout.title} Image`;

            // Set other details
            document.getElementById('popup-title').textContent = workout.title.toUpperCase();
            document.getElementById('popup-desc').textContent = workout.description;
            document.getElementById('popup-duration').textContent = workout.duration.match(/\d+/)[0];
            document.getElementById('popup-calories').textContent = workout.calories.match(/\d+/)[0];

            // Update the level display with the new meter
            updatePopupLevel(workout.level);

            // Show popup
            document.getElementById('popup-container').classList.add('active');
        });
    });

    // Setup popup close handlers
    document.getElementById('popup-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('popup-close') || e.target === document.getElementById('popup-container')) {
            document.getElementById('popup-container').classList.remove('active');
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
            workoutGrid.classList.add('scroll-layout');
            const sectionType = sectionTitle.replace(/^(🔥|⚡|⏰|❤️|💪|🏋️|🧘‍♀️|🧘)?\s*/, '');
            const filteredWorkouts = filterWorkouts(sectionType);
            workoutGrid.innerHTML = filteredWorkouts.map((workout, index) =>
                createWorkoutCard(workout, index)
            ).join('');
        }
    });

    setupWorkoutCardClick();
}

document.querySelectorAll('.activity-card').forEach(card => {
    document.addEventListener('DOMContentLoaded', () => {
        initializeWorkoutSections();

        const defaultCard = document.querySelector('.activity-card-all');
        if (defaultCard) {
            defaultCard.click();
        }
    });

    card.addEventListener('click', () => {
        const selectedType = card.querySelector('p').textContent.trim();

        document.querySelectorAll('section.workout-body').forEach(section => {
            const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
            const workoutGrid = section.querySelector('.workout-grid');

            if (selectedType === 'All') {
                section.style.display = '';
                if (workoutGrid) {
                    workoutGrid.classList.add('scroll-layout');
                    workoutGrid.classList.remove('grid-layout');
                }
            } else {
                if (['Activity Types', 'Top Picks For You', 'Recently Workout'].includes(sectionTitle)) {
                    section.style.display = '';
                    if (workoutGrid && ['Top Picks For You', 'Recently Workout'].includes(sectionTitle)) {
                        workoutGrid.classList.add('scroll-layout');
                        workoutGrid.classList.remove('grid-layout');
                    }
                } else if (sectionTitle.includes(selectedType)) {
                    section.style.display = '';
                    if (workoutGrid) {
                        workoutGrid.classList.add('grid-layout');
                        workoutGrid.classList.remove('scroll-layout');
                    }
                } else {
                    section.style.display = 'none';
                }
            }
            setupWorkoutCardClick();
        });

        document.querySelectorAll('.workout-grid').forEach(grid => {
            const section = grid.closest('section');
            const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
            const sectionType = sectionTitle.replace(/^(🔥|⚡|⏰|❤️|💪|🏋️|🧘‍♀️|🧘)?\s*/, '');

            // Only update content if section is relevant
            if (['Top Picks For You', 'Recently Workout'].includes(sectionTitle) ||
                sectionTitle.includes(selectedType) ||
                selectedType === 'All') {

                const filteredWorkouts = filterWorkouts(selectedType === 'All' ? sectionType : selectedType);

                // Use the enhanced createWorkoutCard with proper indexing
                grid.innerHTML = filteredWorkouts.map((workout, index) =>
                    createWorkoutCard(workout, index)
                ).join('');
            }
        });

        // Reattach click handlers to newly created workout cards
        setupWorkoutCardClick();
    });
});

// -------------------------------------------------------------------------------------------------------------------------------------- //
// Search functionality
class SearchImplementation {
    constructor() {
        this.searchInput = document.querySelector('.search-bar input');
        this.searchBarSmall = document.querySelector('.search-bar-small');
        this.dropdownContainer = null;
        this.workoutSections = document.querySelectorAll('section.workout-body');
        this.isDropdownVisible = false;
        this.searchBackdrop = document.querySelector('.search-backdrop');
        this.isMobile = window.innerWidth <= 768;

        this.init();

        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
        });
    }

    init() {
        this.createDropdownContainer();
        this.bindEvents();
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

    bindEvents() {
        let debounceTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });

        this.searchBarSmall.addEventListener('click', () => {
            const searchBar = document.querySelector('.search-bar');
            searchBar.classList.toggle('show-search');
            searchBar.querySelector('input').focus();
        });

        document.addEventListener('click', (e) => {
            if (!this.searchInput.parentElement.contains(e.target)) {
                this.hideDropdown();
            }
        });

        this.searchBarSmall.addEventListener('click', () => {
            const searchBar = document.querySelector('.search-bar');
            searchBar.classList.add('show-search');
            this.searchBackdrop.style.display = 'block';
            searchBar.querySelector('input').focus();
        });

        this.searchBackdrop.addEventListener('click', () => {
            this.closeMobileSearch();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileSearch();
            }
        });
    }

    closeMobileSearch() {
        const searchBar = document.querySelector('.search-bar');
        searchBar.classList.remove('show-search');
        this.searchBackdrop.style.display = 'none';
        this.hideDropdown();
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.hideDropdown();
            return;
        }

        const searchResults = [];
        this.workoutSections.forEach(section => {
            const sectionTitle = section.querySelector('.section-title')?.textContent;
            const workoutCards = section.querySelectorAll('.workout-card-content');

            workoutCards.forEach(card => {
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
                    ${visibleResults.map(result => this.createResultItem(result)).join('')}
                </div>
                ${remainingResults.length > 0 ? `
                    <div class="remaining-results">
                        ${remainingResults.map(result => this.createResultItem(result)).join('')}
                    </div>
                ` : ''}
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
                            <i class="fas fa-fire"></i>
                            ${result.calories}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    showDropdown() {
        this.dropdownContainer.style.display = 'block';
        this.isDropdownVisible = true;
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