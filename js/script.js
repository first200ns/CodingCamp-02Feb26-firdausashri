const TODOS_KEY = 'todos_v1';
let todos = [];

function loadTodos() {
  todos = JSON.parse(localStorage.getItem(TODOS_KEY)) || [];
}

function saveTodos() {
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return d;
}

function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function renderTodos(filter = 'all') {
  const tbody = document.getElementById('todo-body');
  const emptyMsg = document.getElementById('empty-msg');
  tbody.innerHTML = '';

  const filtered = todos.filter(t => {
    if (filter === 'filter') return true;
    if (filter === 'completed') return t.completed === true;
    if (filter === 'incomplete') return t.completed === false;
    return true;
  });

  if (filtered.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  // sort by date (those without date go last)
  filtered.sort((a,b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });

  filtered.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-gray-300 hover:bg-gray-50';

    // Task
    const taskTd = document.createElement('td');
    const strikeClass = item.completed ? 'line-through text-gray-400' : 'text-gray-800';
    taskTd.className = `border border-gray-300 px-4 py-2 ${strikeClass}`;
    taskTd.textContent = item.title;

    // Due Date
    const dateTd = document.createElement('td');
    dateTd.className = `border border-gray-300 px-4 py-2 ${strikeClass}`;
    dateTd.textContent = item.date ? new Date(item.date).toLocaleDateString() : 'No date';

    // Status
    const statusTd = document.createElement('td');
    statusTd.className = 'border border-gray-300 px-4 py-2';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.completed || false;
    checkbox.className = 'w-5 h-5 cursor-pointer';
    checkbox.addEventListener('change', () => {
      const idx = todos.findIndex(t => t.id === item.id);
      if (idx !== -1) {
        todos[idx].completed = checkbox.checked;
        saveTodos();
        renderTodos(document.getElementById('filter-select').value);
      }
    });
    statusTd.appendChild(checkbox);

    // Action
    const actionTd = document.createElement('td');
    actionTd.className = 'border border-gray-300 px-4 py-2 flex gap-2';

    const edit = document.createElement('button');
    edit.className = 'btn-inline bg-yellow-100 text-yellow-800 px-3';
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => {
      // build inline edit UI in tr
      tr.innerHTML = '';
      const editTd = document.createElement('td');
      editTd.colSpan = '4';
      editTd.className = 'border border-gray-300 px-4 py-2';
      
      const editDiv = document.createElement('div');
      editDiv.className = 'flex flex-col gap-2';
      
      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.value = item.title;
      titleInput.className = 'px-2 py-1 border rounded';
      
      const dateInputEdit = document.createElement('input');
      dateInputEdit.type = 'date';
      dateInputEdit.value = item.date || '';
      dateInputEdit.className = 'px-2 py-1 border rounded';
      
      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'flex gap-2';
      
      const saveBtn = document.createElement('button');
      saveBtn.className = 'px-3 py-1 bg-green-600 text-white rounded';
      saveBtn.textContent = 'Save';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'px-3 py-1 bg-gray-200 rounded';
      cancelBtn.textContent = 'Cancel';

      saveBtn.addEventListener('click', () => {
        const newTitle = titleInput.value.trim();
        const newDate = dateInputEdit.value || null;
        if (!newTitle) return alert('Title cannot be empty');
        const idx = todos.findIndex(t => t.id === item.id);
        if (idx !== -1) {
          todos[idx].title = newTitle;
          todos[idx].date = newDate;
          saveTodos();
          renderTodos(document.getElementById('filter-select').value);
        }
      });

      cancelBtn.addEventListener('click', () => {
        renderTodos(document.getElementById('filter-select').value);
      });

      buttonsDiv.appendChild(saveBtn);
      buttonsDiv.appendChild(cancelBtn);
      editDiv.appendChild(titleInput);
      editDiv.appendChild(dateInputEdit);
      editDiv.appendChild(buttonsDiv);
      editTd.appendChild(editDiv);
      tr.appendChild(editTd);
    });

    const del = document.createElement('button');
    del.className = 'btn-inline bg-red-100 text-red-700 px-3';
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      todos = todos.filter(t => t.id !== item.id);
      saveTodos();
      renderTodos(document.getElementById('filter-select').value);
    });

    actionTd.appendChild(edit);
    actionTd.appendChild(del);

    tr.appendChild(taskTd);
    tr.appendChild(dateTd);
    tr.appendChild(statusTd);
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  });
}

function addTodo(title, date) {
  const id = Date.now().toString();
  todos.push({ id, title, date: date || null, completed: false });
  saveTodos();
  renderTodos(document.getElementById('filter-select').value);
}

document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const dateInput = document.getElementById('date-input');
  const filter = document.getElementById('filter-select');
  const clearAll = document.getElementById('clear-all');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    const date = dateInput.value || null;
    if (!text) return alert('Please enter a todo item.');
    addTodo(text, date);
    input.value = '';
    dateInput.value = '';
  });

  filter.addEventListener('change', () => {
    renderTodos(filter.value);
  });

  clearAll.addEventListener('click', () => {
    if (!confirm('Delete all todos?')) return;
    todos = [];
    saveTodos();
    renderTodos(filter.value);
  });

  renderTodos(filter.value);
});
