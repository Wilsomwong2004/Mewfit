

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
    let form = document.querySelector(".add-profile form");
    form.querySelectorAll("input, select").forEach(input => {
        if (sessionStorage.getItem(input.name)) {
            input.value = sessionStorage.getItem(input.name);
        }

        input.addEventListener("input", function () {
            sessionStorage.setItem(input.name, this.value);
        });
    });

    //---------------------clear all rows-------------------------
    function clearForm() {
        document.querySelector('form').reset();
        sessionStorage.clear();
    }

    window.onload = function () {
        if (sessionStorage.getItem("clearForm") === "true") {
            clearForm();
            sessionStorage.removeItem("clearForm");
        }
    };
    
});