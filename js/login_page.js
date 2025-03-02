// forget_password.js
const open_modal_buttons = document.querySelectorAll("[data-modal-target]");
const close_modal_buttons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

open_modal_buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.querySelector(button.dataset.modalTarget);
    open_modal(modal);
  });
});

close_modal_buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".forget-password-modal");
    close_modal(modal);
  });
});

overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".forget-password-modal.active");
  modals.forEach((modal) => {
    close_modal(modal);
  });
});

function open_modal(modal) {
  if (modal == null) return;
  modal.classList.add("active");
  overlay.classList.add("active");
}

function close_modal(modal) {
  if (modal == null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
}

// email-otp.js
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.querySelector('.forget-password-modal');
  const overlay = document.getElementById('overlay');
  const emailInput = document.getElementById('email-verify');
  const otpInput = document.getElementById('email-otp');
  const otpWrapper = document.querySelector('.otp-wrapper');
  const otpWrapperInput = document.querySelector('.otp-input-wrapper');
  const modalButtons = document.querySelector('.modal-buttons');
  const verifyButton = modalButtons.querySelector('.otp-verify');
  const otpButton = modalButtons.querySelector('.otp-button');
  const modalBody = document.querySelector('.modal-body');

  let otpValue = ""; // Store OTP value
  let countdownInterval; // Store countdown interval
  let timeLeft = 60; // Countdown time in seconds

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function sendOTP() {
    const email = emailInput.value.trim();

    if (!isValidEmail(email)) {
      showNotification('Please enter a valid email', 'error');
      return;
    }

    otpValue = generateOTP();
    console.log("Generated OTP:", otpValue); // For testing purposes

    emailInput.disabled = true;
    otpInput.style.display = "block";

    verifyButton.style.display = 'none';
    otpButton.textContent = 'Verify';
    otpButton.style.display = 'block';
    otpButton.classList.remove('otp-button');

    const templateParams = {
      to_email: email,
      verification_code: otpValue
    };

    // Send email using Email.js
    emailjs.send('service_8umn0df', 'template_ulh1kc4', templateParams)
      .then(function (response) {
        console.log('Email successfully sent!', response);
        showNotification('Verification code sent to your email', 'success');
        startCountdown();
      })
      .catch(function (error) {
        console.error('Error sending email:', error);
        showNotification('Failed to send verification code. Please try again.', 'error');
        resetForm();
      });
  }

  function startCountdown() {
    const countdownElement = document.querySelector('.countdown');
    if (!countdownElement) {
      console.error('Countdown element not found');
      return;
    }

    countdownElement.style.textAlign = 'center';
    countdownElement.style.marginTop = '10px';
    countdownElement.style.color = '#ff946e';

    let timeLeft = 60;
    updateCountdown();

    const countdownInterval = setInterval(function () {
      timeLeft--;
      updateCountdown();

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);

        countdownElement.textContent = '';
        const resendButton = document.querySelector('.reset-vertification-btn');
        resendButton.textContent = 'Resend verification code';
        resendButton.className = 'resend-button';
        resendButton.style.width = '100%';
        resendButton.style.textAlign = 'center';
        resendButton.style.border = 'none';
        resendButton.style.fontFamily = 'Poppins';
        resendButton.style.fontWeight = '400';
        resendButton.style.color = "sandybrown";
        resendButton.style.marginTop = '10px';
        resendButton.style.transition = 'all 0.5s';
        resendButton.style.cursor = 'pointer';

        resendButton.addEventListener('click', function () {
          countdownElement.textContent = '';
          resendButton.remove();
          sendOTP();
        });
      }
    }, 1000);

    function updateCountdown() {
      countdownElement.textContent = `Reset vertification code in ${timeLeft} seconds`;
    }
  }

  // Function to verify OTP
  function verifyOTP() {
    const userInputOTP = otpInput.value.trim();

    if (userInputOTP === otpValue) {
      showNotification('Verification successful', 'success');
      showPasswordResetForm();
    } else {
      showNotification('Invalid verification code. Please try again.', 'error');
    }
  }

  // Function to show password reset form
  function showPasswordResetForm() {
    // Clear the modal body
    modalBody.innerHTML = '';

    // Create password reset form
    const passwordResetForm = document.createElement('div');
    passwordResetForm.className = 'password-reset-form';
    passwordResetForm.style.padding = '20px';

    // Email display (disabled)
    const emailDisplay = document.createElement('div');
    emailDisplay.className = 'email-display';
    emailDisplay.style.marginBottom = '15px';

    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email:';
    emailLabel.style.color = '#666666';
    emailLabel.style.display = 'block';
    emailLabel.style.marginBottom = '7px';

    const emailValue = document.createElement('input');
    emailValue.type = 'email';
    emailValue.value = emailInput.value;
    emailValue.disabled = true;
    emailValue.style.width = '100%';
    emailValue.style.padding = '10px';
    emailValue.style.border = '#ff946e 2px solid';
    emailValue.style.borderRadius = '8px';
    emailValue.style.boxSizing = 'border-box';
    emailValue.style.fontFamily = 'poppins';

    emailDisplay.appendChild(emailLabel);
    emailDisplay.appendChild(emailValue);

    // New password input
    const newPasswordWrapper = document.createElement('div');
    newPasswordWrapper.className = 'new-password-wrapper';
    newPasswordWrapper.style.marginBottom = '15px';

    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = 'New Password:';
    passwordLabel.style.color = '#666666';
    passwordLabel.style.display = 'block';
    passwordLabel.style.marginBottom = '7px';

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'new-password';
    passwordInput.placeholder = 'Enter new password';
    passwordInput.style.width = '100%';
    passwordInput.style.padding = '10px';
    passwordInput.style.border = '#ff946e 2px solid';
    passwordInput.style.borderRadius = '8px';
    passwordInput.style.boxSizing = 'border-box';
    passwordInput.style.fontFamily = 'poppins';

    newPasswordWrapper.appendChild(passwordLabel);
    newPasswordWrapper.appendChild(passwordInput);

    // Confirm password input
    const confirmPasswordWrapper = document.createElement('div');
    confirmPasswordWrapper.className = 'confirm-password-wrapper';
    confirmPasswordWrapper.style.marginBottom = '15px';

    const confirmLabel = document.createElement('label');
    confirmLabel.textContent = 'Confirm Password:';
    confirmLabel.style.color = '#666666';
    confirmLabel.style.display = 'block';
    confirmLabel.style.marginBottom = '7px';

    const confirmInput = document.createElement('input');
    confirmInput.type = 'password';
    confirmInput.id = 'confirm-password';
    confirmInput.placeholder = 'Confirm new password';
    confirmInput.style.width = '100%';
    confirmInput.style.padding = '10px';
    confirmInput.style.border = '#ff946e 2px solid';
    confirmInput.style.borderRadius = '8px';
    confirmInput.style.boxSizing = 'border-box';
    confirmInput.style.fontFamily = 'poppins';

    confirmPasswordWrapper.appendChild(confirmLabel);
    confirmPasswordWrapper.appendChild(confirmInput);

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Reset Password';
    submitButton.style.width = '100%';
    submitButton.style.backgroundColor = '#ff946e';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '5px';
    submitButton.style.fontFamily = 'poppins';
    submitButton.style.fontWeight = 'bold';
    submitButton.style.padding = '10px';
    submitButton.style.transition = 'all 0.5s';
    submitButton.style.color = 'white';
    submitButton.style.marginTop = '20px';
    submitButton.style.cursor = 'pointer';

    submitButton.addEventListener('click', function () {
      const newPassword = passwordInput.value;
      const confirmPassword = confirmInput.value;

      if (newPassword === '' || confirmPassword === '') {
        showNotification('Please fill in all fields', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
      }

      // Password reset logic would go here (API call, etc.)
      // For demo, just show success message
      showSuccessMessage();
    });

    passwordResetForm.appendChild(emailDisplay);
    passwordResetForm.appendChild(newPasswordWrapper);
    passwordResetForm.appendChild(confirmPasswordWrapper);
    passwordResetForm.appendChild(submitButton);

    modalBody.appendChild(passwordResetForm);
  }

  // Function to show success message with animation
  function showSuccessMessage() {
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Password changed successfully!';
    successMessage.style.backgroundColor = '#4CAF50';
    successMessage.style.color = 'white';
    successMessage.style.padding = '15px';
    successMessage.style.textAlign = 'center';
    successMessage.style.borderRadius = '5px';
    successMessage.style.position = 'fixed';
    successMessage.style.top = '-100px';
    successMessage.style.left = '50%';
    successMessage.style.transform = 'translateX(-50%)';
    successMessage.style.zIndex = '1000';
    successMessage.style.transition = 'top 0.5s ease-in-out';

    document.body.appendChild(successMessage);

    setTimeout(function () {
      successMessage.style.top = '20px';
    }, 100);

    setTimeout(function () {
      successMessage.style.top = '-100px';

      setTimeout(function () {
        successMessage.remove();
        close_modal(modal);
        resetFormCompletely();
      }, 500);
    }, 3000);
  }

  // Function to show notification
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    notification.style.padding = '15px';
    notification.style.textAlign = 'center';
    notification.style.borderRadius = '16px';
    notification.style.position = 'fixed';
    notification.style.top = '-100px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.zIndex = '1000';
    notification.style.transition = 'top 0.5s ease-in-out';
    notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    notification.style.minWidth = '300px';

    if (type === 'error') {
      notification.style.backgroundColor = '#f44336';
      notification.style.color = 'white';
    } else {
      notification.style.backgroundColor = '#4CAF50';
      notification.style.color = 'white';
    }

    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(note => note.remove());

    document.body.appendChild(notification);

    setTimeout(function () {
      notification.style.top = '20px';
    }, 100);

    setTimeout(function () {
      notification.style.top = '-100px';

      setTimeout(function () {
        notification.remove();
      }, 500);
    }, 3000);
  }

  function resetForm() {
    emailInput.disabled = false;
    otpInput.style.display = 'none';
    otpInput.value = '';
    verifyButton.style.display = 'block';
    otpButton.style.display = 'none';
    otpButton.textContent = 'Send OTP';
    otpButton.classList.add('otp-button');

    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    const countdownElement = document.querySelector('.countdown');
    if (countdownElement) {
      countdownElement.remove();
    }

    const resendButton = document.querySelector('.resend-button');
    if (resendButton) {
      resendButton.remove();
    }
  }

  // Function to completely reset the form (when reopening modal)
  function resetFormCompletely() {
    resetForm();
    emailInput.value = '';
    otpValue = "";
    timeLeft = 60;
  }

  // Event listeners
  otpButton.addEventListener('click', function () {
    if (otpButton.textContent === 'Send OTP') {
      sendOTP();
    } else {
      verifyOTP();
    }
  });

  verifyButton.addEventListener('click', function () {
    sendOTP();
  });

  document.querySelectorAll('[data-close-button]').forEach(button => {
    button.addEventListener('click', function () {
      const modal = button.closest('.forget-password-modal');
      resetFormCompletely(); /
    });
  });

  // Reset form when overlay is clicked (modal closed)
  overlay.addEventListener('click', function () {
    resetFormCompletely();
  });
});