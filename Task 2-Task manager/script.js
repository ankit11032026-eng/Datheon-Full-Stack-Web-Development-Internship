// ---------- State ----------
const STORAGE_KEY = "taskflow.tasks.v1";
let tasks = [];                 // { id, title, category, due, completed }
let filter = "all";             // all | active | completed
let catFilter = "all";
let query = "";
let dragId = null;

const $ = (id) => document.getElementById(id);
const list = $("list");

// ---------- localStorage helpers ----------
function saveToLocalStorage() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (e) { console.warn("Could not save tasks", e); }
}
function loadFromLocalStorage() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    tasks = Array.isArray(data) ? data : [];
  } catch (e) { tasks = []; }
}

// ---------- Helpers ----------
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fmtDate = (s) => new Date(s + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };

// ---------- CRUD ----------
function addTask(title, category, due) {
  tasks.unshift({ id: uid(), title: title.trim(), category, due: due || "", completed: false });
  saveToLocalStorage(); render();
}
function updateTask(id, changes) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, ...changes } : t));
  saveToLocalStorage(); render();
}
function deleteTask(id, node) {
  const finish = () => { tasks = tasks.filter((t) => t.id !== id); saveToLocalStorage(); render(); };
  if (node) { node.classList.add("removing"); setTimeout(finish, 280); } else finish();
}

// ---------- Render ----------
function visibleTasks() {
  const q = query.trim().toLowerCase();
  return tasks.filter((t) =>
    (filter === "all" || (filter === "active" ? !t.completed : t.completed)) &&
    (catFilter === "all" || t.category === catFilter) &&
    (!q || t.title.toLowerCase().includes(q)));
}

function render() {
  const shown = visibleTasks();
  list.replaceChildren(...shown.map(taskNode));

  const empty = $("empty");
  empty.hidden = shown.length > 0;
  if (!shown.length) {
    empty.textContent = tasks.length ? "No tasks match your filters." : "No tasks yet. Add your first task above.";
  }
  const left = tasks.filter((t) => !t.completed).length;
  $("count").textContent = `${left} active, ${tasks.length - left} completed`;
  $("summary").textContent = tasks.length ? `You have ${left} task${left === 1 ? "" : "s"} left.` : "Plan your day, one task at a time.";
  $("clearDone").hidden = tasks.length === left;
}

function taskNode(t) {
  const li = el("li", { className: "task" + (t.completed ? " done" : ""), draggable: false });
  li.dataset.id = t.id;

  const handle = el("span", { className: "handle", textContent: "⋮⋮", title: "Drag to reorder" });
  handle.setAttribute("aria-hidden", "true");
  handle.addEventListener("mousedown", () => (li.draggable = true));
  handle.addEventListener("mouseup", () => (li.draggable = false));

  const check = el("input", { type: "checkbox", className: "check", checked: t.completed });
  check.setAttribute("aria-label", `Mark "${t.title}" as complete`);
  check.addEventListener("change", () => {
    li.classList.toggle("done", check.checked);               // play strike-through animation first
    setTimeout(() => updateTask(t.id, { completed: check.checked }), 350);
  });

  const meta = el("div", { className: "meta" }, el("span", { className: "tag " + t.category, textContent: t.category }));
  if (t.due) {
    const overdue = !t.completed && t.due < todayStr();
    meta.append(el("span", { className: overdue ? "overdue" : "", textContent: (overdue ? "Overdue: " : "Due ") + fmtDate(t.due) }));
  }
  const body = el("div", { className: "body" }, el("span", { className: "name", textContent: t.title }), meta);

  const edit = el("button", { className: "act", type: "button", textContent: "Edit" });
  edit.addEventListener("click", () => openEdit(t));
  const del = el("button", { className: "act del", type: "button", textContent: "Delete" });
  del.setAttribute("aria-label", `Delete "${t.title}"`);
  del.addEventListener("click", () => deleteTask(t.id, li));

  li.append(handle, check, body, el("div", { className: "actions" }, edit, del));

  // Drag and drop reordering
  li.addEventListener("dragstart", (e) => { dragId = t.id; li.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", t.id); });
  li.addEventListener("dragend", () => { dragId = null; li.draggable = false; li.classList.remove("dragging"); document.querySelectorAll(".over").forEach((n) => n.classList.remove("over")); });
  li.addEventListener("dragover", (e) => { if (dragId && dragId !== t.id) { e.preventDefault(); li.classList.add("over"); } });
  li.addEventListener("dragleave", () => li.classList.remove("over"));
  li.addEventListener("drop", (e) => { e.preventDefault(); li.classList.remove("over"); reorder(dragId, t.id); });
  return li;
}

function reorder(fromId, toId) {
  if (!fromId || fromId === toId) return;
  const from = tasks.findIndex((t) => t.id === fromId);
  const [moved] = tasks.splice(from, 1);
  const to = tasks.findIndex((t) => t.id === toId);
  tasks.splice(to, 0, moved);
  saveToLocalStorage(); render();
}

// ---------- Edit dialog ----------
const dlg = $("editDlg");
let editingId = null;
function openEdit(t) {
  editingId = t.id;
  $("eTitle").value = t.title; $("eCategory").value = t.category; $("eDue").value = t.due;
  dlg.showModal();
}
$("editForm").addEventListener("submit", () => {
  const title = $("eTitle").value.trim();
  if (title) updateTask(editingId, { title, category: $("eCategory").value, due: $("eDue").value });
});
$("eCancel").addEventListener("click", () => dlg.close());
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

// ---------- Events ----------
$("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("title").value;
  if (!title.trim()) return;
  addTask(title, $("category").value, $("due").value);
  $("title").value = ""; $("due").value = ""; $("title").focus();
});
document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => {
  filter = b.dataset.filter;
  document.querySelectorAll(".tab").forEach((x) => { const on = x === b; x.classList.toggle("active", on); x.setAttribute("aria-pressed", on); });
  render();
}));
$("catFilter").addEventListener("change", (e) => { catFilter = e.target.value; render(); });
$("search").addEventListener("input", (e) => { query = e.target.value; render(); });
$("clearDone").addEventListener("click", () => { tasks = tasks.filter((t) => !t.completed); saveToLocalStorage(); render(); });

// ---------- Theme ----------
const root = document.documentElement, themeBtn = $("themeBtn");
function applyTheme(t) {
  root.dataset.theme = t;
  themeBtn.textContent = t === "dark" ? "☀" : "☾";
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
}
let savedTheme = null;
try { savedTheme = localStorage.getItem("taskflow.theme"); } catch (e) {}
applyTheme(savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("taskflow.theme", next); } catch (e) {}
});

// ---------- Init ----------
loadFromLocalStorage();
render();
