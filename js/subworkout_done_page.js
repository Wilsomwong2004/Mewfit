document.addEventListener('DOMContentLoaded', () => {
    try {
        // Get workout stats from localStorage
        const workoutStats = JSON.parse(localStorage.getItem('workoutStats')) || {
            duration: '14 Minutes',
            calories: '203 kcal'
        };

        // Update stats on the page
        const durationStat = document.querySelector('.stat:nth-child(1)');
        const caloriesStat = document.querySelector('.stat:nth-child(2)');

        if (durationStat) {
            durationStat.innerHTML = `<i class="fa-solid fa-stopwatch"></i> ${workoutStats.duration}`;
        }

        if (caloriesStat) {
            caloriesStat.innerHTML = `🔥 ${workoutStats.calories}`;
        }

        const doneBtn = document.getElementById('done-btn');
        const restartBtn = document.getElementById('restart-btn');

        if (!doneBtn) console.error('Done button not found!');
        if (!restartBtn) console.error('Restart button not found!');

        doneBtn?.addEventListener('click', () => {
            console.log('Done button clicked');
            // Clear stats when done
            localStorage.removeItem('workoutStats');
            window.location.href = 'workout_page.html';
        });

        restartBtn?.addEventListener('click', () => {
            console.log('Restart button clicked');

            // Set restart flag in localStorage
            localStorage.setItem('restartWorkout', 'true');

            // Navigate back to workout page
            window.location.href = 'subworkout_page.html';
        });

    } catch (error) {
        console.error('Initialization error:', error);
    }
});