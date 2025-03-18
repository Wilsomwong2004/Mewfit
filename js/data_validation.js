function checkUniqueName(
  inputElement,
  feedbackElement,
  existingMessage,
  table,
  column,
  button,
  id
) {
  const value = inputElement.value.trim();

  if (value === "") {
    if (
      !inputElement.dataset.bracketError ||
      inputElement.dataset.bracketError === "false"
    ) {
      feedbackElement.textContent = "";
    }
    inputElement.dataset.uniqueError = "false";
    return;
  }

  let bodyParams = `table=${encodeURIComponent(
    table
  )}&column=${encodeURIComponent(column)}&value=${encodeURIComponent(value)}`;

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
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        feedbackElement.textContent = data.error;
        feedbackElement.style.color = "red";
        inputElement.dataset.uniqueError = "true";
      } else if (data.exists) {
        feedbackElement.textContent = existingMessage;
        feedbackElement.style.color = "red";
        inputElement.dataset.uniqueError = "true";
        button.disabled = true;
      } else {
        if (
          !inputElement.dataset.bracketError ||
          inputElement.dataset.bracketError === "false"
        ) {
          feedbackElement.textContent = "";
        }
        inputElement.dataset.uniqueError = "false";
        return;
      }
    })
    .catch((error) => {
      console.error("Error checking uniqueness:", error);
      feedbackElement.textContent =
        "An error occurred while checking the value.";
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
    feedbackElement.textContent =
      "Please include at least one colon (:) and one semicolon (;).";
  } else if (colonCount !== semicolonCount) {
    feedbackElement.textContent =
      "The number of colons (:) and semicolons (;) must be the same.";
  } else {
    feedbackElement.textContent = "";
  }
}

function checkNumberInBrackets(inputElement, feedbackElement, errorMessage) {
  const value = inputElement.value.trim();
  const regex = /^(.+)\s\((\d+)\)$/;
  const match = value.match(regex);

  if (!value.includes("(") || !value.includes(")")) {
    feedbackElement.textContent =
      "Please include parentheses around the number.";
    feedbackElement.style.color = "red";
    inputElement.dataset.bracketError = "true";
    return;
  }

  if (match) {
    const textBeforeBrackets = match[1].trim();
    const numberInsideBrackets = parseInt(match[2], 10);

    if (textBeforeBrackets === "") {
      feedbackElement.textContent =
        "Please include text before the parentheses.";
      feedbackElement.style.color = "red";
      inputElement.dataset.bracketError = "true";
    } else if (isNaN(numberInsideBrackets) || numberInsideBrackets <= 0) {
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
  const strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!password.match(strongRegex)) {
    feedback.textContent =
      "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";
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

function checkUsername() {
  let username = document.getElementById("username").value;
  let warning = document.getElementById("exist-username");
  let submit_btn = document.getElementById("submit-btn");

  if (username.trim() === "") {
    warning.textContent = "";
    submit_btn.disabled = true;
  }

  fetch("check_username.php?username=" + encodeURIComponent(username))
    .then((response) => response.text())
    .then((data) => {
      warning.innerHTML = data;

      if (data.includes("Username already taken")) {
        submit_btn.disabled = true;
        warning.style.color = "red";
      } else {
        warning.style.color = "green";
        SignUpValid();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      warning.textContent = "Error checking username";
      warning.style.color = "red";
      submit_btn.disabled = true;
    });
}

function checkEmail() {
  let email = document.getElementById("e-mail").value;
  let warning = document.getElementById("exist-email");
  let submit_btn = document.getElementById("submit-btn");

  if (email.trim() === "") {
    warning.textContent = "";
    submit_btn.disabled = true;
    return;
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    warning.textContent = "(Please enter a valid e-mail)";
    warning.style.color = "red";
    submit_btn.disabled = true;
    return;
  }

  fetch("check_email.php?email=" + encodeURIComponent(email))
    .then((response) => response.text())
    .then((data) => {
      warning.innerHTML = data;
      if (data.includes("already in use")) {
        warning.style.color = "red";
        submit_btn.disabled = true;
      } else {
        warning.style.color = "green";
        SignUpValid();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      warning.textContent = "Error checking email";
      warning.style.color = "red";
      submit_btn.disabled = true;
    });
}

function SignUpValid() {
  let gender = document.getElementById("gender").value;
  let weight = parseFloat(document.getElementById("weight").value) || 0;
  let height = parseFloat(document.getElementById("height").value) / 100 || 0;
  let fitness_goal = document.getElementById("fitness-goal").value;
  let target_weight =
    parseFloat(document.getElementById("target-weight").value) || 0;
  let bmi = weight / height ** 2;
  let target_bmi = target_weight / height ** 2;

  let submit_btn = document.getElementById("submit-btn");
  let warningText = document.getElementById("all-valid");
  let isValid = true;

  // Check if any field is empty
  let inputs = document.querySelectorAll("form input, form select");
  let isEmpty = Array.from(inputs).some((input) => input.value.trim() === "");

  // Ensure fitness goal is not the default option
  if (fitness_goal === "") {
    isValid = false;
  } else if (gender === "") {
    isValid = false;
  }

  // Check valid BMI data
  if (bmi > 300 || bmi < 7) {
    document.getElementById("bmi").style.color = "red";
    document.getElementById("bmi").textContent =
      "Please enter appropriate weight and height";
    isValid = false;
  } else {
    document.getElementById("bmi").style.color = "black";
    document.getElementById("bmi").textContent = bmi.toFixed(2);
  }

  // Check valid target BMI data
  document.getElementById("target-warning").textContent = "";
  if (target_weight - weight > 4) {
    document.getElementById("target-warning").textContent =
      "Gaining more than 4kg / 9lbs is dangerous in a span of one month";
    isValid = false;
  } else if (weight - target_weight > 4) {
    document.getElementById("target-warning").textContent =
      "Losing more than 4kg / 9lbs is dangerous in a span of one month";
    isValid = false;
  } else {
    document.getElementById("target-bmi").textContent = target_bmi.toFixed(2);
  }

  // Disable submit button if any field is empty or invalid
  if (isEmpty || !isValid) {
    submit_btn.disabled = true;
    warningText.textContent =
      "Please make sure the input fields are correct and filled in";
  } else {
    submit_btn.disabled = false;
    warningText.textContent = "";
  }
}
