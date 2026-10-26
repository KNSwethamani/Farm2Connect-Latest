const params = new URLSearchParams(window.location.search);
const farmerId = params.get("id");
const productId = params.get("product_id");

const farmerName = document.getElementById("farmerName");
const farmerRole = document.getElementById("farmerRole");
const farmerPhone = document.getElementById("farmerPhone");
const farmerEmail = document.getElementById("farmerEmail");
const farmerProducts = document.getElementById("farmerProducts");
const contactFarmerBtn = document.getElementById("contactFarmerBtn");
const buyProductBtn = document.getElementById("buyProductBtn");
let farmerProductsData = [];

async function loadFarmerDetails() {
    if (!farmerId) {
        farmerName.textContent = "Farmer not found";
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/farmers/${farmerId}`
        );

        const data = await response.json();
        farmerProductsData = data.products || [];

        if (productId) {
            farmerProductsData = farmerProductsData.filter(
                product => String(product.product_id) === String(productId)
            );
        }

        if (!response.ok) {
            farmerName.textContent = data.message || "Farmer not found";
            return;
        }

        const farmer = data.farmer;

        farmerName.textContent = farmer.full_name;
        farmerRole.textContent = farmer.role;
        farmerPhone.textContent = farmer.phone;
        farmerEmail.textContent = farmer.email;

        if (!data.products || data.products.length === 0) {
            farmerProducts.textContent = "No products available.";
            return;
        }

        farmerProducts.innerHTML = "";

        farmerProductsData.forEach(product => {
            const productDiv = document.createElement("div");

            productDiv.innerHTML = `
                <p><strong>Product:</strong> ${product.product_name}</p>
                <p><strong>Available:</strong> ${product.quantity} ${product.unit}</p>
                <p><strong>Price:</strong> ₹${product.price_per_unit} / ${product.unit}</p>
                <p><strong>Description:</strong> ${product.description || "Not available"}</p>
                <hr>
            `;

            farmerProducts.appendChild(productDiv);
        });

    } catch (error) {
        console.error(error);
        farmerName.textContent = "Unable to connect to server.";
    }
}

contactFarmerBtn.addEventListener("click", () => {
    alert(
        `CONTACT FARMER\n\nFarmer: ${farmerName.textContent}\nPhone: ${farmerPhone.textContent}\nEmail: ${farmerEmail.textContent}`
    );
});

buyProductBtn.addEventListener("click", async () => {
    
    const searchData = JSON.parse(
    localStorage.getItem("farm2connectSearch") || "null"
);

if (!searchData || !searchData.quantity) {
    alert("Search details not found. Please search again.");
    return;
}

const quantity = Number(searchData.quantity);
    if (quantity <= 0) {
        alert("Invalid quantity.");
        return;
    }

    const user = JSON.parse(
        localStorage.getItem("farm2connectUser"));

    if (!user) {
        alert("Please login first.");
        return;
    }

    if (farmerProductsData.length === 0) {
        alert("No product available.");
        return;
    }

    const product = farmerProductsData[0];

    const confirmOrder = confirm(
        `Confirm Order\n\n` +
        `Product: ${product.product_name}\n` +
        `Quantity: ${quantity} ${product.unit}\n\n` +
        `Do you want to place this order?`
    );

    if (!confirmOrder) {
        alert("Order cancelled.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer_id: user.user_id,
                product_id: product.product_id,
                quantity: quantity
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Failed to place order.");
            return;
        }

        alert(
            `Order placed successfully!\n\n` +
            `Product: ${product.product_name}\n` +
            `Quantity: ${quantity} ${product.unit}`
        );

    } catch (error) {
        console.error("Order error:", error);
        alert("Unable to connect to the server.");
    }
});

loadFarmerDetails();



