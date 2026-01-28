const API_URL = "http://localhost:5000";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.user.email);
      alert("Login Successful!");
      window.location.href = "../index.html";
    } else {
      alert(data.msg || "Login failed!");
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Try again later.");
  }
});
