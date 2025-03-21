//for fade in animation in all pages
const rightAnimation = document.querySelectorAll('.right-fade-in');
const leftAnimation = document.querySelectorAll('.left-fade-in');

function checkScroll() {
    const windowHeight = window.innerHeight;
    rightAnimation.forEach(element => {
        const rightHeight = element.getBoundingClientRect();

        if (rightHeight.top < windowHeight && rightHeight.bottom > 0) {
            element.classList.add('visible');
        }
    })
    leftAnimation.forEach(element => {
        const leftHeight = element.getBoundingClientRect();

        if (leftHeight.top < windowHeight && leftHeight.bottom > 0) {
            element.classList.add('visible');
        }
    })
}

window.addEventListener('scroll', checkScroll);
checkScroll();


//for page 3 color rect animation
document.addEventListener('DOMContentLoaded', function () {
    const slides = document.querySelectorAll('.content-slide');
    const totalSlides = slides.length;

    // Set initial state
    let currentSlideIndex = 0;
    let isScrolling = false;

    slides[0].classList.add('active');

    const page3 = document.getElementById('page3');

    // Track if we're currently within page3
    let isInPage3 = false;

    // Check if user is in page3 section
    function checkIfInPage3() {
        const rect = page3.getBoundingClientRect();
        const isFullyInView = rect.top <= 0 && rect.bottom >= window.innerHeight;
        const isPartiallyInView = rect.top < window.innerHeight && rect.bottom > 0;

        return isFullyInView || (isPartiallyInView && rect.top <= 0);
    }

    // Update scroll position to show current slide properly
    function scrollToCurrentSlide(behavior = 'smooth') {
        const page3Top = page3.offsetTop;
        const slideHeight = window.innerHeight;

        window.scrollTo({
            top: page3Top + (currentSlideIndex * slideHeight),
            behavior: behavior
        });
    }

    // Update active slide
    function updateActiveSlide(index) {
        if (index === currentSlideIndex) return;

        isScrolling = true;

        // Remove active class from current slide
        slides[currentSlideIndex].classList.remove('active');

        // Add active class to new slide
        slides[index].classList.add('active');

        // Update current slide index
        currentSlideIndex = index;

        // Reset scrolling flag after animation completes
        setTimeout(function () {
            isScrolling = false;
        }, 800);
    }

    // Main scroll handler
    window.addEventListener('scroll', function () {
        // Check if we're in page3
        const wasInPage3 = isInPage3;
        isInPage3 = checkIfInPage3();

        // If we just entered page3, scroll to current slide
        if (isInPage3 && !wasInPage3) {
            scrollToCurrentSlide('auto');
            return;
        }

        // If we're not in page3, don't do anything special
        if (!isInPage3) return;

        // If we're in page3, determine which slide should be active
        const page3Top = page3.offsetTop;
        const currentScroll = window.scrollY - page3Top;
        const slideHeight = window.innerHeight;

        const targetSlideIndex = Math.min(
            Math.floor(currentScroll / slideHeight),
            totalSlides - 1
        );

        if (targetSlideIndex >= 0 && !isScrolling) {
            updateActiveSlide(targetSlideIndex);
        }
    });

    // Handle wheel events for smooth navigation between slides
    window.addEventListener('wheel', function (e) {
        // Only handle wheel events when we're in page3
        if (!isInPage3 || isScrolling) return;

        // Get scroll direction
        const direction = e.deltaY > 0 ? 1 : -1;

        // Calculate target slide
        let targetSlide = currentSlideIndex + direction;

        // Ensure target slide is within bounds
        if (targetSlide >= 0 && targetSlide < totalSlides) {
            e.preventDefault();

            // Update active slide
            updateActiveSlide(targetSlide);

            // Scroll to the target slide
            scrollToCurrentSlide();
        }
    }, { passive: false });

    // Handle resize
    window.addEventListener('resize', function () {
        if (isInPage3) {
            scrollToCurrentSlide('auto');
        }
    });
});