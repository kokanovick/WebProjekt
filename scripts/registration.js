const registrationForm = document.getElementById('registration-form');

registrationForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Get the input values
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const emailInput = document.getElementById('email');

  // Get the error elements
  const usernameError = document.getElementById('username-error');
  const passwordError = document.getElementById('password-error');
  const emailError = document.getElementById('email-error');
  const successMessage = document.getElementById('success-submit');

  // Reset error messages
  usernameError.textContent = '';
  passwordError.textContent = '';
  emailError.textContent = '';
  successMessage.textContent = '';

  // Create a new user object with the input values
  const user = {
    username: usernameInput.value,
    password: passwordInput.value,
    email: emailInput.value,
  };

  // Send the user data to the server using fetch
  const response = await fetch('http://localhost:3000/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  });

  const data = await response.json();

  if (response.ok) {
    // Registration successful
    successMessage.textContent = data.message;
    console.log(data.message);
    usernameInput.value = '';
    passwordInput.value = '';
    emailInput.value = '';
  } else {
    // Registration failed
    if (data.error.includes('Username')) {
      usernameError.textContent = data.error;
    } else if (data.error.includes('Password')) {
      passwordError.textContent = data.error;
    } else if (data.error.includes('Email')) {
      emailError.textContent = data.error;
    }
  }
});
