const productForm = document.getElementById("productForm");
const productMessage = document.getElementById("productMessage");
const productsList = document.getElementById("productsList");
const logoutBtn = document.getElementById("logoutBtn");

const user = JSON.parse(localStorage.getItem("farm2connectUser"));

const API_URL = "https://farm2connect.onrender.com";

// Check login
if (!user) {
    window.location.href = "login.html";
}


// Allow only farmers
if (user && user.role.toUpperCase() !== "FARMER") {
    alert("Only farmers can add products.");
    window.location.href = "dashboard.html";
}


// Add product
productForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const product_name =
        document.getElementById("product_name").value.trim();

    const quantity =
        document.getElementById("quantity").value;

    const unit =
        document.getElementById("unit").value;

    const price_per_unit =
        document.getElementById("price_per_unit").value;

    const description =
        document.getElementById("description").value.trim();


    productMessage.textContent = "Adding product...";


    try {

        
const response = await fetch(
    "https://farm2connect.onrender.com/api/products",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            farmer_id: user.user_id,
            product_name,
            quantity,
            unit,
            price_per_unit,
            description
        })
    }
);



        const data = await response.json();


        if (response.ok) {

            productMessage.textContent =
                "Product added successfully! 🌱";

            productForm.reset();

            loadProducts();

        } else {

            productMessage.textContent =
                data.message || "Failed to add product.";

        }

    } catch (error) {

        console.error(error);

        productMessage.textContent =
            "Unable to connect to the server.";

    }

});


// Load farmer's products
async function loadProducts() {
    try {
        const response = await fetch(
            `https://farm2connect.onrender.com/api/products/farmer/${user.user_id}`
        );

        const data = await response.json();

        if (!response.ok) {
            return;
        }

        if (!data.products || data.products.length === 0) {
            productsList.innerHTML =
                "<p class='products-empty'>No products listed yet. Add your first product!</p>";
            return;
        }

        productsList.innerHTML = "";
        productsList.className = "listed-products-grid";

        data.products.forEach((product) => {
            const name = product.product_name || "Vegetable";
            const key = name.toLowerCase().replace(/[^a-z]/g, "");
            const vegetables = {
    tomato: ["tomato.jpg", "🍅"],
    onion: ["onion.jpg", "🧅"],
    potato: ["potato.jpg", "🥔"],
    carrot: ["carrot.jpg", "🥕"],
    brinjal: ["brinjal.jpg", "🍆"],
    eggplant: ["brinjal.jpg", "🍆"],
    cabbage: ["cabbage.jpg", "🥬"],
    cauliflower: ["cauliflower.jpg", "🥦"],
    broccoli: ["broccoli.jpg", "🥦"],
    cucumber: ["cucumber.jpg", "🥒"],
    chilli: ["chilli.jpg", "🌶️"],
    chili: ["chilli.jpg", "🌶️"],
    pumpkin: ["pumpkin.jpg", "🎃"],
    corn: ["corn.jpg", "🌽"],
    sweetcorn: ["sweetcorn.jpg", "🌽"],
    garlic: ["garlic.jpg", "🧄"],
    beetroot: ["beetroot.jpg", "🫜"],
    radish: ["radish.jpg", "🥕"],
    capsicum: ["capsicum.jpg", "🫑"],
    bellpepper: ["bellpepper.jpg", "🫑"],
    spinach: ["spinach.jpg", "🥬"],
    beans: ["beans.jpg", "🫛"],
    peas: ["peas.jpg", "🫛"],
    lemon: ["lemon.jpg", "🍋"],
    okra: ["okra.jpg", "🥬"],
    ladiesfinger: ["okra.jpg", "🥬"],
    bittergourd: ["bittergourd.jpg", "🥒"],
    bottlegourd: ["bottlegourd.jpg", "🥒"],
    ridgegourd: ["ridgegourd.jpg", "🥒"],
    drumstick: ["drumstick.jpg", "🌿"],
    sweetpotato: ["sweetpotato.jpg", "🍠"],
    yam: ["yam.jpg", "🥔"],
    turnip: ["turnip.jpg", "🥕"],
    lettuce: ["lettuce.jpg", "🥬"],
    celery: ["celery.jpg", "🌿"],
    mushroom: ["mushroom.jpg", "🍄"],
    ginger: ["ginger.jpg", "🫚"],
    coriander: ["coriander.jpg", "🌿"],
    mint: ["mint.jpg", "🌿"],
    springonion: ["springonion.jpg", "🧅"]
};

            const match = Object.keys(vegetables).find(
                vegetable => key.includes(vegetable)
            );

            const imageFile = match ? vegetables[match][0] : "";
            const emoji = match ? vegetables[match][1] : "🥬";

            const productCard = document.createElement("article");
            productCard.className = "listed-product-card";

            const imageArea = document.createElement("div");
            imageArea.className = "listed-product-image";

            if (imageFile) {
                const image = document.createElement("img");
                image.src = `images/${imageFile}`;
                image.alt = name;
                image.onerror = () => {
                    imageArea.innerHTML = "";
                    const fallback = document.createElement("span");
                    fallback.textContent = emoji;
                    imageArea.appendChild(fallback);
                };
                imageArea.appendChild(image);
            } else {
                const fallback = document.createElement("span");
                fallback.textContent = emoji;
                imageArea.appendChild(fallback);
            }

            const details = document.createElement("div");
            details.className = "listed-product-details";

            const title = document.createElement("h3");
            title.textContent = name;

            const quantity = document.createElement("p");
            quantity.className = "listed-product-quantity";
            quantity.textContent =
                `Available: ${product.quantity} ${product.unit}`;

            const price = document.createElement("p");
            price.className = "listed-product-price";
            price.textContent =
                `₹${product.price_per_unit} / ${product.unit}`;

            const description = document.createElement("p");
            description.className = "listed-product-description";
            description.textContent =
                product.description || "Fresh produce from our farm.";

            details.append(title, quantity, price, description);
            

const buttons = document.createElement("div");
buttons.className = "product-actions";

const editBtn = document.createElement("button");
editBtn.textContent = "Edit";
editBtn.type = "button";
editBtn.onclick = () => editProduct(product);

const deleteBtn = document.createElement("button");
deleteBtn.textContent = "Delete";
deleteBtn.type = "button";
deleteBtn.onclick = () => deleteProduct(product.product_id);

buttons.append(editBtn, deleteBtn);
details.appendChild(buttons);
            productCard.append(imageArea, details);
            productsList.appendChild(productCard);
        });
    } catch (error) {
        console.error(error);
        productsList.innerHTML =
            "<p class='products-empty'>Unable to load products. Please try again.</p>";
    }
}

