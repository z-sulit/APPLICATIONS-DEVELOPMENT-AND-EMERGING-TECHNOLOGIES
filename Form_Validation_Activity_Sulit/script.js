document.addEventListener('DOMContentLoaded', () => {
  // Views & Buttons
  const selectionView = document.getElementById('selectionView');
  const formView = document.getElementById('formView');
  const btnChooseSignUp = document.getElementById('btnChooseSignUp');
  const btnChooseSignIn = document.getElementById('btnChooseSignIn');

  // Form Elements
  const form = document.getElementById('authForm');
  const formTitle = document.getElementById('formTitle');
  const formSubtext = document.getElementById('formSubtext');
  const submitBtn = document.getElementById('submitBtn');
  const successAlert = document.getElementById('successAlert');

  // Input groups & inputs
  const usernameGroup = document.getElementById('group-username');
  const confirmPasswordGroup = document.getElementById('group-confirmPassword');

  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  let currentMode = 'signup';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

  // Helper UI functions
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

  function resetFormState() {
    form.reset();
    successAlert.hidden = true;
    [usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(clearState);
  }

  function showFormView(mode) {
    currentMode = mode;
    resetFormState();

    if (mode === 'signup') {
      formTitle.textContent = 'Create Account';
      formSubtext.textContent = 'Please fill out the form below to register.';
      submitBtn.textContent = 'Register';

      usernameGroup.classList.remove('hidden');
      confirmPasswordGroup.classList.remove('hidden');
    } else {
      formTitle.textContent = 'Sign In';
      formSubtext.textContent = 'Enter your credentials to access your account.';
      submitBtn.textContent = 'Sign In';

      usernameGroup.classList.add('hidden');
      confirmPasswordGroup.classList.add('hidden');
    }

    selectionView.classList.add('hidden');
    formView.classList.remove('hidden');
  }

  // Event Listeners for Selection Screen
  btnChooseSignUp.addEventListener('click', () => showFormView('signup'));
  btnChooseSignIn.addEventListener('click', () => showFormView('signin'));

  // Field Validations
  function validateUsername() {
    if (currentMode !== 'signup') return true;
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
    }

    if (currentMode === 'signup') {
      if (value.length < 8) {
        showError(passwordInput, 'Password must be at least 8 characters long');
        return false;
      } else if (!passwordRegex.test(value)) {
        showError(passwordInput, 'Password must contain at least 1 letter and 1 number');
        return false;
      }
    }

    showSuccess(passwordInput);

    if (currentMode === 'signup' && confirmPasswordInput.value !== '') {
      validateConfirmPassword();
    }
    return true;
  }

  function validateConfirmPassword() {
    if (currentMode !== 'signup') return true;
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

  // Real-time input listeners
  usernameInput.addEventListener('input', validateUsername);
  emailInput.addEventListener('input', validateEmail);
  passwordInput.addEventListener('input', validatePassword);
  confirmPasswordInput.addEventListener('input', validateConfirmPassword);

  // Form Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = false;

    if (currentMode === 'signup') {
      const isUsernameValid = validateUsername();
      const isEmailValid = validateEmail();
      const isPasswordValid = validatePassword();
      const isConfirmPasswordValid = validateConfirmPassword();
      isValid = isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
    } else {
      const isEmailValid = validateEmail();
      const isPasswordValid = validatePassword();
      isValid = isEmailValid && isPasswordValid;
    }

    if (isValid) {
      const actionName = currentMode === 'signup' ? 'Registration' : 'Sign in';
      successAlert.textContent = `${actionName} successful!`;
      successAlert.hidden = false;

      form.reset();
      [usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(clearState);

      setTimeout(() => {
        successAlert.hidden = true;
      }, 4000);
    } else {
      successAlert.hidden = true;
    }
  });
});
