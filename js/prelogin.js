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
const rectangle = document.getElementById('color-rect1');
const rectangle2 = document.getElementById('color-rect2');
const page3 = document.getElementById('page3');

window.addEventListener('scroll', function() {
    const page3Rect = page3.getBoundingClientRect(); // position of page 3
    const viewportHeight = window.innerHeight; 

    // Calculate the amount of page 3 that is visible
    const visibleHeight = Math.min(viewportHeight - 250, page3Rect.bottom) - Math.max(-200, page3Rect.top);    
    const page3Height = page3Rect.height;

    // Calculate the exposure percentage
    const exposurePercentage = Math.max(0, Math.min(1, visibleHeight / page3Height));

    // Map the exposure percentage to the rectangle's Y position
    const newYPosition1 = -50 + (exposurePercentage * 100); 
    const newYPosition2 = -20 + (exposurePercentage * 40);

    rectangle.style.transform = `translateY(${newYPosition1}px)`;
    rectangle2.style.transform = `translateY(${newYPosition2}px)`;
});


//for page 3 transition animation
let scrollProgress = 0;
const fixedContent = document.getElementById("fix");
const scrollableSection = document.getElementById("page3");

const scrollText = document.getElementById("header");
scrollText.classList.add("header-style");

const scrollText2 = document.getElementById("content");
scrollText2.classList.add("content-style");

const img = document.getElementById("image");
img.classList.add("image-style");

window.addEventListener("wheel", (event) => {
    const rect = scrollableSection.getBoundingClientRect();
    const sectionHeight = scrollableSection.clientHeight;
    const viewportHeight = window.innerHeight;

    // Check if 80% of the section is within the viewport
    const isFullyVisible =
        rect.top >= -sectionHeight * 0.15 &&
        rect.bottom <= viewportHeight + sectionHeight * 0.15;

    if (!isFullyVisible) {
        return; 
    }
    
    const direction = event.deltaY > 0 ? 1 : -1;
    const newProgress = Math.min(Math.max(scrollProgress + direction, 0), 3);


    if (newProgress !== scrollProgress) {
        scrollProgress = newProgress;

        handleTextUpdate(scrollProgress);

        // Temporarily disable scrolling
        document.body.style.overflow = "hidden";
    }

    if (scrollProgress < 2 && scrollProgress > 0) {
        event.preventDefault();
    } else{
        document.body.style.overflow = "auto"; 
    }
});

function handleTextUpdate(progress) {
    switch (progress) {
        case 0:
            scrollText.innerHTML = "Welcome to MEWFIT";
            scrollText2.innerHTML = "Discover workouts tailored to your goals,<br>track your progress, and unlock a healthier, stronger you.";
            img.src = "assets/workout_pics/workout1.jpeg";
            break;
        case 1:
            scrollText.textContent = "Discover workouts tailored to you";
            scrollText2.innerHTML = "Your goals,track your progress,<br> and unlock a healthier, stronger you.";
            img.src = "assets/workout_pics/workout2.jpeg";
            break;
        case 2:
            scrollText.textContent = "Track progress like never before";
            scrollText2.innerHTML = "Track your progress, and unlock a healthier,<br> stronger you.";
            img.src = "assets/workout_pics/workout3.jpeg";
            break;
        case 3:
            fixedContent.classList.add("hidden");
            break;
    }

    fixedContent.style.opacity = 0;
    setTimeout(() => {
        fixedContent.style.opacity = 1; 
    }, 900); 
}