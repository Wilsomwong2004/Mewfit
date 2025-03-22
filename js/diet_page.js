let selectedDiet = null;

class DietCarousel {
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
                description: "Push your limits with this advanced, high-intensity cardio workout that's not for the faint of heart. Make you feel suffering and don't want to do again.",
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
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
        }

        this.autoSlideInterval = setInterval(() => {
            if (this.currentIndex < this.slides.length - 1) {
                this.nextSlide();
            } else {
                this.goToSlide(0);
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

            const deltaX = this.touchStartX - touchEndX;
            const deltaY = this.touchStartY - touchEndY;

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
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();

                if (this.isTransitioning) return;

                if (Math.abs(e.deltaX) > 50) {
                    if (e.deltaX > 0) {
                        this.nextSlide();
                    } else {
                        this.previousSlide();
                    }
                }
            }
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

// Helper function to check dark mode
function checkDarkMode() {
    const darkModeToggle = document.querySelector('input[name="dark-mode-toggle"]');
    if (darkModeToggle) {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        darkModeToggle.checked = isDarkMode;
        document.documentElement.classList.toggle('dark-mode', isDarkMode);
        return isDarkMode;
    }
    return false;
}

// Unified function to update card styles
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

// Helper function to create a unified diet card
function createDietCard(diet) {
    const imgSrc = diet.image || './assets/icons/error.svg';

    return `
        <div class="diet-card-content" data-diet-id="${diet.diet_id}" data-diet-type="${diet.type}">
            <div>
                <img src="${imgSrc}" alt="${diet.title}" class="diet-image">
            </div>
            <div class="diet-info">
                <h3 class="diet-title">${diet.title}</h3>
                <span class="diet-level">${diet.level || ''}</span>
                <div class="diet-stats">
                    <span><i class="fas fa-clock"></i> ${diet.duration || '-'}</span>
                    <span><i class="fas fa-fire"></i> ${diet.calories || '0 kcal'}</span>
                </div>
            </div>
        </div>
    `;
}

// Function to filter diets by type
function filterDiets(type) {
    if (type === 'All') return diets;

    return diets.filter(diet => {
        if (!diet.type) return false;
        return diet.type.includes(type.toLowerCase());
    });
}

// Setup click handlers for diet cards
function setupDietCardClick() {
    document.querySelectorAll('.diet-card-content').forEach(card => {
        card.addEventListener('click', () => {
            const dietId = card.getAttribute('data-diet-id');
            if (dietId) {
                window.location.href = `subdiet_page.php?diet_id=${dietId}`;
            }
        });
        card.style.cursor = 'pointer';
    });
}

// Setup scroll arrows for horizontal scrolling
function setupScrollArrows(grid) {
    // Remove any existing wrapper and arrows
    const existingWrapper = grid.parentElement.querySelector('.grid-wrapper');
    if (existingWrapper) {
        const originalGrid = existingWrapper.querySelector('.diet-grid, .workout-grid');
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
        e.stopPropagation();
        grid.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });

    rightArrow.addEventListener('click', (e) => {
        e.stopPropagation();
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

// Initialize diet sections
function initializeDietSections() {
    document.querySelectorAll('section.diet-body').forEach(section => {
        const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
        const dietGrid = section.querySelector('.diet-grid, .diet-history-grid');

        if (dietGrid && diets && diets.length > 0) {
            dietGrid.classList.add('scroll-layout');
            const sectionType = sectionTitle.replace(/^(🔥|⚡|⏰|❤️|💪|🏋️|🧘‍♀️|🧘)?\s*/, '');
            const filteredDiets = filterDiets(sectionType);
            dietGrid.innerHTML = filteredDiets.map(diet => createDietCard(diet)).join('');

            setupScrollArrows(dietGrid);
        }
    });

    setupDietCardClick();
}

// Search implementation
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize activity cards
    const defaultSelection = document.getElementById('default-selection');

    document.querySelectorAll('.activity-card').forEach(card => {
        updateCardStyles(card, card === defaultSelection);

        // Hover effects
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

        // Click handling
        card.addEventListener('click', () => {
            const selectedType = card.querySelector('p').textContent.trim();

            // Reset all cards
            document.querySelectorAll('.activity-card').forEach(c => {
                updateCardStyles(c);
            });

            // Highlight selected card
            const isDark = checkDarkMode();
            if (isDark) {
                card.style.background = '#F97316';
                card.style.border = '1px solid #F97316';
                card.style.color = 'white';
            } else {
                card.style.background = '#FFAD84';
                card.style.color = 'white';
            }

            // Filter sections based on selection
            document.querySelectorAll('section.diet-body').forEach(section => {
                const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
                const dietGrid = section.querySelector('.diet-grid, .diet-history-grid');

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
            });

            // Update diet content
            document.querySelectorAll('.diet-grid, .diet-history-grid').forEach(grid => {
                const section = grid.closest('section');
                const sectionTitle = section.querySelector('.section-title')?.textContent.trim();
                const sectionType = sectionTitle.replace(/^(🔥|⚡|⏰|❤️|💪|🏋️|🧘‍♀️|🧘)?\s*/, '');

                if (['Top Picks For You', 'Recently Meals'].includes(sectionTitle) ||
                    sectionTitle.includes(selectedType) ||
                    selectedType === 'All') {

                    let filterType = selectedType;

                    // Map selected type to database value
                    switch (selectedType) {
                        case 'Vegetarian': filterType = 'vegetarian'; break;
                        case 'Vegan': filterType = 'vegan'; break;
                        case 'Meat': filterType = 'meat'; break;
                        default: filterType = 'All';
                    }

                    const filteredDiets = filterDiets(selectedType === 'All' ? sectionType : filterType);
                    grid.innerHTML = filteredDiets.map(diet => createDietCard(diet)).join('');
                }
            });

            setupDietCardClick();
        });
    });

    // Initialize carousel
    new DietCarousel();

    // Initialize search
    new SearchImplementation();

    // Initialize diet sections
    initializeDietSections();

    // Handle dark mode changes
    window.addEventListener('darkModeChange', () => {
        document.querySelectorAll('.activity-card').forEach(card => {
            const isDefault = card === defaultSelection;
            updateCardStyles(card, isDefault);
        });
    });

    // Set default filter to 'All'
    const defaultCard = document.querySelector('.activity-card-all');
    if (defaultCard) {
        defaultCard.click();
    }
});