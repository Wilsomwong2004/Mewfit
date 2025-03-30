document.addEventListener('DOMContentLoaded', function () {
    // Get workout data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const workoutId = urlParams.get('workout_id');
    let duration = urlParams.get('duration');
    let calories = urlParams.get('calories');

    // If parameters aren't in URL, try to get from localStorage
    if (!duration || !calories) {
        try {
            const workoutStats = JSON.parse(localStorage.getItem('workoutStats'));
            if (workoutStats) {
                // Parse duration and calories from stored format
                if (workoutStats.duration) {
                    const durationMatch = workoutStats.duration.match(/(\d+)/);
                    if (durationMatch) {
                        duration = parseInt(durationMatch[1]) * 60; // Convert minutes to seconds
                    }
                }

                if (workoutStats.calories) {
                    const caloriesMatch = workoutStats.calories.match(/(\d+)/);
                    if (caloriesMatch) {
                        calories = parseInt(caloriesMatch[1]);
                    }
                }
            }
        } catch (error) {
            console.error('Error parsing stored workout stats:', error);
        }
    }

    // Display stats
    const durationStat = document.querySelector('.duration-stat');
    const caloriesStat = document.querySelector('.calories-stat');

    if (duration) {
        // Format duration (assuming it's in seconds)
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        durationStat.innerHTML = `<i class="fa-solid fa-stopwatch"></i> ${minutes}m ${seconds}s`;
    } else {
        durationStat.innerHTML = `<i class="fa-solid fa-stopwatch"></i> --`;
    }

    if (calories) {
        caloriesStat.innerHTML = `<i class="fa-solid fa-fire"></i> ${calories} kcal`;
    } else {
        caloriesStat.innerHTML = `<i class="fa-solid fa-fire"></i> --`;
    }

    // Handle done button click
    const doneBtn = document.getElementById('done-btn');
    doneBtn.addEventListener('click', function () {
        if (!workoutId) {
            console.error('Workout ID not found');
            showFeedback('Error: Workout ID not found', 'error');
            // Still redirect after a delay to avoid trapping user
            setTimeout(() => {
                window.location.href = 'workout_page.php';
            }, 3000);
            return;
        }

        // Show loading state
        doneBtn.textContent = 'Saving...';
        doneBtn.disabled = true;

        // Create form data to send to server
        const formData = new FormData();
        formData.append('workout_id', workoutId);
        formData.append('member_id', memberId); // From PHP

        // Send AJAX request to save workout history
        fetch('save_workout_history.php', {
            method: 'POST',
            body: formData
            .then(response => {
                return response.text().then(text => {
                    console.log("Raw response:", text);
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        console.error("Failed to parse JSON:", e);
                        throw new Error("Server returned invalid response");
                    }
                });
            })
            .then(data => {
                if (data.success) {
                    // Show success message
                    showFeedback('Workout saved successfully!', 'success');

                    // Clear workout stats from localStorage
                    localStorage.removeItem('workoutStats');

                    // Redirect after a brief delay to show the success message
                    setTimeout(() => {
                        window.location.href = 'workout_page.php';
                    }, 1500);
                } else {
                    console.error('Failed to save workout:', data.message);
                    // Display error message to user
                    showFeedback('Error: ' + data.message, 'error');

                    // Reset button state
                    doneBtn.textContent = 'Done';
                    doneBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showFeedback('Error connecting to server', 'error');

                // Reset button state
                doneBtn.textContent = 'Done';
                doneBtn.disabled = false;
            });
    });

    // Handle restart button click
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.addEventListener('click', function () {
        if (!workoutId) {
            console.error('Workout ID not found');
            showFeedback('Error: Workout ID not found', 'error');
            return;
        }

        // Redirect back to the workout page
        window.location.href = `subworkout_page.php?workout_id=${workoutId}`;
    });

    // Function to show feedback messages
    function showFeedback(message, type) {
        // Create feedback element if it doesn't exist
        let feedbackContainer = document.getElementById('feedback-container');
        if (!feedbackContainer) {
            feedbackContainer = document.createElement('div');
            feedbackContainer.id = 'feedback-container';
            feedbackContainer.style.position = 'fixed';
            feedbackContainer.style.top = '20px';
            feedbackContainer.style.left = '50%';
            feedbackContainer.style.transform = 'translateX(-50%)';
            feedbackContainer.style.zIndex = '1000';
            document.body.appendChild(feedbackContainer);
        }

        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `feedback ${type}`;
        feedbackDiv.style.padding = '12px 20px';
        feedbackDiv.style.marginBottom = '10px';
        feedbackDiv.style.borderRadius = '5px';
        feedbackDiv.style.color = '#fff';
        feedbackDiv.style.textAlign = 'center';
        feedbackDiv.style.fontWeight = 'bold';

        if (type === 'success') {
            feedbackDiv.style.backgroundColor = '#4CAF50';
        } else if (type === 'error') {
            feedbackDiv.style.backgroundColor = '#F44336';
        }

        feedbackDiv.textContent = message;

        feedbackContainer.appendChild(feedbackDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            feedbackDiv.remove();

            // Remove container if empty
            if (feedbackContainer.children.length === 0) {
                feedbackContainer.remove();
            }
        }, 3000);
    }
});