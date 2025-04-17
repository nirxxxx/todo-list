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
const select = document.getElementById('sortBy');
const searchInput = document.getElementById('search');

// State
let allTodos = getTodos();
let defaultSort = [...allTodos];
let currentEditIndex = null;
let searchTimeout;

// Initialize the app
updateTodos();
setupEventListeners();

function setupEventListeners() {
    // Event delegation for todo items
    ul.addEventListener('click', handleTodoClick);
    ul.addEventListener('change', handleTodoChange);

    // Sort listener
    select.addEventListener('change', handleSortChange);
    
    // Search listener with debounce
    searchInput.addEventListener('input', handleSearch);
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const todoText = todoInput.value.trim();
        if (todoText) {
            allTodos.push({
                text: todoText, 
                completed: false, 
                overflow: false
            });
            defaultSort = [...allTodos];
            saveTodos();    
            updateTodos();
            
            todoInput.value = "";
        } else {
            inputAlert.classList.add('active');
        }
    });

    // Modal buttons
    okay.addEventListener('click', () => inputAlert.classList.remove('active'));
    cancelBtn.addEventListener('click', () => editModal.classList.remove('active'));
    updateBtn.addEventListener('click', handleUpdate);
}

function handleTodoClick(e) {
    const li = e.target.closest('li');
    if (!li) return;
    
    const index = parseInt(li.dataset.index);
    
    if (e.target.closest('.editBtn')) {
        showEditModal(index);
    } else if (e.target.closest('.expand')) {
        const textLabel = li.querySelector('.todo-text');
        const svg = li.querySelector('.expand svg');
        
        textLabel.classList.toggle('expanded');
        svg.style.transform = textLabel.classList.contains('expanded') 
            ? 'rotate(180deg)' 
            : 'rotate(0deg)';
    } 
}

function handleTodoChange(e) {
    if (e.target.matches('input[type="checkbox"]')) {
        const li = e.target.closest('li');
        const index = parseInt(li.dataset.index);
        allTodos[index].completed = e.target.checked;
        saveTodos();
    }
}

function handleSortChange(e) {
    const selectedOption = e.target.value;
    let sortedTodos = [...defaultSort];
    
    switch(selectedOption) {
        case 'by-date':
            // already in original order
            break;
        case 'a-z':
            sortedTodos.sort((a, b) => a.text.localeCompare(b.text));
            break;
        case 'z-a':
            sortedTodos.sort((a, b) => b.text.localeCompare(a.text));
            break;
        case 'completed':
            sortedTodos = sortedTodos.filter(todo => todo.completed);
            break;
        case 'pending':
            sortedTodos = sortedTodos.filter(todo => !todo.completed);
            break;
    }
    
    allTodos = sortedTodos;
    updateTodos();
}

function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const query = searchInput.value.toLowerCase();
        if (query === '') {
            allTodos = [...defaultSort]; 
        } else {
            allTodos = defaultSort.filter(todo => 
                todo.text.toLowerCase().includes(query)
            );
        }
        updateTodos();
    }, 300);
}

function updateTodos() {
    const fragment = document.createDocumentFragment();
    
    allTodos.forEach((todo, index) => {
        let li = ul.querySelector(`li[data-index="${index}"]`);
        
        if (!li) {
            li = document.createElement('li');
            li.className = 'todo';
            li.dataset.index = index;
            li.innerHTML = `
                <input type="checkbox" id="todo-${index}">
                <label for="todo-${index}" class="custom-checkbox">
                    <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                </label>
                <label for="todo-${index}" class="todo-text">${todo.text}</label>
                <button class="expand">
                    <svg fill="var(--text-main)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-360 280-560h400L480-360Z"/></svg>
                </button>
                <button class="editBtn">
                    <svg fill="var(--btn-hover)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                </button>
                <button class="deleteBtn">
                    <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                </button>
            `;
        }
        
        // Update existing element
        const checkbox = li.querySelector('input[type="checkbox"]');
        const textLabel = li.querySelector('.todo-text');
        const expandBtn = li.querySelector('.expand');
        li.querySelector('.deleteBtn').addEventListener('click', () => showDeleteModal(index));
        const svg = expandBtn.querySelector('svg');

        textLabel.classList.remove('expanded');
        svg.style.transform = 'rotate(0deg)';
        
        checkbox.checked = todo.completed;
        textLabel.textContent = todo.text;
        textLabel.className = 'todo-text' + (todo.completed ? ' completed' : '');
        
        // Check overflow (deferred to prevent layout thrashing)
        setTimeout(() => {
            const isOver = isOverflown(textLabel);
            expandBtn.style.display = isOver ? 'block' : 'none';
            todo.overflow = isOver;
        }, 0);
        
        fragment.appendChild(li);
    });
    
    // Remove any extra elements
    const currentItems = ul.querySelectorAll('li');
    currentItems.forEach(item => {
        const index = parseInt(item.dataset.index);
        if (!allTodos[index]) {
            item.remove();
        }
    });
    
    ul.appendChild(fragment);
}

function showEditModal(index) {
    currentEditIndex = index;
    editInput.value = allTodos[index].text;
    editModal.classList.add('active');
}

function handleUpdate(e) {
    e.preventDefault();
    const updatedText = editInput.value.trim();
    if (updatedText && currentEditIndex !== null) {
        allTodos[currentEditIndex].text = updatedText;
        saveTodos();
        updateTodos();
        editModal.classList.remove('active');
        currentEditIndex = null;
    } 
}

function showDeleteModal(index) {
displayP.textContent = allTodos[index].text;
deleteAlert.classList.add('active');

confirmDelete.onclick = () => {
    allTodos.splice(index, 1);
    defaultSort = [...allTodos];
    saveTodos();
    updateTodos();
    deleteAlert.classList.remove('active');
    console.log('not here')
};
}
cancelDelete.addEventListener('click', () => deleteAlert.classList.remove('active'));



function isOverflown(element) {
    return element.scrollWidth > element.clientWidth;
}

function saveTodos() {
    const currentTodos = JSON.parse(localStorage.getItem('todos')) || [];
    if (JSON.stringify(defaultSort) !== JSON.stringify(currentTodos)) {
        localStorage.setItem('todos', JSON.stringify(defaultSort));
    }
    allTodos = [...defaultSort];
}

function getTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    return todos;
}

// Handle window resize with debounce
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        document.querySelectorAll('.todo-text').forEach((textLabel, index) => {
            const expandBtn = textLabel.closest('li').querySelector('.expand');
            const isOver = isOverflown(textLabel);
            
            expandBtn.style.display = isOver ? 'block' : 'none';
            if (allTodos[index]) {
                allTodos[index].overflow = isOver;
            }
        });
    }, 100);
});