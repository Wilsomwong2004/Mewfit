//mini profile
const profilePic = document.getElementById('profile-pic');
const profileDropdown = document.getElementById('profile-dropdown');
const logout = document.querySelector('.logout-profile');
const popupContainer = document.getElementById('popup-container');
const popupTitle = document.getElementById('popup-title');
const popupBody = document.getElementById('popup-body');

console.log('profilePic:', profilePic);
console.log('profileDropdown:', profileDropdown);

function showPopup(title, content) {
    popupTitle.textContent = title;
    popupBody.innerHTML = content;
    popupContainer.style.display = 'flex';
}

function closePopup() {
    popupContainer.style.display = 'none';
}

function showAnimatedPopup(message) {
    // If there's an existing popup, remove it immediately
    if (currentPopup) {
        document.body.removeChild(currentPopup);
        clearTimeout(removeTimeout);
    }

    const animatedPopup = document.createElement('div');
    animatedPopup.className = 'animated-popup';
    animatedPopup.textContent = message;

    document.body.appendChild(animatedPopup);
    currentPopup = animatedPopup;

    // Trigger the animation
    requestAnimationFrame(() => {
        animatedPopup.style.top = '20px';
        animatedPopup.style.opacity = '1';
    });

    // Remove the popup after 3 seconds
    removeTimeout = setTimeout(() => {
        animatedPopup.style.top = '-100px';
        animatedPopup.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(animatedPopup)) {
                document.body.removeChild(animatedPopup);
            }
            if (currentPopup === animatedPopup) {
                currentPopup = null;
            }
        }, 300); // Wait for the animation to finish before removing
    }, 3000);
}

// Function to show logout confirmation modal
function showLogoutModal() {
    const modal = document.createElement('div');
    modal.className = 'logout-modal';
    modal.innerHTML = `
    <div class="logout-modal-content">
        <h2>Logout?</h2>
        <p>Are you sure you want to log out?</p>
        <button id="confirm-logout">Yes, Logout</button>
        <button id="cancel-logout">Cancel</button>
    </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirm-logout').addEventListener('click', function () {
        // Redirect to logout.php
        window.location.href = 'logout.php';
    });

    document.getElementById('cancel-logout').addEventListener('click', function () {
        document.body.removeChild(modal);
    });
}

if (profilePic && profileDropdown) {
    console.log('Both profilePic and profileDropdown found');
    profilePic.addEventListener('click', function (e) {
        console.log('Profile pic clicked');
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
        console.log('Dropdown classes after toggle:', profileDropdown.className);
    });

    document.addEventListener('click', function (e) {
        if (!profileDropdown.contains(e.target) && !profilePic.contains(e.target)) {
            profileDropdown.classList.remove('show');
            console.log('Dropdown closed');
        }
    });
} else {
    console.error('profilePic or profileDropdown not found in the DOM');
    if (!profilePic) console.error('profilePic is missing');
    if (!profileDropdown) console.error('profileDropdown is missing');
}

// Dark mode functionality
const darkModeToggle = document.querySelector('input[name="dark-mode-toggle"]');
if (darkModeToggle) {
    // Set initial state based on localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    darkModeToggle.checked = isDarkMode;
    document.documentElement.classList.toggle('dark-mode', isDarkMode);

    darkModeToggle.addEventListener('change', function () {
        const isDarkModeEnabled = this.checked;
        document.documentElement.classList.toggle('dark-mode', isDarkModeEnabled);
        localStorage.setItem('darkMode', isDarkModeEnabled);

        // Show notification
        const message = isDarkModeEnabled ? "Dark mode is now enabled" : "Dark mode is now disabled";
        showAnimatedPopup(message);

        // Sync dark mode across open tabs
        localStorage.setItem('darkModeTimestamp', Date.now().toString());
    });
}

// Logout functionality
if (logout) {
    logout.addEventListener('click', function (e) {
        e.preventDefault();
        // Show logout confirmation modal
        showLogoutModal();
    });
}

// Listen for dark mode changes in other tabs
window.addEventListener('storage', function (e) {
    if (e.key === 'darkModeTimestamp') {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.documentElement.classList.toggle('dark-mode', isDarkMode);
        if (darkModeToggle) {
            darkModeToggle.checked = isDarkMode;
        }
    }
});

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