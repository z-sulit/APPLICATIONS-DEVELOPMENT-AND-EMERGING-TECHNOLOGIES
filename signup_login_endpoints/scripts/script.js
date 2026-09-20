// --- Shared Utilities ---
const alertBox = document.getElementById('alertBox');
const submitBtn = document.getElementById('submitBtn');

function showAlert(message, type = 'error') {
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
  alertBox.classList.remove('hidden');
}

function clearAlert() {
  if (!alertBox) return;
  alertBox.textContent = '';
  alertBox.className = 'alert hidden';
}

// --- Login Form Logic ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showAlert('400 Bad Request: Username and password are required.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 200) {
        showAlert(`200 OK: ${data.message || 'Login successful! Redirecting...'}`, 'success');
        sessionStorage.setItem('currentUser', JSON.stringify({ username }));
        setTimeout(() => { window.location.href = 'home.html'; }, 1000);
      } else if (response.status === 400) {
        showAlert(`400 Bad Request: ${data.message || 'Empty fields are not allowed.'}`, 'error');
      } else if (response.status === 401 || response.status === 404) {
        showAlert(`Error ${response.status}: ${data.message || 'Invalid username or password.'}`, 'error');
      } else {
        showAlert(`Error ${response.status}: ${data.message || 'Login failed.'}`, 'error');
      }
    } catch (error) {
      showAlert('Network error: Could not reach the backend server.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });
}

// --- Signup Form Logic ---
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  const emailInput = document.getElementById('email');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !username || !password) {
      showAlert('400 Bad Request: All fields (email, username, and password) are required.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing up...';

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 201) {
        showAlert(`201 Created: ${data.message || 'Signup successful! Redirecting...'}`, 'success');
        sessionStorage.setItem('currentUser', JSON.stringify({ username, email }));
        setTimeout(() => { window.location.href = 'home.html'; }, 1000);
      } else if (response.status === 409) {
        showAlert(`409 Conflict: ${data.message || 'User already exists.'}`, 'error');
      } else if (response.status === 400) {
        showAlert(`400 Bad Request: ${data.message || 'Empty fields are not allowed.'}`, 'error');
      } else {
        showAlert(`Error ${response.status}: ${data.message || 'Signup failed.'}`, 'error');
      }
    } catch (error) {
      showAlert('Network error: Could not reach the backend server.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up';
    }
  });
}
