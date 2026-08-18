document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const successMessage = document.getElementById('successMessage');

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

  // Helper functions for error and success state
  function showError(input, message) {
    const formGroup = input.parentElement;
    const errorMsg = formGroup.querySelector('.error-msg');

    formGroup.classList.remove('success');
    formGroup.classList.add('error');
    if (errorMsg) {
      errorMsg.textContent = message;
    }
  }

  function showSuccess(input) {
    const formGroup = input.parentElement;
    const errorMsg = formGroup.querySelector('.error-msg');

    formGroup.classList.remove('error');
    formGroup.classList.add('success');
    if (errorMsg) {
      errorMsg.textContent = '';
    }
  }

  function clearState(input) {
    const formGroup = input.parentElement;
    const errorMsg = formGroup.querySelector('.error-msg');

    formGroup.classList.remove('error', 'success');
    if (errorMsg) {
      errorMsg.textContent = '';
    }
  }

  // Field Validations
  function validateUsername() {
    const value = usernameInput.value.trim();
    if (value === '') {
      showError(usernameInput, 'Username is required');
      return false;
    } else if (value.length < 3) {
      showError(usernameInput, 'Username must be at least 3 characters long');
      return false;
    }
    showSuccess(usernameInput);
    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (value === '') {
      showError(emailInput, 'Email address is required');
      return false;
    } else if (!emailRegex.test(value)) {
      showError(emailInput, 'Please enter a valid email address');
      return false;
    }
    showSuccess(emailInput);
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;
    if (value === '') {
      showError(passwordInput, 'Password is required');
      return false;
    } else if (value.length < 8) {
      showError(passwordInput, 'Password must be at least 8 characters long');
      return false;
    } else if (!passwordRegex.test(value)) {
      showError(passwordInput, 'Password must contain at least 1 letter and 1 number');
      return false;
    }
    showSuccess(passwordInput);

    // Re-validate confirm password if it already has value
    if (confirmPasswordInput.value !== '') {
      validateConfirmPassword();
    }
    return true;
  }

  function validateConfirmPassword() {
    const value = confirmPasswordInput.value;
    const passwordValue = passwordInput.value;

    if (value === '') {
      showError(confirmPasswordInput, 'Please confirm your password');
      return false;
    } else if (value !== passwordValue) {
      showError(confirmPasswordInput, 'Passwords do not match');
      return false;
    }
    showSuccess(confirmPasswordInput);
    return true;
  }

  // Real-time input validation listeners
  usernameInput.addEventListener('input', validateUsername);
  emailInput.addEventListener('input', validateEmail);
  passwordInput.addEventListener('input', validatePassword);
  confirmPasswordInput.addEventListener('input', validateConfirmPassword);

  // Form Submit listener
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isUsernameValid = validateUsername();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    const isFormValid = isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

    if (isFormValid) {
      successMessage.hidden = false;
      form.reset();

      [usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(clearState);

      setTimeout(() => {
        successMessage.hidden = true;
      }, 4000);
    } else {
      successMessage.hidden = true;
    }
  });
});
