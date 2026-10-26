const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    registerMessage.textContent = "Creating your account...";

    try {
        const response = await fetch("https://farm2connect.onrender.com/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                full_name,
                email,
                password,
                phone,
                role
            })
        });

        const data = await response.json();

        if (response.ok) {
            registerMessage.textContent = "Account created successfully!";
            registerForm.reset();
        } else {
            registerMessage.textContent = data.message || "Registration failed.";
        }

    } catch (error) {
        console.error(error);
        registerMessage.textContent = "Unable to connect to the server.";
    }
});
