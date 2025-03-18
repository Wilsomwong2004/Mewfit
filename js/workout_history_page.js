const previousBtn = document.querySelector(".previous");

previousBtn.addEventListener("click", function () {
  window.location.href = "homepage.php";
});

document.addEventListener('DOMContentLoaded', () => {
  setupWorkoutHistoryCards();
  setupPopupCloseHandlers();
});

// Global variable to store the selected workout
let selectedWorkout = null;

/**
* Setup click handlers for workout history records
*/
function setupWorkoutHistoryCards() {
  document.querySelectorAll('.workout-record').forEach(card => {
    card.addEventListener('click', () => {
      // Extract workout details from the clicked card
      const workoutName = card.querySelector('.name').textContent;
      const workoutType = card.querySelector('.type').textContent;
      const workoutCalories = card.querySelector('.kcal').textContent;
      const workoutDuration = card.querySelector('.time').textContent;
      const workoutImage = card.querySelector('.picture').getAttribute('src');
      const workoutId = card.getAttribute('data-workout-id');

      // Store the workout details
      selectedWorkout = {
        id: workoutId,
        title: workoutName,
        type: workoutType,
        calories: workoutCalories,
        duration: workoutDuration,
        image: workoutImage
      };

      // Show workout details in popup
      showWorkoutPopup(selectedWorkout);
    });
  });
}

function showWorkoutPopup(workout) {
  // Create popup if it doesn't exist yet
  if (!document.getElementById('workout-history-popup')) {
    createPopupElement();
  }

  const popup = document.getElementById('workout-history-popup');

  // Update popup content
  document.getElementById('popup-title').textContent = workout.title.toUpperCase();
  document.getElementById('popup-type').textContent = workout.type;

  // Extract numbers only for calories
  const caloriesNum = workout.calories.match(/\d+/)[0];
  document.getElementById('popup-calories').textContent = caloriesNum;

  // Extract numbers only for duration
  const durationNum = workout.duration.match(/\d+/)[0];
  document.getElementById('popup-duration').textContent = durationNum;

  // Update image
  const workoutImage = document.getElementById('popup-workout-image');
  if (workout.image) {
    workoutImage.src = workout.image;
    workoutImage.alt = `${workout.title} Image`;
    workoutImage.style.objectFit = 'cover';
  } else {
    workoutImage.src = './assets/icons/error.svg';
    workoutImage.alt = 'Workout Image Not Found';
    workoutImage.style.objectFit = 'contain';
  }

  // Show popup
  popup.classList.add('active');
}

/**
* Create popup HTML element
*/
function createPopupElement() {
  const popupHTML = `
  <div id="workout-history-popup" class="popup-container">
      <div class="popup-content">
          <div class="popup-close">&times;</div>
          <div class="popup-header">
              <div class="popup-image-container">
                  <img id="popup-workout-image" src="" alt="Workout Image">
              </div>
              <div class="popup-header-info">
                  <h2 id="popup-title">WORKOUT TITLE</h2>
                  <p id="popup-type">Workout Type</p>
                  <div class="popup-stats">
                      <div class="popup-stat">
                          <i class="fas fa-fire"></i>
                          <span id="popup-calories">0</span>
                          <span>kcal</span>
                      </div>
                      <div class="popup-stat">
                          <i class="fas fa-clock"></i>
                          <span id="popup-duration">0</span>
                          <span>min</span>
                      </div>
                  </div>
              </div>
          </div>
          <div class="popup-footer">
              <button class="popup-repeat-button">Repeat This Workout</button>
          </div>
      </div>
  </div>`;

  // Add the popup to the document
  document.body.insertAdjacentHTML('beforeend', popupHTML);

  // Add event listener for the Repeat button
  document.querySelector('.popup-repeat-button').addEventListener('click', () => {
    if (selectedWorkout) {
      // Store the workout in localStorage to use in workout page
      localStorage.setItem('selectedWorkout', JSON.stringify(selectedWorkout));
      // Navigate to the workout page
      window.location.href = 'subworkout_page.php';
    }
  });
}

/**
* Setup handlers to close the popup
*/
function setupPopupCloseHandlers() {
  // Use event delegation since popup may not exist at load time
  document.body.addEventListener('click', (e) => {
    const popup = document.getElementById('workout-history-popup');
    if (!popup) return;

    if (e.target.classList.contains('popup-close') ||
      (e.target.classList.contains('popup-container') && e.target === popup)) {
      popup.classList.remove('active');
      selectedWorkout = null;
    }
  });
}

// Add CSS for the popup
const popupStyles = `
.popup-container {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

.popup-container.active {
  display: flex;
}

.popup-content {
  background-color: white;
  width: 90%;
  max-width: 500px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
}

.popup-close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 28px;
  cursor: pointer;
  color: white;
  z-index: 10;
}

.popup-header {
  padding: 0;
  position: relative;
}

.popup-image-container {
  height: 200px;
  overflow: hidden;
}

#popup-workout-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popup-header-info {
  padding: 16px;
  background-color: #f8f8f8;
}

#popup-title {
  margin: 0 0 5px 0;
  font-size: 22px;
  font-weight: bold;
}

#popup-type {
  color: #666;
  margin: 0 0 15px 0;
}

.popup-stats {
  display: flex;
  gap: 20px;
}

.popup-stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.popup-stat i {
  color: #FF7F50;
}

.popup-footer {
  padding: 16px;
  display: flex;
  justify-content: center;
}

.popup-repeat-button {
  background-color: #FF7F50;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.popup-repeat-button:hover {
  background-color: #FF6347;
}

/* Make workout records look clickable */
.workout-record {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.workout-record:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
`;

// Add styles to the document
document.addEventListener('DOMContentLoaded', () => {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = popupStyles;
  document.head.appendChild(styleSheet);
});