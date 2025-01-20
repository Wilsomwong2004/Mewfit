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
        this.init();
    }

    init() {
        this.createSlides();
        this.createDots();
        this.setupInfiniteScroll();
        this.bindEvents();
        this.centerActiveSlide();
    }

    createSlides() {
        // Create three sets of slides for infinite scroll effect
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

    createDots() {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';

        for (let i = 0; i < this.slides.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot';
            dot.addEventListener('click', () => this.goToSlide(i));
            dotsContainer.appendChild(dot);
        }

        this.carousel.appendChild(dotsContainer);
    }

    updateDots() {
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex % this.slides.length);
        });
    }

    updateActiveSlide() {
        const cards = document.querySelectorAll('.workout-card');
        cards.forEach((card, index) => {
            const normalizedIndex = ((index - this.slides.length) % this.slides.length + this.slides.length) % this.slides.length;
            const isActive = normalizedIndex === this.currentIndex % this.slides.length;
            card.classList.toggle('active', isActive);
        });
        this.updateDots();
    }

    setupInfiniteScroll() {
        const slideWidth = this.getSlideWidth();
        const totalSlides = this.slides.length;
        this.track.style.transform = `translateX(-${totalSlides * slideWidth}px)`;
    }

    getSlideWidth() {
        const card = document.querySelector('.workout-card');
        return card.offsetWidth + 20; // width + gap
    }

    bindEvents() {
        let isHovering = false;

        this.carousel.addEventListener('mouseenter', () => {
            isHovering = true;
        });

        this.carousel.addEventListener('mouseleave', () => {
            isHovering = false;
        });

        window.addEventListener('wheel', (e) => {
            if (!isHovering || this.isScrolling) return;

            e.preventDefault();

            // Debounce scroll events
            this.isScrolling = true;
            clearTimeout(this.scrollTimeout);

            if (e.deltaY > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }

            // Reset scroll lock after animation
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 500);
        }, { passive: false });
    }

    goToSlide(index) {
        if (this.isScrolling) return;

        this.isScrolling = true;
        this.currentIndex = index;

        const slideWidth = this.getSlideWidth();
        const newPosition = -((this.slides.length + index) * slideWidth);

        this.track.style.transform = `translateX(${newPosition}px)`;
        this.updateActiveSlide();

        setTimeout(() => {
            this.isScrolling = false;
        }, 500);
    }

    nextSlide() {
        if (this.currentIndex >= this.slides.length - 1) {
            this.currentIndex = 0;
        } else {
            this.currentIndex++;
        }
        this.goToSlide(this.currentIndex);
    }

    previousSlide() {
        if (this.currentIndex <= 0) {
            this.currentIndex = this.slides.length - 1;
        } else {
            this.currentIndex--;
        }
        this.goToSlide(this.currentIndex);
    }

    centerActiveSlide() {
        const slideWidth = this.getSlideWidth();
        this.currentIndex = Math.floor(this.slides.length / 2);
        const newPosition = -(this.slides.length + this.currentIndex) * slideWidth;
        this.track.style.transform = `translateX(${newPosition}px)`;
        this.updateActiveSlide();
    }
}

// Initialize carousel when page loads
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
    { title: 'Push Up', duration: '20 minutes', level: 'Beginner', image:'./assets/icons/vegan.svg'},
    { title: 'Video fit', duration: '15 minutes', level: 'Advanced', image:'' },
    { title: 'Pull Up', duration: '25 minutes', level: 'Intermediate', image:''},
];

const createWorkoutCard = (workout) => {
    return `
        <div class="workout-card-content">
            <div class="workout-image">
                <img src="${workout.image}" alt="Workout-pic">
            </div>
            <div class="workout-info">
                <h3>${workout.title}</h3>
                <div class="workout-stats">
                    <span>${workout.duration}</span>
                    <span>${workout.level}</span>
                </div>
            </div>
        </div>
    `;
};

document.querySelectorAll('.workout-grid').forEach(grid => {
    grid.innerHTML = workouts.map(createWorkoutCard).join('');
});