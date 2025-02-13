let selecteddiet = null;
class dietCarousel {
    constructor() {
        this.carousel = document.querySelector('.diet-carousel');
        this.track = document.querySelector('.diet-slides');
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
                description: "This fast-paced, high-energy cardio session is perfect for those with a busy schedule. Designed to elevate your heart rate and improve cardiovascular health in just 10 minutes.",
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
        setTimeout(() => {
            this.startAutoSlide();
        }, 500);
    }

    createSlides() {
        const slidesHTML = this.slides.map((slide, index) => `
            <div class="diet-slide" data-index="${index}">
                <div class="diet-card">
                    <div class="card-content">
                        <h3>${slide.title}</h3>
                        <p>${slide.description}</p>
                        <div class="diet-meta">
                            <span class="duration">
                                <i class="fas fa-clock"></i> ${slide.duration}
                            </span>
                            <span class="calories">
                                <i class="fas fa-fire"></i> ${slide.calories}
                            </span>
                        </div>
                        <button class="start-diet">Start Diet</button>
                    </div>
                    <div class="seperate-diet-transparent"></div>
                    <div class="card-image">
                        <img src="${slide.image}" alt="diet">
                    </div>
                </div>
            </div>
        `).join('');

        this.track.innerHTML = slidesHTML;
        this.slides = document.querySelectorAll('.diet-slide');
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
    new dietCarousel();
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
// Diet Cards
const diets = [
    {
        title: 'Quick Cardio Starter',
        duration: '10 minutes',
        calories: '80Kcal',
        level: 'Beginner',
        description: 'A quick and easy cardio workout to get started.',
        image: '',
        video: '',
        type: ['All', 'Vegetarian'],
    },
    {
        title: 'Push-Up Basics',
        duration: '15 minutes',
        calories: '150Kcal',
        level: 'Beginner',
        description: 'Learn the basics of push-ups and build strength.',
        image: '',
        video: '',
        type: ['All', 'Vegan'],
    },
    {
        title: 'Yoga for Relaxation',
        duration: '20 minutes',
        calories: '120Kcal',
        level: 'Beginner',
        description: 'A calming yoga session for flexibility and stress relief.',
        image: '',
        video: '',
        type: ['All', 'Vegan'],
    },
    {
        title: 'Mindful Breathing',
        duration: '15 minutes',
        calories: '50Kcal',
        level: 'Beginner',
        description: 'Focus on your breath to relax your body and mind.',
        image: '',
        video: '',
        type: ['All', 'Vegan'],
    },
    {
        title: 'Core Strength Builder',
        duration: '20 minutes',
        calories: '200Kcal',
        level: 'Intermediate',
        description: 'Strengthen your core with targeted exercises.',
        image: '',
        video: '',
        type: ['All', 'Vegan'],
    },
    {
        title: 'Pull-Up Progression',
        duration: '25 minutes',
        calories: '300Kcal',
        level: 'Intermediate',
        description: 'Improve your pull-up form and strength.',
        image: '',
        video: '',
        type: ['All', 'Meat'],
    },
    {
        title: 'Dynamic Yoga Flow',
        duration: '25 minutes',
        calories: '200Kcal',
        level: 'Intermediate',
        description: 'A more active yoga sequence for flexibility and strength.',
        image: '',
        video: '',
        type: ['All', 'Meat'],
    },
    {
        title: 'Cardio Extreme',
        duration: '20 minutes',
        calories: '300Kcal',
        level: 'Advanced',
        description: 'A high-intensity cardio session for experienced athletes.',
        image: '',
        video: '',
        type: ['All', 'Vegetarian'],
    },
    {
        title: 'Strength Max',
        duration: '30 minutes',
        calories: '350Kcal',
        level: 'Advanced',
        description: 'Build maximum strength with a challenging routine.',
        image: '',
        video: '',
        type: ['All', 'Meat'],
    },
    {
        title: 'Advanced Yoga Challenge',
        duration: '30 minutes',
        calories: '250Kcal',
        level: 'Advanced',
        description: 'A powerful yoga sequence for flexibility and strength.',
        image: '',
        video: '',
        type: ['All', 'Meat'],
    }
];


// Helper function to create a diet card
const createDietCard = (diet, index) => {
    return `
        <div class="diet-card-content" data-diet-index="${index}" data-diet-type="${diet.type.join(',')}" data-diet-title="${diet.title}">
            <div class="diet-image">
                <img src="${diet.image || './assets/default-workout.jpg'}" alt="${diet.title}">
            </div>
            <div class="diet-info">
                <h3 class="diet-title">${diet.title}</h3>
                <span class="diet-level">${diet.level}</span>
                <div class="diet-stats">
                    <span><i class="fas fa-clock"></i> ${diet.duration}</span>
                    <span><i class="fas fa-fire"></i> ${diet.calories}</span>
                </div>
            </div>
        </div>
    `;
};


const filterDiets = (type) => {
    if (type === 'All') return diets;
    return diets.filter(diet => diet.type.includes(type));
};

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

function setupDietCardClick() {
    document.querySelectorAll('.diet-card-content').forEach(card => {
        card.addEventListener('click', () => {
            const dietIndex = parseInt(card.getAttribute('data-diet-index'));
            const diettTitle = card.getAttribute('data-diet-title');
            const diet = diets.find(w => w.title === dietTitle);

            if (!diet) {
                console.error('Diet not found:', dietTitle);
                return;
            }

            selectedDiet = diet;
        });
    });
}


function initializeDietSections() {
    document.querySelectorAll('section.diet-body').forEach(section => {
        const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
        const dietGrid = section.querySelector('.diet-grid');

        if (dietGrid) {
            dietGrid.classList.add('scroll-layout');
            const sectionType = sectionTitle.replace(/^(🔥|⚡|⏰|❤️|💪|🏋️|🧘‍♀️|🧘)?\s*/, '');
            const filteredDiets = filterDiets(sectionType);
            dietGrid.innerHTML = filteredDiets.map((diet, index) =>
                createDietCard(diet, index)
            ).join('');
        }
    });

    setupDietCardClick();
}

document.querySelectorAll('.activity-card').forEach(card => {
    document.addEventListener('DOMContentLoaded', () => {
        initializeDietSections();

        const defaultCard = document.querySelector('.activity-card-all');
        if (defaultCard) {
            defaultCard.click();
        }
    });

    card.addEventListener('click', () => {
        const selectedType = card.querySelector('p').textContent.trim();

        document.querySelectorAll('section.diet-body').forEach(section => {
            const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
            const dietGrid = section.querySelector('.diet-grid');

            if (selectedType === 'All') {
                section.style.display = '';
                if (dietGrid) {
                    dietGrid.classList.add('scroll-layout');
                    dietGrid.classList.remove('grid-layout');
                }
            } else {
                if (['Categories', 'Top Picks For You', 'Recently Meals'].includes(sectionTitle)) {
                    section.style.display = '';
                    if (dietGrid && ['Top Picks For You', 'Recently Meals'].includes(sectionTitle)) {
                        dietGrid.classList.add('scroll-layout');
                        dietGrid.classList.remove('grid-layout');
                    }
                } else if (sectionTitle.includes(selectedType)) {
                    section.style.display = '';
                    if (dietGrid) {
                        dietGrid.classList.add('grid-layout');
                        dietGrid.classList.remove('scroll-layout');
                    }
                } else {
                    section.style.display = 'none';
                }
            }
            setupDietCardClick();
        });

        document.querySelectorAll('.diet-grid').forEach(grid => {
            const section = grid.closest('section');
            const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
            const sectionType = sectionTitle.replace(/^(🔥|⚡|⏰|❤️|💪|🏋️|🧘‍♀️|🧘)?\s*/, '');

            // Only update content if section is relevant
            if (['Top Picks For You', 'Recently Meals'].includes(sectionTitle) ||
                sectionTitle.includes(selectedType) ||
                selectedType === 'All') {

                const filteredDiets = filterDiets(selectedType === 'All' ? sectionType : selectedType);

                // Use the enhanced createWorkoutCard with proper indexing
                grid.innerHTML = filteredDiets.map((diet, index) =>
                    createDietCard(diet, index)
                ).join('');
            }
        });

        // Reattach click handlers to newly created workout cards
        setupDietCardClick();
    });
});

// -------------------------------------------------------------------------------------------------------------------------------------- //
// Search functionality
class SearchImplementation {
    constructor() {
        this.searchInput = document.querySelector('.search-bar input');
        this.searchBarSmall = document.querySelector('.search-bar-small');
        this.dropdownContainer = null;
        this.dietSections = document.querySelectorAll('section.diet-body');
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
        this.dietSections.forEach(section => {
            const sectionTitle = section.querySelector('.section-title')?.textContent;
            const dietCards = section.querySelectorAll('.diet-card-content');

            dietCards.forEach(card => {
                const title = card.querySelector('.diet-title')?.textContent;
                const duration = card.querySelector('.diet-stats span:first-child')?.textContent;
                const calories = card.querySelector('.diet-stats span:last-child')?.textContent;
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
                    <p>No diets found</p>
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
                    <h3 class="diet-title">${result.title}</h3>
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