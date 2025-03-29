async function checkUniqueName(
  inputElement,
  feedbackElement,
  existingMessage,
  table,
  column,
  button,
  id
) {
  const value = inputElement.value.trim();
  
  try {
    let exists = false;
    
    // Check the specific table
    exists = await checkTableUniqueness(table, column, value, id);
    
    if (exists) {
      feedbackElement.textContent = existingMessage;
      feedbackElement.style.color = "red";
      inputElement.dataset.uniqueError = "true";
      if (button) button.disabled = true;
      return true;
    } else {
      if (!inputElement.dataset.bracketError || inputElement.dataset.bracketError === "false") {
        feedbackElement.textContent = "";
      }
      inputElement.dataset.uniqueError = "false";
      if (button) button.disabled = false;
      return false;
    }
  } catch (error) {
    console.error("Error checking uniqueness:", error);
    feedbackElement.textContent = "An error occurred while checking the value.";
    feedbackElement.style.color = "red";
    inputElement.dataset.uniqueError = "true";
    if (button) button.disabled = true;
    return true;
  }
}

async function checkTableUniqueness(table, column, value, id) {
  let bodyParams = `table=${encodeURIComponent(table)}&column=${encodeURIComponent(column)}&value=${encodeURIComponent(value)}`;
  
  if (id) {
    bodyParams += `&id=${encodeURIComponent(id)}`;
  }
  
  const response = await fetch("inputValidation.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyParams,
  });
  
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data.exists;
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

async function checkUsername() {
  let username = document.getElementById("username").value;
  let warning = document.getElementById("exist-username");

  if (username.trim() === "") {
    warning.textContent = "";
    return false;
  }

  try {
    let response = await fetch(
      "check_username.php?username=" + encodeURIComponent(username)
    );
    let data = await response.text();

    warning.innerHTML = data;

    if (data.includes("Username already taken")) {
      warning.style.color = "red";
      return false;
    } else {
      warning.style.color = "green";
      return true;
    }
  } catch (error) {
    console.error("Error:", error);
    warning.textContent = "Error checking username";
    warning.style.color = "red";
    return false;
  }
}

async function checkEmail(inputValue, feedback) {
  let email = document.getElementById(inputValue).value;
  let warning = document.getElementById(feedback);

  if (email.trim() === "") {
    warning.textContent = "";
    return false;
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    warning.textContent = "(Please enter a valid e-mail)";
    warning.style.color = "red";
    return false;
  }

  try {
    let response = await fetch(
      "check_email.php?email=" + encodeURIComponent(email)
    );
    let data = await response.text();

    warning.innerHTML = data;

    if (data.includes("already in use")) {
      warning.style.color = "red";
      return false;
    } else {
      warning.style.color = "green";
      return true;
    }
  } catch (error) {
    console.error("Error:", error);
    warning.textContent = "Error checking email";
    warning.style.color = "red";
    return false;
  }
}

async function SignUpValid() {
  let age = parseInt(document.getElementById("age").value);
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

  // Run username and email checks in parallel
  let [isUsernameValid, isEmailValid] = await Promise.all([
    checkUsername(),
    checkEmail("e-mail", "exist-email"),
  ]);

  let isValid = isUsernameValid && isEmailValid;

  // Check if any field is empty
  let inputs = document.querySelectorAll("form input, form select");
  let isEmpty = Array.from(inputs).some((input) => input.value.trim() === "");

  // Check the age
  if (age === "" || age < 0 || age > 110) {
    document.getElementById("valid-age").style.color = "red";
    document.getElementById("valid-age").textContent =
      "Please enter a valid age";
    isValid = false;
  } else {
    document.getElementById("valid-age").textContent = "";
  }

  // Ensure fitness goal and gender are selected
  if (fitness_goal === "" || gender === "") {
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
  if (fitness_goal == "Gain weight" && target_weight < weight) {
    document.getElementById("target-warning").textContent =
      "Please enter a value greater than your current weight";
    isValid = false;
  } else if (fitness_goal == "Lose weight" && target_weight > weight) {
    document.getElementById("target-warning").textContent =
      "Please enter a value lesser than your current weight";
    isValid = false;
  } else if (fitness_goal == "Gain weight" && target_weight - weight > 4) {
    document.getElementById("target-warning").textContent =
      "Gaining more than 4KG (9lbs) in a span of one month is considered unhealthy";
    isValid = false;
  } else if (fitness_goal == "Lose weight" && weight - target_weight > 4) {
    document.getElementById("target-warning").textContent =
      "Losing more than 4KG (9lbs) in a span of one month is considered unhealthy";
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

function validateName(input, feedbackElement) {
  const name = input.value.trim();
  const minLength = 5;
  const maxLength = 100;
  const namePattern = /^[A-Za-z\s]+$/;
  feedbackElement.style.color = "red";

  if (name.length < minLength) {
    feedbackElement.textContent = `Name must be at least ${minLength} characters long.`;
  } else if (name.length > maxLength) {
    feedbackElement.textContent = `Name must be no more than ${maxLength} characters long.`;
  } else if (!namePattern.test(name)) {
    feedbackElement.textContent = "Name can only contain letters and spaces.";
  } else {
    feedbackElement.textContent = "";
  }
}

