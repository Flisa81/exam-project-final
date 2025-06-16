const API_BASE = "https://v2.api.noroff.dev";
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// Utility to safely redirect to home page
function redirectToHome() {
  const isSubPage = location.pathname.includes("/account/") || location.pathname.includes("/post/");
  const prefix = isSubPage ? "../" : "./";
  window.location.href = `${prefix}index.html`;
}

// LOGIN
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.data.accessToken;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data.data));

        // ✅ Create API key
        const keyResponse = await fetch(`${API_BASE}/auth/create-api-key`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const keyData = await keyResponse.json();
        if (keyResponse.ok) {
          localStorage.setItem("apiKey", keyData.data.key);
        }

        alert("Login successful!");
        redirectToHome();
      } else {
        alert(data.errors?.[0]?.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please try again.");
    }
  });
}

// REGISTER
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = registerForm.name.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value.trim();
    const confirmPassword = registerForm["confirm-password"].value.trim();

    const message = document.getElementById("message");
    if (password !== confirmPassword) {
      message.textContent = "Passwords do not match.";
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! You can now log in.");
        // Stay in /account/, go to login
        window.location.href = "login.html";
      } else {
        message.textContent = data.errors?.[0]?.message || "Registration failed.";
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Registration failed. Please try again.");
    }
  });
}
