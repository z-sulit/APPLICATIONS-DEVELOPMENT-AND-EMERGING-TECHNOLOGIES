document.addEventListener('DOMContentLoaded', () => {
  // Views & Selection Buttons
  const selectionView = document.getElementById('selectionView');
  const formView = document.getElementById('formView');
  const btnChooseSignUp = document.getElementById('btnChooseSignUp');
  const btnChooseSignIn = document.getElementById('btnChooseSignIn');
  const backBtn = document.getElementById('backBtn');

  // Form Elements
  const form = document.getElementById('authForm');
  const formTitle = document.getElementById('formTitle');
  const formSubtext = document.getElementById('formSubtext');
  const submitBtn = document.getElementById('submitBtn');
  const successAlert = document.getElementById('successAlert');

  // Input groups & inputs
  const phoneGroup = document.getElementById('group-phone');

  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');

  let currentMode = 'signup'; // 'signup' or 'login'

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    [emailInput, phoneInput, passwordInput].forEach(clearState);
  }

  // View Switchers
  function showFormView(mode) {
    currentMode = mode;
    resetFormState();

    if (mode === 'signup') {
      formTitle.textContent = 'Sign Up';
      formSubtext.textContent = 'Please fill out the fields below to create an account.';
      submitBtn.textContent = 'Sign Up';

      phoneGroup.classList.remove('hidden');
    } else {
      formTitle.textContent = 'Login';
      formSubtext.textContent = 'Enter your email and password to log in.';
      submitBtn.textContent = 'Login';

      phoneGroup.classList.add('hidden');
    }

    selectionView.classList.add('hidden');
    formView.classList.remove('hidden');
  }

  function showSelectionView() {
    resetFormState();
    formView.classList.add('hidden');
    selectionView.classList.remove('hidden');
  }

  // Event Listeners for Buttons
  btnChooseSignUp.addEventListener('click', () => showFormView('signup'));
  btnChooseSignIn.addEventListener('click', () => showFormView('login'));
  backBtn.addEventListener('click', showSelectionView);

  // Field Validation Functions
  function validateEmail() {
    const value = emailInput.value.trim();
    if (value === '') {
      showError(emailInput, 'Email address is required.');
      return false;
    } else if (!emailRegex.test(value)) {
      showError(emailInput, 'Please enter a valid email format (e.g. user@domain.com).');
      return false;
    }
    showSuccess(emailInput);
    return true;
  }

  function validatePhone() {
    if (currentMode !== 'signup') return true;

    const value = phoneInput.value.trim();
    if (value === '') {
      showError(phoneInput, 'Phone number is required.');
      return false;
    }
    showSuccess(phoneInput);
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;

    if (value === '') {
      showError(passwordInput, 'Password is required.');
      return false;
    }

    if (currentMode === 'signup') {
      const hasMinLength = value.length >= 8;
      const hasNumber = /\d/.test(value);

      if (!hasMinLength && !hasNumber) {
        showError(passwordInput, 'Password must be at least 8 characters long and contain a number.');
        return false;
      } else if (!hasMinLength) {
        showError(passwordInput, 'Password must be at least 8 characters long.');
        return false;
      } else if (!hasNumber) {
        showError(passwordInput, 'Password must contain at least one number.');
        return false;
      }
    }

    showSuccess(passwordInput);
    return true;
  }

  // Real-time Event Handling (input & blur)
  emailInput.addEventListener('input', validateEmail);
  emailInput.addEventListener('blur', validateEmail);

  phoneInput.addEventListener('input', validatePhone);
  phoneInput.addEventListener('blur', validatePhone);

  passwordInput.addEventListener('input', validatePassword);
  passwordInput.addEventListener('blur', validatePassword);

  // Form Submit Event Handling
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = false;

    if (currentMode === 'signup') {
      const isEmailValid = validateEmail();
      const isPhoneValid = validatePhone();
      const isPasswordValid = validatePassword();
      isFormValid = isEmailValid && isPhoneValid && isPasswordValid;
    } else {
      const isEmailValid = validateEmail();
      const isPasswordValid = validatePassword();
      isFormValid = isEmailValid && isPasswordValid;
    }

    if (isFormValid) {
      const userVal = emailInput.value.trim().split('@')[0];
      // Display success alert & redirect to Welcome page
      successAlert.textContent = `${currentMode === 'signup' ? 'Sign Up' : 'Login'} validation successful! Redirecting...`;
      successAlert.hidden = false;

      setTimeout(() => {
        window.location.href = `welcome.html?mode=${currentMode}&user=${encodeURIComponent(userVal)}`;
      }, 1000);
    } else {
      successAlert.hidden = true;
    }
  });
});
