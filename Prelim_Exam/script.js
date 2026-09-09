// State shape: Single source of truth for the application
let tasks = [];
// Track task currently being edited; null if none
let editingTaskId = null;


const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const errorMsg = document.getElementById('error-msg');
const taskList = document.getElementById('task-list');
const deleteAllBtn = document.getElementById('delete-all-btn');

// Load tasks from localStorage on initialization
function loadTasks() {
    const saved = localStorage.getItem("todos");
    tasks = saved ? JSON.parse(saved) : [];
}

// Save current tasks array to localStorage
function saveTasks() {
    localStorage.setItem("todos", JSON.stringify(tasks));
}

// Render the tasks to the DOM based on current state
function render() {
    // Clear the current list
    taskList.innerHTML = "";
    
    // Re-build list items from the tasks array
    tasks.forEach(task => {
        const li = document.createElement('li');
        
        // If task is currently being edited, render input and action buttons
        if (task.id === editingTaskId) {
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = task.text;
            editInput.dataset.action = 'edit-input';
            editInput.dataset.id = task.id;
            
            // Save button
            const saveBtn = document.createElement('button');
            saveBtn.textContent = "Save";
            saveBtn.dataset.action = "save";
            saveBtn.dataset.id = task.id;
            
            // Cancel button
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = "Cancel";
            cancelBtn.dataset.action = "cancel";
            cancelBtn.dataset.id = task.id;
            
            li.appendChild(editInput);
            li.appendChild(saveBtn);
            li.appendChild(cancelBtn);
        } else {
            // Task text with conditional strikethrough for completed tasks
            const span = document.createElement('span');
            span.textContent = task.text;
            if (task.completed) {
                span.style.textDecoration = 'line-through';
            }
            
            // Toggle button
            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = task.completed ? "Undo" : "Done";
            toggleBtn.dataset.action = "toggle";
            toggleBtn.dataset.id = task.id;

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = "Edit";
            editBtn.dataset.action = "edit";
            editBtn.dataset.id = task.id;
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = "Delete";
            deleteBtn.dataset.action = "delete";
            deleteBtn.dataset.id = task.id;
            
            li.appendChild(span);
            li.appendChild(toggleBtn);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
        }
        
        taskList.appendChild(li);
    });
}

// Add a new task to the state
function addTask(text) {
    // nos to empty task
    if (text.trim() === "") {
        errorMsg.style.display = "block";
        return;
    }
    
    // Hide error message on successful validation
    errorMsg.style.display = "none";
    
    // Create new task object
    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false
    };
    
    // Update state, save, and render
    tasks.push(newTask);
    saveTasks();
    render();
    
    // Clear the input field
    taskInput.value = "";
}

// Toggle a task's completed status
function toggleTask(id) {
    const task = tasks.find(t => t.id === Number(id));
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

// Delete a specific task
function deleteTask(id) {
    if (editingTaskId === Number(id)) {
        editingTaskId = null;
    }
    tasks = tasks.filter(t => t.id !== Number(id));
    saveTasks();
    render();
}

// Start inline editing for a task
function startEditTask(id) {
    editingTaskId = Number(id);
    render();
}

// Cancel editing mode without saving changes
function cancelEditTask() {
    editingTaskId = null;
    render();
}

// Save the edited task text into state
function saveEditTask(id) {
    const task = tasks.find(t => t.id === Number(id));
    const editInput = taskList.querySelector(`input[data-action="edit-input"][data-id="${id}"]`);
    
    if (!task || !editInput) return;
    
    const newText = editInput.value.trim();
    // Validate: do not allow empty task content
    if (newText === "") {
        alert("Task cannot be empty");
        return;
    }
    
    task.text = newText;
    editingTaskId = null;
    saveTasks();
    render();
}

// Delete all tasks with a simulated asynchronous loading state
function deleteAllTasks() {
    editingTaskId = null;
    deleteAllBtn.disabled = true;
    deleteAllBtn.textContent = "Deleting...";
    
    // Simulate async operation
    setTimeout(() => {
        tasks = [];
        saveTasks();
        render();
        deleteAllBtn.disabled = false;
        deleteAllBtn.textContent = "Delete All";
    }, 2000);
}

// Event Listeners

// Form submission for adding tasks
taskForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default browser behavior
    addTask(taskInput.value);
});

// Event delegation for list items (Toggle, Edit, Save, Cancel, and Delete buttons)
taskList.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    const id = e.target.dataset.id;
    
    if (action === "toggle") {
        toggleTask(id);
    } else if (action === "edit") {
        startEditTask(id);
    } else if (action === "save") {
        saveEditTask(id);
    } else if (action === "cancel") {
        cancelEditTask();
    } else if (action === "delete") {
        deleteTask(id);
    }
});

// Enter key handling for inline editing input
taskList.addEventListener('keydown', (e) => {
    if (e.key === "Enter" && e.target.dataset.action === "edit-input") {
        e.preventDefault();
        saveEditTask(e.target.dataset.id);
    }
});

// Delete all button click
deleteAllBtn.addEventListener('click', deleteAllTasks);
loadTasks();
render();
