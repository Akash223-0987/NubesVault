const API_URL = "http://localhost:5000";

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = signupForm.name.value; // optional, not used in backend
  const email = signupForm.email.value;
  const password = signupForm.password.value;

  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.user.email);
      alert("Signup Successful!");
      window.location.href = "../index.html";
    } else {
      alert(data.msg || "Signup failed!");
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Try again later.");
  }
});
