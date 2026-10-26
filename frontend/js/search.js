
document.addEventListener("DOMContentLoaded", () => {

    const productNameInput = document.getElementById("productName");
    const quantityInput = document.getElementById("requiredQuantity");
    const unitInput = document.getElementById("unit");
    const searchButton = document.getElementById("searchButton");

    const farmerResults = document.getElementById("farmerResults");
    const resultsCount = document.getElementById("resultsCount");

    const resultProduce = document.getElementById("resultProduce");
    const resultQuantity = document.getElementById("resultQuantity");
    const savedSearch = localStorage.getItem("farm2connectSearch");

if (savedSearch) {
    const searchData = JSON.parse(savedSearch);

    if (productNameInput) {
        productNameInput.value = searchData.produce || "";
    }

    if (quantityInput) {
        quantityInput.value = searchData.quantity || "";
    }

    if (unitInput) {
    unitInput.value = searchData.unit || "kg";
    }

    if (resultProduce) {
        resultProduce.textContent = searchData.produce || "";
    }

    if (resultQuantity) {
        resultQuantity.textContent =
            `${searchData.quantity || ""} ${searchData.unit || "kg"}`;
    }

}

    // SEARCH BUTTON
    searchButton.addEventListener("click", () => {

        const produce = productNameInput.value.trim();
const quantity = quantityInput.value.trim();
const unit = unitInput.value;

// Validate input
if (!produce || !quantity || !unit) {
    alert("Please enter produce name and required quantity.");
    return;
}

if (Number(quantity) <= 0) {
    alert("Quantity must be greater than 0.");
    return;
}

localStorage.setItem("farm2connectSearch", JSON.stringify({
    
    produce: produce,
    quantity: quantity,
    unit: unit
}));

console.log("Saved search:", localStorage.getItem("farm2connectSearch"));

        // Show search details
        resultProduce.textContent = produce;
        resultQuantity.textContent = `${quantity} ${unit}`;


        // Show loading
        resultsCount.textContent = "Searching...";

        farmerResults.innerHTML = `
            <div class="no-results">
                <p>Finding available farmers...</p>
            </div>
        `;


        // Backend API
       const apiUrl = `https://farm2connect.onrender.com/api/products/search?product_name=${encodeURIComponent(produce)}&required_quantity=${encodeURIComponent(quantity)}&unit=${encodeURIComponent(unit)}`;
        console.log("Searching:", apiUrl);


        // Call backend
        fetch(apiUrl)

            .then(response => {

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                return response.json();

            })

            .then(data => {

                console.log("Backend response:", data);


                // Get products from API response
                const products = Array.isArray(data)
                    ? data
                    : (data.products || data.results || []);


                // Actual result count
                resultsCount.textContent =
                    `${products.length} Farmer${products.length !== 1 ? "s" : ""} Found`;


                // No farmers
                if (products.length === 0) {

                    farmerResults.innerHTML = `
                        <div class="no-results">

                            <h3>No Farmers Found</h3>

                            <p>
                                No farmer currently has
                                <strong>${escapeHTML(produce)}</strong>
                                available in the required quantity.
                            </p>

                        </div>
                    `;

                    return;
                }


                // Clear old results
                farmerResults.innerHTML = "";


                // Create farmer cards
                products.forEach(product => {

                    const farmerName =
                        product.farmer_name ||
                        product.farmerName ||
                        product.name ||
                        product.username ||
                        "Farmer";


                    const productName =
                        product.product_name ||
                        product.productName ||
                        product.produce_name ||
                        product.produceName ||
                        produce;


                    const availableQuantity =
                        product.available_quantity ??
                        product.availableQuantity ??
                        product.quantity ??
                        0;


                    const price =
                        product.price ??
                        product.price_per_unit ??
                        product.pricePerUnit ??
                        null;


                    const quality =
                        product.quality ||
                        "Fresh";


                    const location =
                        product.location ||
                        product.address ||
                        product.village ||
                        "Location not available";


                    const farmerId =
                        product.farmer_id ||
                        product.farmerId ||
                        product.user_id ||
                        product.userId ||
                        product.id ||
                        "";

                    const imageFile = {
                    tomato: "tomato.jpg",
                     onion: "onion.jpg"
                    };

                    const imageName = imageFile[productName.toLowerCase()] || "";

                    const productImage = imageName
                        ? `<img src="images/${imageName}" alt="${escapeHTML(productName)}" class="search-product-image">`
                                 : "🌱";
                    const card = document.createElement("div");

                    card.className = "farmer-result-card";


                    card.innerHTML = `

                        <div class="farmer-result-top">

                            <div class="farmer-avatar">
                                👨‍🌾
                            </div>

                            <div class="farmer-main-info">

                                <h3>
                                    ${escapeHTML(farmerName)}
                                </h3>

                                <span class="verified-badge">
                                    ✓ FARMER
                                </span>

                            </div>

                            <span class="availability-badge">
                                AVAILABLE
                            </span>

                        </div>


                        <div class="farmer-produce">

                            <h4>
    ${productImage} ${escapeHTML(productName)}
</h4>


                            <div class="farmer-details">

                                <div>
                                    <span>Available</span>

                                    <strong>
                                    ${escapeHTML(String(availableQuantity))} ${escapeHTML(String(product.unit || unit))}
                                    </strong>
                                </div>


                                <div>
                                    <span>Price</span>

                                    <strong>
                                        ${
                                            price !== null
                                                ? `₹${escapeHTML(String(price))}/${escapeHTML(String(product.unit || unit))}`
                                                : "Not specified"
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>Quality</span>

                                    <strong>
                                        ${escapeHTML(String(quality))}
                                    </strong>
                                </div>

                            </div>

                        </div>


                        <div class="farmer-location">
                            📍 ${escapeHTML(location)}
                        </div>


                        <div class="farmer-actions">

                            <a
                                href="farmer-details.html?id=${encodeURIComponent(farmerId)}&product_id=${encodeURIComponent(product.product_id)}"
                                class="primary-btn"
                            >
                                VIEW DETAILS
                            </a>
                            <button
                                class="contact-btn"
                                data-farmer-id="${escapeHTML(String(farmerId))}"
                            >
                                SEND REQUEST
                            </button>

                        </div>

                    `;
                    farmerResults.appendChild(card);
                });
                // Contact farmer buttons
document.querySelectorAll(".contact-btn").forEach(button => {

    button.addEventListener("click", async () => {

        const farmerId = button.dataset.farmerId;

        if (!farmerId) {
            alert("Farmer contact details are not available.");
            return;
        }

        const user = JSON.parse(
            localStorage.getItem("farm2connectUser")
            
        );

        if (!user) {
            alert("Please login to contact a farmer.");
            window.location.href = "login.html";
            return;
        }

        if (String(user.role).toUpperCase() !== "CUSTOMER") {
            alert("Only customers can contact farmers.");
            return;
        }

        const produce = productNameInput.value.trim();
        const quantity = quantityInput.value.trim();
        const unit = unitInput.value;

        if (!produce || !quantity || !unit) {
            alert("Please enter produce name and required quantity first.");
            return;
        }

        try {

            button.disabled = true;
            button.textContent = "SENDING...";

            const response = await fetch(
               "https://farm2connect.onrender.com/api/requests"
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        customer_id: user.user_id,
                        product_name: produce,
                        required_quantity: Number(quantity),
                        unit: unit
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to send request.");
                return;
            }

            alert(
                "Request sent successfully!\n\n" +
                "Produce: " + produce + "\n" +
                "Required: " + quantity + " " + unit
            );

        } catch (error) {

            console.error("Request error:", error);
            alert("Unable to connect to the server.");

        } finally {

            button.disabled = false;
            button.textContent = "SEND REQUEST";

        }

    });

});
            })


            .catch(error => {

                console.error("Search error:", error);

                resultsCount.textContent = "0 Farmers Found";


                farmerResults.innerHTML = `

                    <div class="no-results">

                        <h3>
                            Unable to Load Results
                        </h3>

                        <p>
                            Please make sure your backend server is running.
                        </p>

                    </div>

                `;

            });

    });

});


// Security helper
function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}




