// Runs in the visitor's browser.

// ---- Left navigation: show one section at a time ----
const navButtons = document.querySelectorAll(".nav-btn");
const panels = document.querySelectorAll(".panel");

function showSection(id) {
  panels.forEach((p) => p.classList.toggle("active", p.id === id));
  navButtons.forEach((b) => b.classList.toggle("active", b.dataset.target === id));
  history.replaceState(null, "", "#" + id);
}

navButtons.forEach((b) => b.addEventListener("click", () => showSection(b.dataset.target)));

// Open the section named in the URL (e.g. /#contact), otherwise Home.
const startId = location.hash.slice(1);
showSection(document.getElementById(startId) ? startId : "home");

// ---- Home page demo button ----
const greet = document.getElementById("greet");
const message = document.getElementById("message");

greet.addEventListener("click", () => {
  message.textContent = "Hello! The time is " + new Date().toLocaleTimeString();
});