async function editProduct(product) {
    const quantity = prompt("Enter new quantity:", product.quantity);
    if (quantity === null) return;

    const price = prompt("Enter new price:", product.price_per_unit);
    if (price === null) return;

    const description = prompt("Enter new description:", product.description || "");
    if (description === null) return;

    const user = JSON.parse(localStorage.getItem("farm2connectUser"));

    try {
        const response = await fetch(
            `https://farm2connect.onrender.com/api/products/${product.product_id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    farmer_id: user.user_id,
                    quantity: quantity,
                    price_per_unit: price,
                    description: description
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("Product updated successfully!");
            loadProducts();
        } else {
            alert(data.message || "Failed to update product.");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
}


async function editProduct(product) {
    const quantity = prompt("Enter new quantity:", product.quantity);
    if (quantity === null) return;

    const price = prompt("Enter new price:", product.price_per_unit);
    if (price === null) return;

    const description = prompt("Enter new description:", product.description || "");
    if (description === null) return;

    const user = JSON.parse(localStorage.getItem("farm2connectUser"));

    try {
        const response = await fetch(
            `https://farm2connect.onrender.com/api/products/${product.product_id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    farmer_id: user.user_id,
                    quantity: quantity,
                    price_per_unit: price,
                    description: description
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("Product updated successfully!");
            loadProducts();
        } else {
            alert(data.message || "Failed to update product.");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
}


async function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    const user = JSON.parse(localStorage.getItem("farm2connectUser"));

    try {
        const response = await fetch(
            `https://farm2connect.onrender.com/api/products/${productId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    farmer_id: user.user_id
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("Product deleted successfully!");
            loadProducts();
        } else {
            alert(data.message || "Failed to delete product.");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
}


// Logout
logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("farm2connectUser");

    window.location.href = "login.html";

});


// Load products when page opens
loadProducts();

