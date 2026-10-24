# TaskFlow | Task Manager & Productivity Tracker

A task management app with full CRUD, categories, due dates, filters, search and drag-and-drop reordering. Tasks are saved in the browser with `localStorage`, so they survive page reloads.

Built with plain HTML, CSS and JavaScript (ES6+). No frameworks, no build step.

## Features

- **Create** tasks with a title, category (Work, Personal, Study) and optional due date
- **Read** tasks in a clean list with category tags and overdue highlighting
- **Update** tasks through an edit dialog, and mark them complete with a checkbox
- **Delete** single tasks, or clear all completed tasks at once
- **Filter** by status (All, Active, Completed) and by category
- **Search** tasks instantly as you type
- **Drag and drop** to reorder tasks using the handle (⋮⋮)
- **Animations** for adding, completing (strike-through) and deleting tasks
- **Persistence** with `saveToLocalStorage()` and `loadFromLocalStorage()`
- Dark / light theme, responsive layout, keyboard-friendly and ARIA labels

## Project structure

```
task-2-task-manager/
├── index.html   # Markup: add form, filters, list, edit dialog
├── style.css    # Styling, themes, transitions
├── script.js    # State, CRUD, rendering, drag-and-drop, localStorage
└── README.md
```

## How it works

- State lives in a `tasks` array: `{ id, title, category, due, completed }`.
- Every change (add, edit, delete, complete, reorder) calls `saveToLocalStorage()`, then `render()` redraws the list.
- On page load, `loadFromLocalStorage()` restores the saved tasks.
- Task text is inserted with `textContent`, so user input is never run as HTML.

## Run locally

Open `index.html` in a browser, or run a local server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000

## Deploy

Push to GitHub, then enable **Settings → Pages → Deploy from a branch → `main` / `(root)`**. Live URL format:
`https://<username>.github.io/<repo>/task-2-task-manager/`

## Known limitations

- Drag and drop uses the HTML5 drag API, so it works with a mouse but not on most touch screens. Use filters and edit on mobile.
- Data is stored per browser and per device. Clearing site data removes your tasks.

## Tech stack

HTML5 · CSS3 · JavaScript (ES6+) · DOM manipulation · localStorage API · CSS transitions
