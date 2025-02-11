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