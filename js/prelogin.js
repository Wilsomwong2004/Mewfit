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


//for page 3 animation
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