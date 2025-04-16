const form = document.querySelector('form');
const todoInput = document.getElementById('todo-input');
const ul = document.getElementById('todo-list');
const inputAlert = document.querySelector('.inputAlert');
const okay = document.getElementById('okay');
const editModal = document.querySelector('.editModal');
const editInput = document.getElementById('editInput');
const updateBtn = document.getElementById('updateBtn');
const cancelBtn = document.getElementById('cancelBtn');
const deleteAlert = document.querySelector('.deleteAlert');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const displayP = document.getElementById('displayP');

let allTodos = getTodos();
let currentEditIndex = null;

updateTodos();

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const todoText = todoInput.value.trim();
    if (todoText) {
        allTodos.push({ text: todoText, completed: false });
        saveTodos();
        updateTodos();
        todoInput.value = "";
    } else {
        inputAlert.classList.add('active');
    }
});

okay.addEventListener('click', () => inputAlert.classList.remove('active'));

function updateTodos() {
    ul.innerHTML = '';
    allTodos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = 'todo';
        const todoId = `todo-${index}`;
        li.innerHTML = `
        <input type="checkbox" id="${todoId}" ${todo.completed ? 'checked' : ''}>
        <label for="${todoId}" class="custom-checkbox">
        <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        </label>
        <label for="${todoId}" class="todo-text">${todo.text}</label>
        <button class="editBtn">
        <svg fill="var(--btn-hover)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
        </button>
        <button class="deleteBtn">
        <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
        `;
        
        const checkbox = li.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            allTodos[index].completed = checkbox.checked;
            saveTodos();
        });
        
        li.querySelector('.editBtn').addEventListener('click', () => showEditModal(index));
        li.querySelector('.deleteBtn').addEventListener('click', () => showDeleteModal(index));
        
        ul.appendChild(li);
    });
}

function showEditModal(index) {
    currentEditIndex = index;
    editInput.value = allTodos[index].text;
    editModal.classList.add('active');
}

cancelBtn.addEventListener('click', () => {
    editModal.classList.remove('active');
    currentEditIndex = null;
});

updateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const updatedText = editInput.value.trim();
    if (updatedText && currentEditIndex !== null) {
        allTodos[currentEditIndex].text = updatedText;
        saveTodos();
        updateTodos();
        editModal.classList.remove('active');
        currentEditIndex = null;
    } 
});

function showDeleteModal(index) {
    displayP.textContent = allTodos[index].text;
    deleteAlert.classList.add('active');

    confirmDelete.onclick = () => {
        allTodos.splice(index, 1);
        saveTodos();
        updateTodos();
        deleteAlert.classList.remove('active');
    };
}

cancelDelete.addEventListener('click', () => deleteAlert.classList.remove('active'));

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(allTodos));
}

function getTodos() {
    return JSON.parse(localStorage.getItem('todos')) || [];
}
