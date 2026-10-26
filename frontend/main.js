const produceList = [

    "Apple",
    "Apricot",
    "Ash Gourd",
    "Amaranth",
    "Amla",
    "Artichoke",

    "Banana",
    "Beetroot",
    "Bell Pepper",
    "Bitter Gourd",
    "Bottle Gourd",
    "Brinjal",
    "Broccoli",
    "Broad Beans",
    "Beans",

    "Cabbage",
    "Capsicum",
    "Carrot",
    "Cauliflower",
    "Celery",
    "Chow Chow",
    "Cluster Beans",
    "Coconut",
    "Corn",
    "Cucumber",
    "Curry Leaves",
    "Custard Apple",
    "Coriander",

    "Dates",
    "Drumstick",
    "Dragon Fruit",
    "Dill Leaves",

    "Eggplant",
    "Elephant Yam",
    "Endive",

    "Fig",
    "French Beans",
    "Field Beans",

    "Garlic",
    "Ginger",
    "Grapes",
    "Green Chilli",
    "Green Peas",
    "Guava",
    "Gooseberry",

    "Honeydew",
    "Hyacinth Beans",

    "Iceberg Lettuce",
    "Indian Gooseberry",
    "Ivy Gourd",

    "Jackfruit",
    "Jujube",

    "Kiwi",
    "Kohlrabi",
    "Kovakkai",

    "Lady's Finger",
    "Lemon",
    "Lime",
    "Long Beans",
    "Lettuce",

    "Mango",
    "Mangosteen",
    "Muskmelon",
    "Mint",
    "Moringa",
    "Maize",
    "Mushroom",

    "Nectarine",
    "Nendran Banana",

    "Onion",
    "Orange",
    "Okra",

    "Papaya",
    "Pomegranate",
    "Pineapple",
    "Potato",
    "Pumpkin",
    "Peas",
    "Pear",
    "Peach",
    "Plum",
    "Passion Fruit",
    "Plantain",
    "Pointed Gourd",

    "Quince",

    "Radish",
    "Ridge Gourd",
    "Raw Banana",
    "Raw Mango",
    "Raspberry",
    "Red Chilli",

    "Sapota",
    "Spinach",
    "Snake Gourd",
    "Shallots",
    "Sweet Potato",
    "Sweet Corn",
    "Strawberry",
    "Star Fruit",
    "Spring Onion",
    "Sorrel Leaves",

    "Tomato",
    "Taro",
    "Turnip",
    "Turmeric",
    "Tapioca",
    "Tamarind",
    "Tangerine",
    "Tree Tomato",
    "Thandu Keerai",
    "Thurai Beans",

    "Urad Beans",
    "Ulluco",

    "Vanilla",
    "Velvet Beans",

    "Watermelon",
    "Watercress",
    "White Pumpkin",
    "Winged Beans",

    "Xigua",

    "Yam",
    "Yellow Pumpkin",
    "Yellow Cucumber",

    "Zucchini"

];




// ==========================================
// HOMEPAGE ELEMENTS
// ==========================================

const produceSearch =
    document.getElementById("produceSearch");

const produceSuggestions =
    document.getElementById("produceSuggestions");

const searchButton =
    document.getElementById("searchButton");

const quantity =
    document.getElementById("quantity");

const unit =
    document.getElementById("unit");


// ==========================================
// HOMEPAGE AUTOCOMPLETE
// ==========================================

if (produceSearch && produceSuggestions) {

    produceSearch.addEventListener("input", function () {

        const searchValue =
            produceSearch.value.trim().toLowerCase();

        produceSuggestions.innerHTML = "";


        if (searchValue === "") {

            produceSuggestions.style.display = "none";

            return;
        }


        const matchingProduce =
            produceList.filter(function (produce) {

                return produce
                    .toLowerCase()
                    .startsWith(searchValue);

            });


        if (matchingProduce.length === 0) {

            produceSuggestions.style.display = "none";

            return;
        }


        matchingProduce.forEach(function (produce) {

            const suggestion =
                document.createElement("div");

            suggestion.className =
                "suggestion-item";

            suggestion.textContent =
                produce;


            suggestion.addEventListener(
                "click",
                function () {

                    produceSearch.value =
                        produce;

                    produceSuggestions.innerHTML =
                        "";

                    produceSuggestions.style.display =
                        "none";

                }
            );


            produceSuggestions.appendChild(
                suggestion
            );

        });


        produceSuggestions.style.display =
            "block";

    });

}


// ==========================================
// CLOSE SUGGESTIONS
// ==========================================

document.addEventListener("click", function (event) {

    if (
        produceSearch &&
        produceSuggestions &&
        !produceSearch.contains(event.target) &&
        !produceSuggestions.contains(event.target)
    ) {

        produceSuggestions.style.display =
            "none";

    }

});


// ==========================================
// HOMEPAGE SEARCH BUTTON
// ==========================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        function () {

            const selectedProduce =
                produceSearch.value.trim();

            const requiredQuantity =
                quantity.value;

            const selectedUnit =
                unit.value;


            if (selectedProduce === "") {

                alert(
                    "Please enter the produce you need."
                );

                produceSearch.focus();

                return;
            }


            if (
                requiredQuantity === "" ||
                Number(requiredQuantity) <= 0
            ) {

                alert(
                    "Please enter a valid quantity."
                );

                quantity.focus();

                return;
            }


            const searchData = {

                produce: selectedProduce,

                quantity:
                    Number(requiredQuantity),

                unit: selectedUnit

            };


            localStorage.setItem(
                "farm2connectSearch",
                JSON.stringify(searchData)
            );


            window.location.href =
                "search.html";

        }
    );

}

