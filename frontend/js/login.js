const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Checking your account...";

    try {
        const response = await fetch("https://farm2connect.onrender.com/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
    loginMessage.textContent = "Login successful!";

    localStorage.setItem(
        "farm2connectUser",
        JSON.stringify(data.user)
    );

    window.location.href = "dashboard.html";
    
    }else {
            loginMessage.textContent =
                data.message || "Invalid email or password.";
        }

    } catch (error) {
        console.error(error);
        loginMessage.textContent =
            "Unable to connect to the server.";
    }
});

