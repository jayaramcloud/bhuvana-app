// Runs in the visitor's browser.

// ---- Left navigation: show one section at a time ----
const navButtons = document.querySelectorAll(".nav-btn");
const panels = document.querySelectorAll(".panel");

function renderSection(id) {
  panels.forEach((p) => p.classList.toggle("active", p.id === id));
  navButtons.forEach((b) => b.classList.toggle("active", b.dataset.target === id));
}

// Update the URL so Back/Forward work, but do NOT re-render here: the
// hashchange listener below handles that, so a single click renders once.
function showSection(id, { push = true } = {}) {
  renderSection(id);
  if (push) {
    history.pushState(null, "", "#" + id);
  }
}

navButtons.forEach((b) => b.addEventListener("click", () => showSection(b.dataset.target)));

// Back/Forward buttons and in-page hash links (e.g. <a href="#contact">).
window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  renderSection(document.getElementById(id) ? id : "home");
});

// Open the section named in the URL (e.g. /#contact), otherwise Home.
const startId = location.hash.slice(1);
showSection(document.getElementById(startId) ? startId : "home", { push: false });

// ---- Tabs (top level) ----
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

function showTab(name) {
  tabPanes.forEach((p) => p.classList.toggle("active", p.dataset.pane === name));
  tabButtons.forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
}

tabButtons.forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

// ---- Subtabs (inside Technical) ----
const subtabButtons = document.querySelectorAll(".subtab-btn");
const subtabPanes = document.querySelectorAll(".subtab-pane");

function showSubtab(name) {
  subtabPanes.forEach((p) => p.classList.toggle("active", p.dataset.subpane === name));
  subtabButtons.forEach((b) => b.classList.toggle("active", b.dataset.subtab === name));
}

subtabButtons.forEach((b) => b.addEventListener("click", () => showSubtab(b.dataset.subtab)));
