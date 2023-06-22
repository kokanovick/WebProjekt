const taskList = document.getElementById("task-list");
const userId = localStorage.getItem('userId');
const username = localStorage.getItem('username');
const taskName = document.getElementById("taskName");
taskName.textContent = "Task List for " + username + ":";
const greeting = document.getElementById("greetings");
greeting.textContent = "Hello " + username + "!";

const editTask = (taskId) => {
  let updatedTaskName = prompt("Enter the updated task name:");
  while (updatedTaskName.trim() === "") {
    alert("Task name cannot be empty.");
    updatedTaskName = prompt("Enter the updated task name:");
  }
  let updatedTaskDescription = prompt("Enter the updated task description:");
  if (updatedTaskDescription === null) {
    return;
  }
  while (updatedTaskDescription.trim() === "") {
    alert("Task description cannot be empty.");
    updatedTaskDescription = prompt("Enter the updated task description:");
  }
  let updatedTaskDueDate = prompt("Enter the updated task due date (DD-MM-YYYY)):");
  if (updatedTaskDueDate === null) {
    return;
  }
  const dateRegex = /^(0[1-9]|1\d|2\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
  while (!dateRegex.test(updatedTaskDueDate)) {
    while (updatedTaskDueDate.trim() === "") {
      alert("Task due date cannot be empty.");
      updatedTaskDueDate = prompt("Enter the updated task due date (DD-MM-YYYY)):");
    }
    alert("Your date format is incorrect.");
    updatedTaskDueDate = prompt("Please enter a valid task due date (DD-MM-YYYY):");
    if (updatedTaskDueDate === null) {
      return;
    }
  }
  // Convert the updated task due date to the MySQL format (YYYY-MM-DD)
  const [day, month, year] = updatedTaskDueDate.split('-');
  const mysqlFormattedDueDate = `${year}-${month}-${day}`;
  const updatedTask = {
    name: updatedTaskName,
    description: updatedTaskDescription,
    dueDate: mysqlFormattedDueDate
  };
  fetch(`http://localhost:3000/updateTask/${taskId}?userId=${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedTask)
  }).then(response => response.json())
  .then(data => {
    console.log(data);
    const taskElement = document.getElementById(`${taskId}`);
    if (taskElement) {
      const taskTextElement = taskElement.querySelector('span');
      taskTextElement.textContent = `${updatedTaskName} - ${updatedTaskDescription} - ${updatedTaskDueDate.replace(/-/g,'/')}`;
    }
  })
  .catch(error => {
    console.error('Failed to update task:', error);
  });
};

const removeTask = (taskId) => {
  fetch(`http://localhost:3000/deleteTask/${taskId}?userId=${userId}`, {
    method: 'DELETE',
    body: JSON.stringify(userId)
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const taskElement = document.getElementById(`${taskId}`);
      if (taskElement) {
        taskElement.remove();
      }
    })
    .catch(error => {
      console.error('Failed to delete task:', error);
    });
};

const markTaskAsFinished = (taskId, finished) => {
  const updatedTask = {
    finished: finished
  };
  fetch(`http://localhost:3000/finishTask/${taskId}?userId=${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedTask)
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const taskElement = document.getElementById(`${taskId}`);
      if (taskElement) {
        if (finished) {
          taskElement.classList.add('finished');
        } else {
          taskElement.classList.remove('finished');
        }
      }
    })
};

fetch(`http://localhost:3000/getUserTasks?userId=${userId}`)  
  .then((response) => response.json())
  .then((tasks) => {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach((task) => {
      const listItem = document.createElement('li');
      listItem.id = task.Task_ID;
      const taskTextElement = document.createElement('span');
      const dueDate = new Date(task.dueDate);
      const formattedDueDate = dueDate.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
      taskTextElement.textContent = `${task.name} - ${task.description} - ${formattedDueDate}`;
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.classList.add('edit-button');
      editButton.addEventListener('click', () => {
        editTask(listItem.id);
      });
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.classList.add('remove-button');
      removeButton.addEventListener('click', () => {
        removeTask(listItem.id);
      });
      const finishedCheckbox = document.createElement('input');
      finishedCheckbox.type = 'checkbox';
      finishedCheckbox.checked = task.finished;
      finishedCheckbox.addEventListener('change', () => {
        markTaskAsFinished(listItem.id, finishedCheckbox.checked);
      });
      listItem.appendChild(taskTextElement);
      listItem.appendChild(editButton);
      listItem.appendChild(removeButton);
      listItem.appendChild(finishedCheckbox);
      taskList.appendChild(listItem);
    });
  })
  .catch((error) => {
    console.error('Failed to fetch tasks:', error);
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