document.addEventListener('DOMContentLoaded', function () {
    //--------------------select sections-----------------------
    const nutritionLink = document.querySelector('.nutrition-link');
    const dietLink = document.querySelector('.diet-link');
    const nutritionContent = document.querySelector('.nutrition-container');
    const dietContent = document.querySelector('.diet-container');

    dietContent.style.display = 'flex';
    dietLink.classList.add('active');

    nutritionLink.addEventListener('click', function (event) {
        event.preventDefault();
        dietContent.style.display = 'none';
        nutritionContent.style.display = 'flex';
        dietLink.classList.remove('active');
        nutritionLink.classList.add('active');
    });

    dietLink.addEventListener('click', function (event) {
        event.preventDefault();
        nutritionContent.style.display = 'none';
        dietContent.style.display = 'flex';
        nutritionLink.classList.remove('active');
        dietLink.classList.add('active');
    });

    //-------------------retain information-----------------------------
    const forms = document.querySelectorAll(".add-profile form");

    forms.forEach(form => {
        // Select all inputs and selects within this form
        const inputs = form.querySelectorAll("input, select, textarea");

        inputs.forEach(input => {
            // Skip hidden inputs, buttons, and file inputs
            if (input.type === 'hidden' || input.type === 'submit' || input.type === 'file') return;

            // Restore value from sessionStorage if it exists
            if (sessionStorage.getItem(input.name)) {
                input.value = sessionStorage.getItem(input.name);
            }

            // Save input value to sessionStorage on change
            input.addEventListener("input", function () {
                sessionStorage.setItem(input.name, this.value);
            });
        });

        // Special handling for file inputs
        const fileInputs = form.querySelectorAll('input[type="file"]');
        fileInputs.forEach(fileInput => {
            fileInput.addEventListener('change', function () {
                // Optional: Show selected file name
                const fileName = this.files.length > 0 ? this.files[0].name : '';
                const fileNameDisplay = form.querySelector('.file-name-display');
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = fileName;
                }
            });
        });
    });

    // Optional: Handle existing diet data passed from PHP
    function handleExistingDietData() {
        const nutritionIdsInput = document.querySelector('input[name="edietnutrition_ids"]');
        const pictureInput = document.querySelector('input[name="meal_picture"]');
        const typeSelect = document.querySelector('select[name="ediet-type"]');
        const durationInput = document.querySelector('input[name="epreparation_min"]');
        const descriptionTextarea = document.querySelector('textarea[name="edesc"]');
        const directionsTextarea = document.querySelector('textarea[name="edirections"]');

        // Check if we have existing diet data in the session
        const existingDietData = JSON.parse(sessionStorage.getItem('existing_diet_data'));

        if (existingDietData) {
            // Restore nutrition IDs
            if (existingDietData.nutrition_ids && nutritionIdsInput) {
                nutritionIdsInput.value = existingDietData.nutrition_ids.join(',');
            }

            // Restore other form fields
            if (typeSelect) typeSelect.value = existingDietData.type;
            if (durationInput) durationInput.value = existingDietData.duration;
            if (descriptionTextarea) descriptionTextarea.value = existingDietData.description;
            if (directionsTextarea) directionsTextarea.value = existingDietData.directions;

            // Clear the session storage
            sessionStorage.removeItem('existing_diet_data');
        }
    }

    // Call the function to handle existing diet data
    handleExistingDietData();

    //---------------------clear all rows-------------------------
    function clearForm() {
        document.querySelectorAll('.add-profile form').forEach(form => {
            form.reset();

            // Clear file input display if exists
            const fileNameDisplay = form.querySelector('.file-name-display');
            if (fileNameDisplay) {
                fileNameDisplay.textContent = '';
            }
        });
        sessionStorage.clear();
    }

    window.onload = function () {
        if (sessionStorage.getItem("clearForm") === "true") {
            clearForm();
            sessionStorage.removeItem("clearForm");
        }
    };
});