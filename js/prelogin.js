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
    const page3 = document.getElementById('page3');

    // Set initial state
    let currentSlideIndex = 0;
    let isChangingSlide = false;
    let isInPage3 = false;
    let hasEnteredPage3 = false;
    let lastScrollTime = 0;

    // Initialize first slide as active
    slides[0].classList.add('active');

    // Set the height of page3 to exactly one viewport height
    page3.style.height = '100vh';
    page3.style.overflow = 'hidden'; // Prevent scrolling within page3

    // Make all slides position: absolute so they stack
    slides.forEach(slide => {
        slide.style.position = 'absolute';
        slide.style.top = '0';
        slide.style.left = '0';
        slide.style.width = '100%';
        slide.style.height = '100vh';
        slide.style.opacity = '0';
        slide.style.transition = 'opacity 0.8s ease-in-out';
    });

    // Make active slide visible
    slides[0].style.opacity = '1';

    // Check if user is in page3 section
    function checkIfInPage3() {
        const rect = page3.getBoundingClientRect();
        const pageTop = rect.top;
        const pageBottom = rect.bottom;

        // Consider user in page3 if it's taking up most of the viewport
        return (pageTop < window.innerHeight * 0.3 && pageBottom > window.innerHeight * 0.3);
    }

    // Handle slide changes
    function changeSlide(direction) {
        if (isChangingSlide) return;

        // Calculate target slide index
        const targetIndex = currentSlideIndex + direction;

        // Check if target index is valid
        if (targetIndex < 0) {
            // If trying to go up from the first slide, exit page3
            if (direction < 0) {
                isChangingSlide = true;

                // Scroll to above page3
                window.scrollTo({
                    top: page3.offsetTop - window.innerHeight * 0.5,
                    behavior: 'smooth'
                });

                // Reset flags after animation
                setTimeout(() => {
                    isChangingSlide = false;
                    hasEnteredPage3 = false;
                }, 800);
            }
            return;
        }

        // If trying to go beyond the last slide, exit page3
        if (targetIndex >= totalSlides) {
            isChangingSlide = true;

            // Scroll to below page3
            window.scrollTo({
                top: page3.offsetTop + page3.offsetHeight + 10,
                behavior: 'smooth'
            });

            // Reset flags after animation
            setTimeout(() => {
                isChangingSlide = false;
                hasEnteredPage3 = false;
            }, 800);

            return;
        }

        // Change to the target slide
        isChangingSlide = true;

        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
            slide.style.opacity = '0';
        });

        // Show target slide
        slides[targetIndex].classList.add('active');
        slides[targetIndex].style.opacity = '1';

        // Update current slide index
        currentSlideIndex = targetIndex;

        // Reset changing flag after animation completes
        setTimeout(() => {
            isChangingSlide = false;
        }, 800);
    }

    // Handle wheel events for scrolling through slides
    window.addEventListener('wheel', function (e) {
        // Update whether we're in page3
        isInPage3 = checkIfInPage3();

        // When we first enter page3
        if (isInPage3 && !hasEnteredPage3) {
            e.preventDefault();
            hasEnteredPage3 = true;

            // Fix the scroll position to page3
            window.scrollTo({
                top: page3.offsetTop,
                behavior: 'smooth'
            });

            // If scrolling down, start at first slide
            // If scrolling up, start at last slide
            if (e.deltaY > 0) {
                currentSlideIndex = 0;
            } else {
                currentSlideIndex = totalSlides - 1;
            }

            // Update slide visibility
            slides.forEach((slide, index) => {
                if (index === currentSlideIndex) {
                    slide.classList.add('active');
                    slide.style.opacity = '1';
                } else {
                    slide.classList.remove('active');
                    slide.style.opacity = '0';
                }
            });

            return;
        }

        // When we're in page3, prevent normal scrolling and handle slide changes
        if (isInPage3) {
            e.preventDefault();

            // Don't process if we're currently changing slides or scrolled too recently
            const now = Date.now();
            if (isChangingSlide || now - lastScrollTime < 400) return;

            lastScrollTime = now;

            // Determine scroll direction
            const direction = e.deltaY > 0 ? 1 : -1;

            // Change slide based on direction
            changeSlide(direction);
        }
    }, { passive: false });

    // Mobile touch support
    let touchStartY = 0;
    let touchStartX = 0;
    let isTouchActive = false;

    page3.addEventListener('touchstart', function (e) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isTouchActive = true;
    }, { passive: true });

    page3.addEventListener('touchmove', function (e) {
        if (!isTouchActive || isChangingSlide) {
            e.preventDefault();
            return;
        }

        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const diffY = touchStartY - touchY;
        const diffX = touchStartX - touchX;

        // Only handle significant vertical movements
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
            e.preventDefault();
            isTouchActive = false;

            // Determine direction and change slide
            const direction = diffY > 0 ? 1 : -1;
            changeSlide(direction);
        }
    }, { passive: false });

    page3.addEventListener('touchend', function () {
        isTouchActive = false;
    }, { passive: true });

    // Keyboard navigation
    window.addEventListener('keydown', function (e) {
        // Check if we're in page3
        isInPage3 = checkIfInPage3();
        if (!isInPage3 || isChangingSlide) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            changeSlide(1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            changeSlide(-1);
        }
    });

    // Handle entering page3 from scroll events
    window.addEventListener('scroll', function () {
        // Skip if currently animating
        if (isChangingSlide) return;

        // Update whether we're in page3
        const wasInPage3 = isInPage3;
        isInPage3 = checkIfInPage3();

        // When we enter page3, snap to it
        if (isInPage3 && !wasInPage3 && !hasEnteredPage3) {
            hasEnteredPage3 = true;

            // Determine if we're entering from top or bottom
            const page3Rect = page3.getBoundingClientRect();
            const enteringFromBottom = page3Rect.top < 0;

            // Set initial slide based on entry direction
            if (enteringFromBottom) {
                currentSlideIndex = totalSlides - 1;
            } else {
                currentSlideIndex = 0;
            }

            // Fix scroll position to page3
            window.scrollTo({
                top: page3.offsetTop,
                behavior: 'smooth'
            });

            // Update slide visibility
            slides.forEach((slide, index) => {
                if (index === currentSlideIndex) {
                    slide.classList.add('active');
                    slide.style.opacity = '1';
                } else {
                    slide.classList.remove('active');
                    slide.style.opacity = '0';
                }
            });
        }

        // Reset when we leave page3
        if (!isInPage3 && wasInPage3) {
            hasEnteredPage3 = false;
        }
    });
});