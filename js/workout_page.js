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

const filterWorkouts = (type) => {
    return workouts.filter(workout => workout.type.includes(type));
};

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);


function initializeWorkoutSections() {
    document.querySelectorAll('section.workout-body').forEach(section => {
        const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
        const workoutGrid = section.querySelector('.workout-grid');

        if (workoutGrid) {
            workoutGrid.classList.add('scroll-layout');

            const sectionType = sectionTitle.replace(/^(🔥|⚡|⏰|❤️|💪|🏋️|🧘‍♀️|🧘)?\s*/, '');
            const filteredWorkouts = filterWorkouts(sectionType);
            workoutGrid.innerHTML = filteredWorkouts.map(createWorkoutCard).join('');

            section.style.display = '';
        }
    });
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
        });

        document.querySelectorAll('.workout-grid').forEach(grid => {
            const type = grid.closest('section').querySelector('.section-title')?.textContent.trim();
            if (['Top Picks For You', 'Recently Workout'].includes(type) ||
                type.includes(selectedType) ||
                selectedType === 'All') {
                const filteredWorkouts = filterWorkouts(type.replace(/^(🔥|⚡|⏰|❤️|💪|🏋️|🧘‍♀️|🧘)?\s*/, ''));
                grid.innerHTML = filteredWorkouts.map(createWorkoutCard).join('');
            }
        });
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

        this.init();
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