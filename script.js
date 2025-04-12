const themeToggle = document.getElementById("theme-toggle");
const errorMsg = document.getElementById("error-msg");

document.getElementById("login-btn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    errorMsg.textContent = "Please enter both username and password.";
    return;
  }

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.userId) {
      localStorage.setItem('userId', data.userId);
      window.location.href = '/chat.html';
    } else {
      errorMsg.textContent = "Invalid credentials. Try again.";
    }
  } catch (err) {
    errorMsg.textContent = "Server error. Please try later.";
    console.error(err);
  }
});

// Theme toggle functionality
themeToggle.addEventListener("click", () => {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  const newTheme = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
  themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
});