// workout page functionality
// Add interactivity
document.querySelectorAll('.activity-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.activity-card').forEach(c =>
            c.style.background = 'white');
        card.style.background = '#ffe5dc';
    });
});

// Populate workout cards dynamically
const workouts = [
    { title: 'Push Up', duration: '20 minutes', level: 'Beginner' },
    { title: 'Video fit', duration: '15 minutes', level: 'Advanced' },
    { title: 'Pull Up', duration: '25 minutes', level: 'Intermediate' },
];

const createWorkoutCard = (workout) => {
    return `
        <div class="workout-card">
            <div class="workout-image"></div>
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