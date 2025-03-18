function toggleDropdown() {
    const dropdown = document.getElementById('exercises-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

    if (dropdown.style.display === 'block') {
        document.getElementById('search-exercises').focus();
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('exercises-dropdown');
    const input = document.getElementById('exercise-search');

    if (event.target !== input && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// Filter exercises based on search
function filterExercises() {
    const searchText = document.getElementById('search-exercises').value.toLowerCase();
    const exerciseItems = document.querySelectorAll('.exercise-item');

    exerciseItems.forEach(function (item) {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchText) ? 'block' : 'none';
    });
}

// Select all exercises
function selectAll() {
    const checkboxes = document.querySelectorAll('.exercise-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(function (checkbox) {
        checkbox.checked = !allChecked;
    });

    updateSelectedText();
    return false; // Prevent default anchor behavior
}

// Update the main input text with selected exercises
function updateSelectedText() {
    const selectedCheckboxes = document.querySelectorAll('.exercise-checkbox:checked');
    const input = document.getElementById('exercise-search');

    if (selectedCheckboxes.length === 0) {
        input.value = 'Select exercise IDs';
    } else {
        const ids = Array.from(selectedCheckboxes).map(cb => cb.value);
        input.value = ids.join(', ');
    }
}

// Add event listeners to checkboxes
document.addEventListener('DOMContentLoaded', function () {
    const checkboxes = document.querySelectorAll('.exercise-checkbox');

    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', updateSelectedText);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    //--------------------exercise dropdown functionality-----------------------
    const exerciseSearch = document.getElementById('exercise-search');
    const exercisesDropdown = document.getElementById('exercises-dropdown');
    const checkboxes = document.querySelectorAll('.exercise-checkbox');
    const searchExercises = document.getElementById('search-exercises');

    // Toggle dropdown visibility
    window.toggleDropdown = function () {
        exercisesDropdown.style.display = exercisesDropdown.style.display === 'block' ? 'none' : 'block';
    };

    // Close dropdown when clicking outside
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.select-dropdown') && exercisesDropdown.style.display === 'block') {
            exercisesDropdown.style.display = 'none';
        }
    });

    // Filter exercises in dropdown
    window.filterExercises = function () {
        const searchTerm = searchExercises.value.toLowerCase();
        document.querySelectorAll('.exercise-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    };

    // Select all exercises
    window.selectAll = function () {
        const checkboxes = document.querySelectorAll('.exercise-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });
        updateExerciseSelection();
        return false; // Prevent default
    };

    // Update selected exercises text
    function updateExerciseSelection() {
        const selected = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (selected.length > 0) {
            exerciseSearch.value = `${selected.length} exercise(s) selected`;
        } else {
            exerciseSearch.value = "Select exercise IDs";
        }
    }

    // Add event listeners to checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateExerciseSelection);
    });

    //------------------------select row--------------------------
    const rows = document.querySelectorAll('table tr:not(:first-child)');
    const editBtn = document.getElementById("edit-btn");
    const deleteBtn = document.getElementById("delete-btn");
    let isEditing = false;
    let selectedRow = null;

    document.querySelectorAll(".box table tr:not(:first-child)").forEach(row => {
        row.addEventListener('click', function (event) {
            if (isEditing) return;
            if (this.querySelector('td') && this.querySelector('td').textContent === 'No workout data found') return;

            event.stopPropagation();
            rows.forEach(r => r.classList.remove('selected'));
            selectedRow = this;
            this.classList.add('selected');

            editBtn.disabled = false;
            deleteBtn.disabled = false;
        });
    });

    //------------------------------deselect------------------
    document.addEventListener("click", function (event) {
        const table = document.querySelector(".box table");
        const tableOption = document.querySelector('.table-option');
        if (!table.contains(event.target) && !tableOption.contains(event.target)) {
            if (isEditing) return;
            if (selectedRow) {
                selectedRow.classList.remove('selected');
                selectedRow = null;
            }
            editBtn.disabled = true;
            deleteBtn.disabled = true;
        }
    }, true);

    //-----------------------------edit data-----------------------
    editBtn.addEventListener("click", function () {
        if (!selectedRow) return;
        isEditing = true;

        const cells = selectedRow.getElementsByTagName("td");
        const workoutId = cells[0].textContent.trim();

        // Redirect to edit page with workout ID
        window.location.href = `edit_workout.php?id=${workoutId}`;
    });

    //----------------------delete data------------------------
    let id = null;
    deleteBtn.addEventListener("click", () => {
        if (!selectedRow) return;

        const cells = selectedRow.getElementsByTagName("td");
        id = cells[0].textContent.trim();

        let popUp = document.getElementById("popup");
        if (!popUp) {
            // Create popup if it doesn't exist
            popUp = document.createElement("div");
            popUp.id = "popup";
            popUp.className = "popup";
            popUp.innerHTML = `
                <div class="popup-content">
                    <h3>Delete Workout</h3>
                    <p>Are you sure you want to delete this workout?</p>
                    <div class="popup-buttons">
                        <button class="confirmDelete">Delete</button>
                        <button class="cancelDelete">Cancel</button>
                    </div>
                </div>
            `;
            document.querySelector('.container').appendChild(popUp);
        }

        popUp.style.display = "flex";
    });

    // Handle popup buttons via event delegation
    document.querySelector(".container").addEventListener("click", function (event) {
        if (event.target.classList.contains("confirmDelete")) {
            if (!id) {
                console.error("Missing workout ID");
                return;
            }

            fetch("delete_workout.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${id}`
            })
                .then(res => res.text())
                .then(() => location.reload())
                .catch(console.error);

            document.getElementById("popup").style.display = "none";
        }

        if (event.target.classList.contains("cancelDelete")) {
            document.getElementById("popup").style.display = "none";
        }
    });

    //-----------------------------search--------------------------
    const searchBar = document.querySelector(".search-bar");
    searchBar.addEventListener("keyup", function () {
        const searchValue = this.value.toLowerCase();
        const table = document.querySelector(".box table");
        const rows = table.querySelectorAll("tr:not(:first-child)");

        rows.forEach(row => {
            if (row.cells.length <= 1) return; // Skip "No workout data found" row

            const workoutName = row.cells[1].textContent.toLowerCase();
            const workoutType = row.cells[2].textContent.toLowerCase();
            const difficulty = row.cells[3].textContent.toLowerCase();

            if (workoutName.includes(searchValue) ||
                workoutType.includes(searchValue) ||
                difficulty.includes(searchValue)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });

    //--------------------form validation-----------------------
    const form = document.querySelector(".add-profile form");
    if (form) {
        form.addEventListener("submit", function (event) {
            const workoutName = document.getElementById("workout-name").value;
            const workoutType = document.getElementById("workout-type").value;
            const calorie = document.getElementById("calorie").value;
            const minutes = document.getElementById("minutes").value;
            const sets = document.getElementById("sets").value;
            const difficulty = document.getElementById("difficulty").value;
            const description = document.getElementById("description").value;
            const longDescription = document.getElementById("long-description").value;

            // Get selected exercise checkboxes
            const selectedExercises = Array.from(document.querySelectorAll('.exercise-checkbox:checked'));

            if (workoutName.trim() === "" ||
                workoutType === "" ||
                calorie === "" ||
                minutes === "" ||
                sets === "" ||
                difficulty === "" ||
                description.trim() === "" ||
                longDescription.trim() === "" ||
                selectedExercises.length === 0) {

                alert("Please fill all fields and select at least one exercise");
                event.preventDefault();
                return false;
            }

            // Additional validation for numeric fields
            if (parseInt(calorie) <= 0 || parseInt(minutes) <= 0 || parseInt(sets) <= 0) {
                alert("Calories, minutes, and sets must be positive numbers");
                event.preventDefault();
                return false;
            }

            return true;
        });
    }

    //--------------------retain information-----------------------------
    if (form) {
        form.querySelectorAll("input, select, textarea").forEach(input => {
            if (input.type === 'file') return; // Skip file inputs
            if (input.id === 'exercise-search' || input.id === 'search-exercises') return; // Skip search inputs

            if (sessionStorage.getItem(input.id)) {
                input.value = sessionStorage.getItem(input.id);
            }

            input.addEventListener("input", function () {
                sessionStorage.setItem(input.id, this.value);
            });
        });
    }

    // Handle logout
    // const logoutProfile = document.getElementById('logout-profile');
    // if (logoutProfile) {
    //     logoutProfile.addEventListener('click', function () {
    //         if (confirm('Are you sure you want to logout?')) {
    //             window.location.href = 'logout.php';
    //     });
    // }
});