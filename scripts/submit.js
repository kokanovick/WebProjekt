const taskForm = document.getElementById("task-form");
const greeting = document.getElementById("greetings");
const username = localStorage.getItem('username');
greeting.textContent = "Hello " + username + "!";
const taskName = document.getElementById("taskName");
taskName.textContent = "Add task form for " + username + ":";

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const taskNameInput = document.getElementById("task-name");
  const taskDescriptionInput = document.getElementById("task-description");
  const taskDueDateInput = document.getElementById("task-due-date");
  const errorName = document.getElementById("error-name");
  const errorDescription = document.getElementById("error-description");
  const errorDueDate = document.getElementById("error-due-date");
  const successMessage = document.getElementById("success-submit");
  errorName.textContent = "";
  errorDescription.textContent = "";
  errorDueDate.textContent = "";
  let isValid = true;

  if (taskNameInput.value.trim() === "") {
    errorName.textContent = "Please enter a task name";
    isValid = false;
  }
  if (taskDescriptionInput.value.trim() === "") {
    errorDescription.textContent = "Please enter a task description";
    isValid = false;
  }
  if (taskDueDateInput.value === "") {
    errorDueDate.textContent = "Please select a due date";
    isValid = false;
  }
  if (isValid) {
    const userId = localStorage.getItem("userId");
    const task = {
      name: taskNameInput.value.trim(),
      description: taskDescriptionInput.value.trim(),
      dueDate: taskDueDateInput.value,
      user_id: userId,
    };
    fetch("http://localhost:3000/createTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Task created successfully") {
          console.log("Task created successfully");
          successMessage.textContent = data.message;
          taskNameInput.value = "";
          taskDescriptionInput.value = "";
          taskDueDateInput.value = "";
        } else {
          console.error("Error creating task");
        }
      })
      .catch((error) => {
        console.error("Failed to create task:", error);
      });
  }
});

function checkLoggedIn() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert("You must login first!");
    window.location.href = '/test/login.html';
  } 
}
window.addEventListener('DOMContentLoaded', checkLoggedIn);

const logOffButton = document.getElementById("logout-button");
logOffButton.addEventListener("click", function () {
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  const redirectUrl = "http://localhost:80/test/login.html";
  window.location.href = redirectUrl;
});