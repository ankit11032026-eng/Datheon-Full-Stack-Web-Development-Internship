// ---------- Project data (edit here) ----------
const projects = [
  {
    title: "Hospital Management System",
    summary: "Digitizes hospital workflows: patients, appointments, beds and records.",
    type: "Personal project",
    points: [
      "Built a web-based system covering patient registration, doctor appointment scheduling and bed/record management.",
      "Designed reusable React components for patient records, appointments and admin dashboards, reducing manual paperwork and lookup time.",
      "Implemented role-based views for admin, doctor and receptionist users.",
      "Focused on a clean, responsive UI that works on desktop and mobile."
    ],
    tags: ["React.js", "JavaScript", "HTML/CSS"]
  },
  {
    title: "Face Recognition Attendance System",
    summary: "Marks attendance automatically with face recognition instead of manual roll calls.",
    type: "Personal project",
    points: [
      "Developed an automated attendance system that uses face recognition to mark attendance.",
      "Built the front-end capture and dashboard interface so admins can view, filter and export attendance records.",
      "Reduced time spent on attendance tracking and improved accuracy compared to paper-based methods."
    ],
    tags: ["JavaScript", "Web APIs", "HTML/CSS"]
  },
  {
    title: "LearnVerse: Online Learning Platform",
    summary: "An e-learning platform to browse courses, track progress and access material.",
    type: "Personal project",
    points: [
      "Designed and built a platform where students browse courses, track progress and access learning material in one place.",
      "Used a component-based Vue.js architecture for course listings, video/content pages and a student progress dashboard.",
      "Focused on clean navigation and a responsive layout across devices."
    ],
    tags: ["Vue.js", "JavaScript", "HTML/CSS"]
  }
];

const $ = (id) => document.getElementById(id);
const el = (tag, props = {}) => Object.assign(document.createElement(tag), props);

// ---------- Project cards + modal ----------
const grid = $("projectGrid");
const modal = $("modal");

projects.forEach((p) => {
  const card = el("button", { className: "card", type: "button" });
  card.append(el("h3", { textContent: p.title }), el("p", { textContent: p.summary }));
  const chips = el("div", { className: "chips" });
  p.tags.forEach((t) => chips.append(el("span", { textContent: t })));
  card.append(chips, el("span", { className: "more", textContent: "View details" }));
  card.addEventListener("click", () => openModal(p));
  grid.append(card);
});

function openModal(p) {
  $("mTitle").textContent = p.title;
  $("mType").textContent = p.type;
  $("mPoints").replaceChildren(...p.points.map((t) => el("li", { textContent: t })));
  $("mTags").replaceChildren(...p.tags.map((t) => el("span", { textContent: t })));
  modal.showModal();
}
$("mClose").addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

// ---------- Mobile menu ----------
const nav = $("nav");
const menuBtn = $("menuBtn");
function setMenu(open) {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "✕" : "☰";
}
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// ---------- Dark / light theme ----------
const root = document.documentElement;
const themeBtn = $("themeBtn");
function applyTheme(t) {
  root.dataset.theme = t;
  themeBtn.textContent = t === "dark" ? "☀" : "☾";
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
}
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
applyTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---------- Highlight active nav link ----------
const links = [...nav.querySelectorAll("a")];
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.hash === "#" + en.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));

$("yr").textContent = new Date().getFullYear();
