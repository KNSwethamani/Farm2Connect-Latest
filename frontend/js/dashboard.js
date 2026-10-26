const user = JSON.parse(localStorage.getItem("farm2connectUser"));

if (!user) {
    window.location.href = "login.html";
}

const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");

const logoutBtn = document.getElementById("logoutBtn");
const productsBtn = document.getElementById("productsBtn");
const searchBtn = document.getElementById("searchBtn");
const ordersBtn = document.getElementById("ordersBtn");
const requestsBtn = document.getElementById("requestsBtn");

const adminButtons = document.getElementById("adminButtons");

const manageUsersBtn = document.getElementById("manageUsersBtn");
const manageProductsBtn = document.getElementById("manageProductsBtn");
const viewAllOrdersBtn = document.getElementById("viewAllOrdersBtn");

if (user && user.role.toUpperCase() === "ADMIN") {
    adminButtons.style.display = "grid";

    manageUsersBtn.addEventListener("click", () => {
        alert("Manage Users page is not created yet.");
    });

    manageProductsBtn.addEventListener("click", () => {
        alert("Manage Products page is not created yet.");
    });

    viewAllOrdersBtn.addEventListener("click", () => {
        alert("View All Orders page is not created yet.");
    });
}

if (user && user.role.toUpperCase() === "ADMIN") {
    adminButtons.style.display = "grid";
}

if (user) {
    userName.textContent = user.full_name;
    userRole.textContent = `${user.role } Dashboard`;
}

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("farm2connectUser");
    localStorage.removeItem("farm2connectSearch");
    window.location.href = "login.html";
});

productsBtn.addEventListener("click", () => {
    if (user.role.toUpperCase() === "FARMER") {
        window.location.href = "products.html";
    } else {
        alert("My Products is available for farmers.");
    }
});

searchBtn.addEventListener("click", () => {
    window.location.href = "search.html";
});

ordersBtn.addEventListener("click", async () => {
    if (user.role.toUpperCase() !== "CUSTOMER") {
        alert("My Orders is available for customers.");
        return;
    }

    await showOrders();
});

requestsBtn.addEventListener("click", async () => {
    const role = user.role.toUpperCase();

    if (role === "CUSTOMER") {
        await showRequests();
        return;
    }

    if (role === "FARMER") {
        await showFarmerRequests();
        return;
    }

    alert("Requests are not available for admins.");
});

async function showOrders() {
    try {
        const response = await fetch(
         `https://farm2connect.onrender.com/api/orders/customer/${user.user_id}`   
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to load orders.");
            return;
        }

        if (data.orders.length === 0) {
            alert("You have no orders yet.");
            return;
        }

        let message = "MY ORDERS\n\n";

        data.orders.forEach((order, index) => {
            message += `${index + 1}. ${order.product_name}\n`;
            message += `Quantity: ${order.quantity} ${order.unit}\n`;
            message += `Farmer: ${order.farmer_name}\n`;
            message += `Price: ₹${order.price_per_unit} / ${order.unit}\n`;
            message += `Status: ${order.order_status}\n`;
            message += `----------------------\n`;
        });

        alert(message);

    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
}

async function showRequests() {
    try {
        const response = await fetch(
        `https://farm2connect.onrender.com/api/requests/customer/${user.user_id}`   
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to load requests.");
            return;
        }

        if (data.requests.length === 0) {
            alert("You have no requests yet.");
            return;
        }

        let message = "MY REQUESTS\n\n";

        data.requests.forEach((request, index) => {
            message += `${index + 1}. ${request.product_name}\n`;
            message += `Required: ${request.required_quantity} ${request.unit}\n`;
            message += `Status: ${request.request_status}\n`;
            message += `----------------------\n`;
        });

        alert(message);

    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
}
async function showFarmerRequests() {
    console.log("FARMER REQUEST FUNCTION CALLED");

    try {
        const response = await fetch(
        `https://farm2connect.onrender.com/api/requests/farmer/${user.user_id}`    
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to load farmer requests.");
            return;
        }

        if (data.requests.length === 0) {
            alert("You have no customer requests yet.");
            return;
        }

        for (const request of data.requests) {
            const message =
                `CUSTOMER REQUEST\n\n` +
                `Product: ${request.product_name}\n` +
                `Customer: ${request.customer_name}\n` +
                `Required: ${request.required_quantity} ${request.unit}\n` +
                `Phone: ${request.customer_phone}\n` +
                `Status: ${request.request_status}\n\n` +
                `OK = Accept\nCancel = Reject`;

            const accepted = confirm(message);

            const status = accepted ? "ACCEPTED" : "REJECTED";

            const updateResponse = await fetch(
                `https://farm2connect.onrender.com/api/requests/${request.request_id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: status
                    })
                }
            );

            const result = await updateResponse.json();

            if (!updateResponse.ok) {
                alert(result.message || "Failed to update request.");
                continue;
            }

            alert(result.message);
        }

    } catch (error) {
        console.error("Farmer requests error:", error);
        alert("Unable to connect to the server.");
    }
}

