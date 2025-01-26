class WorkoutCarousel {
    constructor() {
        this.carousel = document.querySelector('.workout-carousel');
        this.track = document.querySelector('.workout-slides');
        this.slides = [
            {
                title: "Delicious Creamy Bicep Curls",
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
                duration: "15 Minutes",
                calories: "200 kcal",
                image: "/api/placeholder/600/400"
            },
            {
                title: "Push-up Challenge",
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
                duration: "20 Minutes",
                calories: "250 kcal",
                image: "/api/placeholder/600/400"
            },
            {
                title: "Core Workout",
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
                duration: "25 Minutes",
                calories: "300 kcal",
                image: "/api/placeholder/600/400"
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
// Add interactivity
document.querySelectorAll('.activity-card').forEach(card => {
    const defaultSelection = document.getElementById('default-selection');

    card.style.background = 'white';
    card.style.color = 'black';
    card.style.transition = 'background 0.5s';

    if (card === defaultSelection) {
        card.style.background = '#FFAD84';
        card.style.color = 'white';
    }

    card.addEventListener('mouseover', () => {
        if (card.style.background !== 'rgb(255, 173, 132)') { // Check if not active
            card.style.background = '#FFE4D2'; // Lighter hover color
        }
    });

    card.addEventListener('mouseout', () => {
        if (card.style.background !== 'rgb(255, 173, 132)') { // Check if not active
            card.style.background = 'white'; // Reset to default
        }
    });

    card.addEventListener('click', () => {
        const isActive = card.style.background === '#FFAD84)';
        // Reset all cards to their default state
        document.querySelectorAll('.activity-card').forEach(c => {
            c.style.background = 'white';
            c.style.color = 'black'; // Reset text color
        });

        // If the clicked card was not active, apply the active styles
        if (!isActive) {
            card.style.background = '#FFAD84';
            card.style.color = 'white';
        }
    });
});

// -------------------------------------------------------------------------------------------------------------------------------------- //
// Workout Cards
// Populate workout cards dynamically
const workouts = [
    {
        title: 'Push Up',
        duration: '20 minutes',
        calories: '200Kcal',
        level: 'Beginner',
        image: './assets/icons/vegan.svg',
        type: ['All', 'Weighted', 'Weightfree']
    },
    {
        title: 'Video Fit',
        duration: '15 minutes',
        calories: '100Kcal',
        level: 'Advanced',
        image: '',
        type: ['All', 'Cardio']
    },
    {
        title: 'Pull Up',
        duration: '25 minutes',
        calories: '450Kcal',
        level: 'Intermediate',
        image: '',
        type: ['All', 'Weighted']
    },
    {
        title: 'Yoga Flow',
        duration: '30 minutes',
        calories: '180Kcal',
        level: 'Beginner',
        image: '',
        type: ['All', 'Yoga']
    },
    {
        title: 'Meditation',
        duration: '20 minutes',
        calories: '50Kcal',
        level: 'Intermediate',
        image: '',
        type: ['All', 'Meditation']
    },
    {
        title: 'Meditation',
        duration: '20 minutes',
        calories: '50Kcal',
        level: 'Intermediate',
        image: '',
        type: ['All', 'Meditation']
    },
    {
        title: 'Meditation',
        duration: '20 minutes',
        calories: '50Kcal',
        level: 'Intermediate',
        image: '',
        type: ['All', 'Meditation']
    },
    {
        title: 'Meditation',
        duration: '20 minutes',
        calories: '50Kcal',
        level: 'Intermediate',
        image: '',
        type: ['All', 'Meditation']
    },
    {
        title: 'Meditation',
        duration: '20 minutes',
        calories: '50Kcal',
        level: 'Intermediate',
        image: '',
        type: ['All', 'Meditation']
    }
];

// Helper function to create a workout card
const createWorkoutCard = (workout) => {
    return `
        <div class="workout-card-content">
            <div class="workout-image">
                <img src="${workout.image}" alt="${workout.title}">
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

// Function to filter workouts based on activity type
const filterWorkouts = (type) => {
    return workouts.filter(workout => workout.type.includes(type));
};

document.querySelectorAll('.workout-grid').forEach(grid => {
    const type = grid.closest('section').querySelector('.section-title').textContent.trim();
    const filteredWorkouts = filterWorkouts(type);
    grid.innerHTML = filteredWorkouts.map(createWorkoutCard).join('');
});

document.querySelectorAll('.activity-card').forEach(card => {
    card.addEventListener('click', () => {
        const selectedType = card.querySelector('p').textContent.trim();

        if (selectedType === 'All') {
            document.querySelectorAll('section').forEach(section => {
                section.style.display = '';
            });

            document.querySelectorAll('.workout-grid').forEach(grid => {
                const type = grid.closest('section').querySelector('.section-title')?.textContent.trim();
                const filteredWorkouts = filterWorkouts(type);
                grid.innerHTML = filteredWorkouts.map(createWorkoutCard).join('');
            });
        } else {
            // 隐藏非相关的 section
            document.querySelectorAll('section').forEach(section => {
                const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
                if (['Activity Types', 'Top Picks For You', 'Recently Workout', selectedType].includes(sectionTitle)) {
                    section.style.display = '';
                } else {
                    section.style.display = 'none';
                }
            });

            // 更新相关 section 的内容
            document.querySelectorAll('.workout-grid').forEach(grid => {
                const type = grid.closest('section').querySelector('.section-title')?.textContent.trim();
                if (['Top Picks For You', 'Recently Workout', selectedType].includes(type)) {
                    const filteredWorkouts = filterWorkouts(type);
                    grid.innerHTML = filteredWorkouts.map(createWorkoutCard).join('');
                }
            });
        }
    });
});