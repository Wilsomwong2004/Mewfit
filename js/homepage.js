// --------Cat Tower Stuff------------
const elementCount = 3;

function createElements(){
    const container = document.getElementById('cat-tower-section');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    for (let i=0; i<elementCount; i++){
        const newElement = document.createElement('img');
        newElement.src= './assets/icons/lvl 1 cat.svg';
        newElement.className = 'cat';
        const randomX = Math.random() * (containerWidth - 50); 
        const randomY = Math.random() * (containerHeight - 50);

        newElement.style.left = `${randomX}px`;
        newElement.style.top = `${randomY}px`;

        container.appendChild(newElement);
    }
}



var chooseElement;

const move = function() {
    const elements = document.querySelectorAll('.cat');

    elements.forEach(element =>{
        element.addEventListener("mousedown",(e) =>{
            const container = document.getElementById('cat-tower-section'); 
            const containerRect = container.getBoundingClientRect();
            
            chooseElement = element;

            let offsetX = e.clientX - element.getBoundingClientRect().left;
            let offsetY = e.clientY - element.getBoundingClientRect().top;

            document.onmousemove = (e) =>{
                

                if (window.innerWidth < 935){
                    
                    let x = ((e.clientX/ window.innerWidth) * 100)-offsetX;
                    let y = ((e.clientY/ window.innerHeight) * 100)-offsetY;

                    const containerWidth = (containerRect.width / window.innerWidth) * 100;
                    const containerHeight = (containerRect.height / window.innerHeight) * 100;
                    const elementWidth = (element.clientWidth / window.innerWidth) * 100;
                    const elementHeight = (element.clientHeight / window.innerHeight) * 100;

                    if (x < 0) x = 0;
                    if (y < 0) y = 0;
                    if (x > containerWidth - elementWidth) x = containerWidth - elementWidth;
                    if (y > containerHeight - elementHeight) y = containerHeight - elementHeight;

                    chooseElement.style.left = `${x}vw`;
                    chooseElement.style.top = `${y}vh`;
                }else{
                    let x = e.clientX;
                    let y = e.clientY;

                    if (x < containerRect.left) x = containerRect.left +20;
                    if (y < containerRect.top) y = containerRect.top +30;
                    if (x > containerRect.right) x = containerRect.right -30;
                    if (y > containerRect.bottom) y = containerRect.bottom -15;

                    chooseElement.style.left = `${x - containerRect.left -20}px`;
                    chooseElement.style.top = `${y - containerRect.top -30}px`;
                }

                console.log(chooseElement);
            }
        })
        document.onmouseup = function(e){
            chooseElement = null;
        };
    })
}

window.onload = function() {
    createElements();
    move();
};

// -----------create Workout Cards-----------
const workouts = [
    {
        title: 'Push Up',
        duration: '20 minutes',
        calories: '200Kcal',
        level: 'Beginner',
        image: './assets/workout_pics/workout1.jpeg',
    },
    {
        title: 'Video Fit',
        duration: '15 minutes',
        calories: '100Kcal',
        level: 'Advanced',
        image: './assets/workout_pics/workout3.jpeg',
    },
    {
        title: 'Push Up',
        duration: '20 minutes',
        calories: '200Kcal',
        level: 'Beginner',
        image: './assets/icons/vegan.svg',
    },
    {
        title: 'Video Fit',
        duration: '15 minutes',
        calories: '100Kcal',
        level: 'Advanced',
        image: '',
    },
    {
        title: 'Push Up',
        duration: '20 minutes',
        calories: '200Kcal',
        level: 'Beginner',
        image: './assets/icons/vegan.svg',
    },
    {
        title: 'Video Fit',
        duration: '15 minutes',
        calories: '100Kcal',
        level: 'Advanced',
        image: '',
    },
];

const diets = [
    {
        title: 'Salad',
        duration: '15 minutes',
        calories: '100Kcal',
        level: 'Advanced',
        image: 'https://via.placeholder.com/200?text=Salad'
    },
    {
        title: 'Salad',
        duration: '15 minutes',
        calories: '100Kcal',
        image: 'https://via.placeholder.com/200?text=Salad',
        level: 'Advanced'
    },
    {
        title: 'Salad',
        duration: '15 minutes',
        calories: '100Kcal',
        image: 'https://via.placeholder.com/200?text=Salad',
        level: 'Advanced'
    },
    {
        title: 'Salad',
        duration: '15 minutes',
        calories: '100Kcal',
        image: 'https://via.placeholder.com/200?text=Salad',
        level: 'Advanced'
    },
    {
        title: 'Salad',
        duration: '15 minutes',
        calories: '100Kcal',
        image: 'https://via.placeholder.com/200?text=Salad',
        level: 'Advanced'
    },
];

// Helper function to create a card
const createCard = (item, type) => {
    if (type === 'workout') {
        return `
            <div class="workout-card-content">
                <div >
                    <img src="${item.image}" alt="${item.title}" class="workout-image">
                </div>
                <div class="workout-info">
                    <h3 class="workout-title">${item.title}</h3>
                    <span class="workout-level">${item.level || ''}</span>
                    <div class="workout-stats">
                        <span><i class="fas fa-clock"></i> ${item.duration || ''}</span>
                        <span><i class="fas fa-fire"></i> ${item.calories}</span>
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'diet') {
        return `
            <div class="diet-card-content">
                <div class="diet-image">
                    <img src="${item.image || 'https://via.placeholder.com/200'}" alt="${item.title}">
                </div>
                <div class="diet-info">
                    <h3 class="diet-title">${item.title}</h3>
                    <span class="diet-level">${item.level || ''}</span>
                    <div class="diet-stats">
                        <span><i class="fas fa-clock"></i> ${item.duration || ''}</span>
                        <span><i class="fas fa-fire"></i> ${item.calories}</span>
                    </div>
                </div>
            </div>
        `;
    }
};

const workoutGrid = document.querySelector('.workout-history-grid');
const dietGrid = document.querySelector('.diet-history-grid');

workoutGrid.innerHTML = workouts.map(workout => createCard(workout, 'workout')).join('');
dietGrid.innerHTML = diets.map(diet => createCard(diet, 'diet')).join('');