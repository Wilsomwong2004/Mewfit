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
                image: "/api/placeholder/400/300"
            },
            {
                title: "Cool",
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
                duration: "15 Minutes",
                calories: "200 kcal",
                image: "/api/placeholder/400/300"
            },
            {
                title: "I like ",
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
                duration: "15 Minutes",
                calories: "200 kcal",
                image: "/api/placeholder/400/300"
            },
        ];

        this.currentIndex = 0;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.scrollAccumulator = 0;

        // Add wrapper div for better positioning
        this.createWrapper();
        this.init();
    }

    init() {
        this.createSlides();
        this.createDots();
        this.setupInfiniteScroll();
        this.bindEvents();
        this.centerActiveSlide();

        // Initial resize handler call
        this.handleResize();

        // Add resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    createSlides() {
        const slidesHTML = this.slides.map(slide => this.createSlideHTML(slide)).join('');
        this.track.innerHTML = slidesHTML + slidesHTML + slidesHTML;
        this.updateActiveSlide();
    }

    createSlideHTML(slide) {
        return `
            <div class="workout-card">
                <div class="card-content">
                    <h3>${slide.title}</h3>
                    <p>${slide.description}</p>
                    <div class="workout-meta">
                        <span><i class="fas fa-clock"></i> ${slide.duration}</span>
                        <span><i class="fas fa-fire"></i> ${slide.calories}</span>
                    </div>
                    <button class="start-workout">Start Workout</button>
                </div>
                <div class="card-image">
                    <img src="${slide.image}" alt="Workout">
                </div>
            </div>
        `;
    }

    createWrapper() {
        // Create wrapper div
        const wrapper = document.createElement('div');
        wrapper.className = 'carousel-wrapper';
        wrapper.style.cssText = `
            position: relative;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        `;

        // Move carousel into wrapper
        this.carousel.parentNode.insertBefore(wrapper, this.carousel);
        wrapper.appendChild(this.carousel);

        // Update carousel styles
        this.carousel.style.cssText = `
            position: relative;
            width: 100%;
            overflow: hidden;
            padding-bottom: 40px; /* Space for dots */
        `;

        // Update track styles
        this.track.parentElement.style.cssText = `
            position: relative;
            width: 100%;
            overflow: hidden;
        `;
    }

    createDots() {
        const existingDots = this.carousel.querySelector('.carousel-dots');
        if (existingDots) {
            existingDots.remove();
        }

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';
        dotsContainer.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 1000;
            padding: 10px;
        `;

        for (let i = 0; i < this.slides.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot';
            dot.style.cssText = `
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: #ccc;
                cursor: pointer;
                transition: background-color 0.3s;
            `;
            dot.addEventListener('click', () => this.goToSlide(i));
            dotsContainer.appendChild(dot);
        }

        this.carousel.appendChild(dotsContainer);
    }

    handleResize() {
        // Reset track position
        this.centerActiveSlide();

        // Adjust container height to match content
        const activeCard = document.querySelector('.workout-card');
        if (activeCard) {
            this.carousel.style.height = `${activeCard.offsetHeight + 50}px`; // Add padding for dots
        }

        // Force recalculation of slide positions
        this.updateActiveSlide();
    }

    bindEvents() {
        // Trackpad/Mouse wheel horizontal scroll
        this.carousel.addEventListener('wheel', (e) => {
            e.preventDefault();

            if (this.isScrolling) return;

            // Accumulate scroll delta
            this.scrollAccumulator += e.deltaX || e.deltaY;

            // Threshold for scroll action
            const scrollThreshold = 50;

            if (Math.abs(this.scrollAccumulator) > scrollThreshold) {
                if (this.scrollAccumulator > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
                // Reset accumulator after action
                this.scrollAccumulator = 0;
            }
        }, { passive: false });

        // Touch events
        let touchStartX = 0;
        let touchStartY = 0;

        this.carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.carousel.addEventListener('touchmove', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;

            // Calculate horizontal and vertical distance
            const xDiff = touchStartX - touchEndX;
            const yDiff = touchStartY - touchEndY;

            // Only handle horizontal swipes
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                e.preventDefault();
            }
        }, { passive: false });

        this.carousel.addEventListener('touchend', (e) => {
            if (!touchStartX) return;

            const touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchStartX - touchEndX;

            if (Math.abs(swipeDistance) > 50) {
                if (swipeDistance > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }

            touchStartX = 0;
            touchStartY = 0;
        });
    }

    setupInfiniteScroll() {
        const slideWidth = this.getSlideWidth();
        const totalSlides = this.slides.length;
        this.track.style.transform = `translateX(-${totalSlides * slideWidth}px)`;
    }

    getSlideWidth() {
        const card = document.querySelector('.workout-card');
        return card ? card.offsetWidth + 20 : 0; // width + gap
    }

    updateActiveSlide() {
        const cards = document.querySelectorAll('.workout-card');
        cards.forEach((card, index) => {
            const normalizedIndex = ((index - this.slides.length) % this.slides.length + this.slides.length) % this.slides.length;
            const isActive = normalizedIndex === this.currentIndex % this.slides.length;
            card.style.opacity = isActive ? '1' : '0.5';
            card.style.transform = isActive ? 'scale(1)' : 'scale(0.9)';
        });
        this.updateDots();
    }

    updateDots() {
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.style.backgroundColor = index === this.currentIndex % this.slides.length ? '#FFAD84' : '#ccc';
        });
    }

    centerActiveSlide() {
        const slideWidth = this.getSlideWidth();
        if (slideWidth === 0) return;

        const offset = (this.slides.length + this.currentIndex) * slideWidth;
        this.track.style.transform = `translateX(-${offset}px)`;
        this.updateActiveSlide();
    }

    goToSlide(index) {
        if (this.isScrolling) return;

        this.isScrolling = true;
        this.currentIndex = index;
        this.centerActiveSlide();

        setTimeout(() => {
            this.isScrolling = false;
        }, 500);
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.goToSlide(this.currentIndex);
    }

    previousSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(this.currentIndex);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WorkoutCarousel();
});

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

// Populate workout cards dynamically
const workouts = [
    { title: 'Push Up', duration: '20 minutes', calories: '200Kcal', level: 'Beginner', image: './assets/icons/vegan.svg' },
    { title: 'Video fit', duration: '15 minutes', calories: '100Kcal', level: 'Advanced', image: '' },
    { title: 'Pull Up', duration: '25 minutes', calories: '450Kcal', level: 'Intermediate', image: '' },
];

const createWorkoutCard = (workout) => {
    return `
        <div class="workout-card-content">
            <div class="workout-image">
                <img src="${workout.image}" alt="Workout-pic">
            </div>
            <div class="workout-info">
                <h3>${workout.title}</h3>
                <span class="workout-level">${workout.level}</span>
                <div class="workout-stats">
                    <span><i class="fas fa-clock"></i> ${workout.duration}</span>
                    <span><i class="fas fa-fire"></i> ${workout.calories}</span>
                </div>
            </div>
        </div>
    `;
};

document.querySelectorAll('.workout-grid').forEach(grid => {
    grid.innerHTML = workouts.map(createWorkoutCard).join('');
});