const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('login-error');
  const greetingMessage = document.getElementById('greeting-message');
  const user = {
    username: usernameInput.value,
    password: passwordInput.value
  };

  fetch('http://localhost:3000/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        loginError.textContent = data.error;
      } else {
        const userId = data.userId;
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', user.username);
        loginError.textContent = '';
        greetingMessage.textContent = `Welcome, ${user.username}!`;
        setTimeout(() => {
          window.location.href = '/test/index.html';
        }, 2000);
      }
    })
    .catch(error => {
      console.error('Failed to login:', error);
    });
});