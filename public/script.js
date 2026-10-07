// Runs in the visitor's browser.
const button = document.getElementById("greet");
const message = document.getElementById("message");

button.addEventListener("click", () => {
  message.textContent = "Hello! The time is " + new Date().toLocaleTimeString();
});
