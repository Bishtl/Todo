const API_URL = "https://jsonplaceholder.typicode.com/todos"; // Dummy API
const ITEMS_PER_PAGE = 10;

let todos = [];
let currentPage = 1;

// Fetch todos from API
async function fetchTodos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch todos");
    const data = await res.json();
    todos = data.map(todo => ({
      ...todo,
      date: new Date(Date.now() - Math.random() * 1e10).toISOString().split('T')[0] // Simulate random date
    }));
    renderTodos();
    renderPagination();
  } catch (error) {
    showError(error.message);
  }
}

// Render todos to the UI
function renderTodos() {
  const list = document.getElementById("todoList");
  list.innerHTML = "";

  let filtered = filterTodos(todos);
  const paginated = paginate(filtered, currentPage, ITEMS_PER_PAGE);

  if (paginated.length === 0) {
    list.innerHTML = `<li class="list-group-item">No tasks found.</li>`;
    return;
  }

  paginated.forEach(todo => {
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.innerText = `${todo.title} (Date: ${todo.date})`;
    list.appendChild(item);
  });
}

// Paginate todos
function paginate(items, page, perPage) {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

// Render pagination
function renderPagination() {
  const filtered = filterTodos(todos);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderTodos();
      renderPagination();
    });
    pagination.appendChild(li);
  }
}

// Filter by search and date
function filterTodos(data) {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  return data.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(search);
    const date = todo.date;
    const afterFrom = !from || date >= from;
    const beforeTo = !to || date <= to;
    return matchesSearch && afterFrom && beforeTo;
  });
}

// Add new todo
async function addTodo() {
  const input = document.getElementById("newTodo");
  const title = input.value.trim();
  if (!title) return;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, completed: false }),
    });
    if (!res.ok) throw new Error("Failed to add todo");

    const newTodo = await res.json();
    newTodo.date = new Date().toISOString().split('T')[0];
    todos.unshift(newTodo);
    input.value = "";
    currentPage = 1;
    renderTodos();
    renderPagination();
  } catch (error) {
    showError(error.message);
  }
}

// Show error
function showError(message) {
  const errBox = document.getElementById("errorMsg");
  errBox.classList.remove("d-none");
  errBox.innerText = message;
  setTimeout(() => errBox.classList.add("d-none"), 3000);
}

// Event Listeners
document.getElementById("addBtn").addEventListener("click", addTodo);
document.getElementById("filterBtn").addEventListener("click", () => {
  currentPage = 1;
  renderTodos();
  renderPagination();
});
document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1;
  renderTodos();
  renderPagination();
});

// Init
fetchTodos();
