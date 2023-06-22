// Get the form element
const taskForm = document.getElementById("task-form");

// Add submit event listener to the form
taskForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    // Get the input values
    const taskNameInput = document.getElementById("task-name");
    const taskDescriptionInput = document.getElementById("task-description");
    const taskDueDateInput = document.getElementById("task-due-date");

    // Get the error elements
    const errorName = document.getElementById("error-name");
    const errorDescription = document.getElementById("error-description");
    const errorDueDate = document.getElementById("error-due-date");

    // Reset the error messages
    errorName.textContent = "";
    errorDescription.textContent = "";
    errorDueDate.textContent = "";

    // Validate the form inputs
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

    // If the form is valid, send the task data to the server
    if (isValid) {
        // Create a new task object with the input values
        const task = {
            name: taskNameInput.value.trim(),
            description: taskDescriptionInput.value.trim(),
            dueDate: taskDueDateInput.value
        };

        // Send the task data to the server using AJAX
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://example.com/api/tasks", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    // Task created successfully
                    console.log("Task created successfully");
                } else {
                    // Error occurred while creating the task
                    console.error("Error creating task");
                }
            }
        };

        xhr.send(JSON.stringify(task));
    }
});
