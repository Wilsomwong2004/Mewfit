    function checkUniqueName(inputElement, feedbackElement, existingMessage, table, column, endpoint, id = null) {
        const value = inputElement.value.trim();
        
        if (value === "") {
            if (!inputElement.dataset.bracketError || inputElement.dataset.bracketError === "false") {
                feedbackElement.textContent = "";
            }
            inputElement.dataset.uniqueError = "false";
            return;
        }

        let bodyParams = `table=${encodeURIComponent(table)}&column=${encodeURIComponent(column)}&value=${encodeURIComponent(value)}`;

        if (id) {
            bodyParams += `&id=${encodeURIComponent(id)}`;
        }
        
        fetch("inputValidation.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: bodyParams,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    feedbackElement.textContent = data.error;
                    feedbackElement.style.color = "red";
                    inputElement.dataset.uniqueError = "true";
                } else if (data.exists) {
                    feedbackElement.textContent = existingMessage;
                    feedbackElement.style.color = "red";
                    inputElement.dataset.uniqueError = "true";
                } else {
                    if (!inputElement.dataset.bracketError || inputElement.dataset.bracketError === "false") {
                        feedbackElement.textContent = "";
                    }
                    inputElement.dataset.uniqueError = "false";
                }
            })
            .catch(error => {
                console.error("Error checking uniqueness:", error);
                feedbackElement.textContent = "An error occurred while checking the value.";
                feedbackElement.style.color = "red";
                inputElement.dataset.uniqueError = "true";
            });
    }

    function checkNumber(inputElement, feedbackElement, errorMessage) {
        const value = inputElement.value.trim();

        if (value === "") {
            feedbackElement.textContent = "";
            return;
        }

        if (isNaN(value) || parseFloat(value) <= 0) {
            feedbackElement.textContent = errorMessage;
            feedbackElement.style.color = "red";
        }
    }

    function checkDirections(textareaId, feedbackId) {
        const directionsTextarea = document.getElementById(textareaId);
        const feedbackElement = document.getElementById(feedbackId);

        const directionsText = directionsTextarea.value;

        const colonCount = (directionsText.match(/:/g) || []).length;
        const semicolonCount = (directionsText.match(/;/g) || []).length;

        if (colonCount === 0 && semicolonCount === 0) {
            feedbackElement.textContent = "Please include at least one colon (:) and one semicolon (;).";
        } else if (colonCount !== semicolonCount) {
            feedbackElement.textContent = "The number of colons (:) and semicolons (;) must be the same.";
        } else {
            feedbackElement.textContent = "";
        }
    }

    function checkNumberInBrackets(inputElement, feedbackElement, errorMessage) {
    const value = inputElement.value.trim();
    const regex = /^(.+)\s\((\d+)\)$/;
    const match = value.match(regex);

    if (!value.includes('(') || !value.includes(')')) {
        feedbackElement.textContent = "Please include parentheses around the number.";
        feedbackElement.style.color = "red";
        inputElement.dataset.bracketError = "true";
        return;
    }

    if (match) {
        const textBeforeBrackets = match[1].trim(); 
        const numberInsideBrackets = parseInt(match[2], 10); 

        if (textBeforeBrackets === "") {
            feedbackElement.textContent = "Please include text before the parentheses.";
            feedbackElement.style.color = "red";
            inputElement.dataset.bracketError = "true";
        }
        else if (isNaN(numberInsideBrackets) || numberInsideBrackets <= 0) {
            feedbackElement.textContent = errorMessage;
            feedbackElement.style.color = "red";
            inputElement.dataset.bracketError = "true";
        } else {
            feedbackElement.textContent = "";
            feedbackElement.style.color = ""; 
            inputElement.dataset.bracketError = "false";
        }
    } else {
        feedbackElement.textContent = "The format should be: 'Text (Number)'.";
        feedbackElement.style.color = "red";
        inputElement.dataset.bracketError = "true";
    }
}

function validatePassword(inputElement, feedbackElement) {
    const password = inputElement.value;
    const feedback = feedbackElement;
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!password.match(strongRegex)) {
        feedback.textContent = "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";
        feedback.style.color = "red";
    } else {
        feedback.textContent = "";
    }
}

function validatePhoneNumber(inputElement, feedbackElement) {
    const phoneNumber = inputElement.value;
    const feedback = feedbackElement;

    if (!/^\d+$/.test(phoneNumber)) {
        feedback.textContent = "Phone number must contain only numbers.";
        feedback.style.color = "red";
        inputElement.dataset.bracketError = "true";
        return; 
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
        feedback.textContent = "Phone number must be exactly 10 digits.";
        feedback.style.color = "red";
        inputElement.dataset.bracketError = "true";
    } else {
        feedback.textContent = ""; 
        inputElement.dataset.bracketError = "false";
    }
}