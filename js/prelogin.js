const rightAnimation = document.querySelector('.right-fade-in');
const leftAnimation = document.querySelector('.left-fade-in');
    
function checkScroll() {
    const rightHeight = rightAnimation.getBoundingClientRect();
    const leftHeight = leftAnimation.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rightHeight.top < windowHeight && rightHeight.bottom > 0) {
        rightAnimation.classList.add('visible'); 
    }

    if (leftHeight.top < windowHeight && leftHeight.bottom > 0) {
        leftAnimation.classList.add('visible');
    }
}

window.addEventListener('scroll', checkScroll);
checkScroll();