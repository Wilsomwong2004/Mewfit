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