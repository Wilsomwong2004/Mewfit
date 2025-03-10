// ------------------Cat Tower Stuff-----------------------------
// Create new cat elements
let userLevel = parseInt(document.getElementById("level-num")?.textContent, 10) || 1;

const maxLevel = 50;
const catsPerLevel = 9;
const catDesigns = [
    './assets/icons/lvl 1 cat.svg',
    './assets/icons/lvl 2 cat.svg',
    './assets/icons/lvl 3 cat.svg',
    './assets/icons/lvl 4 cat.svg',
    './assets/icons/lvl 5 cat.svg',
];

function updateCats() {
    const container = document.getElementById('cat-tower-section');

    let numCats = Math.min(userLevel, catsPerLevel); //to make sure the max num of cats is 9

    let currentDesignIndex = Math.floor(userLevel / 10);
    let prevDesignIndex = Math.max(0, currentDesignIndex - 1);

    let newDesignCount = userLevel % 10;
    if (newDesignCount === 0 && userLevel > 0) {
        newDesignCount = 1;
    }

    let oldDesignCount = catsPerLevel - newDesignCount;

    for (let i = 0; i < numCats; i++) {
        const newCat = document.createElement('img');
        newCat.className = 'cat';

        if (i < oldDesignCount) {
            newCat.src = catDesigns[prevDesignIndex];
        } else {
            newCat.src = catDesigns[currentDesignIndex];
        }

        // Random position inside container
        const randomX = Math.random() * (container.clientWidth - 50);
        const randomY = Math.random() * (container.clientHeight - 50);
        newCat.style.left = `${randomX}px`;
        newCat.style.top = `${randomY}px`;

        container.appendChild(newCat);
    }

    attachSpeechBubbles();
    move();
}

// speech bubbles
function attachSpeechBubbles() {
    const cats = document.querySelectorAll('.cat');

    cats.forEach(cat => {
        cat.addEventListener('mouseover', (event) => {
            const speech = document.createElement('div');
            speech.className = 'speech-bubble';
            speech.textContent = getRandomSpeech();

            document.body.appendChild(speech);

            // Position the speech bubble above the cat
            const catRect = cat.getBoundingClientRect();
            speech.style.left = `${catRect.left + catRect.width / 2}px`;
            speech.style.top = `${catRect.top - 30}px`;

            setTimeout(() => {
                speech.remove();
            }, 1500);
        });

        cat.addEventListener('mouseout', () => {
            removeSpeechBubble();
        });

        cat.addEventListener('mousedown', () => {
            removeSpeechBubble();
        });
    });
}

function removeSpeechBubble() {
    const existingBubble = document.querySelector('.speech-bubble');
    if (existingBubble) {
        existingBubble.remove();
    }
}

const speechTexts = [
    "Meow!",
    "cHonKy",
    "Leg day bro",
    "Feed me!",
    "Let's play!",
    "Nappy naps",
    "What's up dude?",
    "I'm watching you"
];

function getRandomSpeech() {
    const randomIndex = Math.floor(Math.random() * speechTexts.length);
    return speechTexts[randomIndex];
}

// moving any cat
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;
let selectedElement = null;

const move = function () {
    const elements = document.querySelectorAll('.cat');
    const container = document.getElementById('cat-tower-section');

    elements.forEach(element => {
        element.addEventListener('mousedown', dragStart);
    });

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        selectedElement = e.target;
        const rect = selectedElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;

        currentX = rect.left - containerRect.left;
        currentY = rect.top - containerRect.top;

        isDragging = true;
    }

    function drag(e) {
        if (!isDragging || !selectedElement) return;

        e.preventDefault();

        const containerRect = container.getBoundingClientRect();

        // Calculate the new position
        let newX = e.clientX - containerRect.left - initialX;
        let newY = e.clientY - containerRect.top - initialY;

        // Apply boundaries
        const maxX = containerRect.width - selectedElement.offsetWidth;
        const maxY = containerRect.height - selectedElement.offsetHeight;

        newX = Math.min(Math.max(0, newX), maxX);
        newY = Math.min(Math.max(0, newY), maxY);

        selectedElement.style.left = `${newX}px`;
        selectedElement.style.top = `${newY}px`;

        currentX = newX;
        currentY = newY;
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        selectedElement = null;
    }
};

window.onload = function () {
    updateCats();
};




