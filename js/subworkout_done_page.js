// import { WorkoutManager } from './subworkout_page.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        // const workoutManager = new WorkoutManager();
        // console.log('WorkoutManager initialized:', workoutManager);

        const doneBtn = document.getElementById('done-btn');
        const restartBtn = document.getElementById('restart-btn');

        if (!doneBtn) console.error('Done button not found!');
        if (!restartBtn) console.error('Restart button not found!');

        doneBtn?.addEventListener('click', () => {
            console.log('Done button clicked');
            window.location.href = 'workout_page.html';
        });

        restartBtn?.addEventListener('click', () => {
            console.log('Restart button clicked');
            // workoutManager.restartWorkout();
            window.location.href = 'subworkout_page.html';
        });

    } catch (error) {
        console.error('Initialization error:', error);
    }
});