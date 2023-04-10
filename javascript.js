import mustache from "https://cdn.skypack.dev/mustache@4.2.0";
import html2canvas from "https://cdn.skypack.dev/html2canvas";

let selectedCards = 0;
let requiredCrystals = {};
let providedCrystals = {};

const selectedCardsList = document.querySelector("#selected-cards-list");

// Create "select all" button
const selectAllButton = document.createElement("button");
selectAllButton.textContent = "Add All";
selectAllButton.addEventListener("click", () => {
    const gridCards = document.querySelectorAll("#card-grid .card-container");
    gridCards.forEach((card) => {
        if (!card.classList.contains("selected")) {
            console.log(card)
            saveSelectedCards(card);
            card.classList.add("flash");
            setTimeout(() => {
                card.classList.remove("flash");
            }, 500);
        }
    });
});

// Add button to selection info div
const selectionInfo = document.querySelector("#selection-info");
selectionInfo.insertBefore(selectAllButton, selectedCardsList);


const removeAllButton = document.createElement("button");
removeAllButton.innerText = "Remove All";
removeAllButton.classList.add("remove-all-button");
removeAllButton.style.display = selectedCardsList.children.length > 5 ? "block" : "none";
selectedCardsList.parentNode.appendChild(removeAllButton);

removeAllButton.addEventListener("click", () => {
    selectedCardsList.innerHTML = "";
    removeAllButton.style.display = "none";
    const selectedCards = selectedCardsList.querySelectorAll("li").length;
    const selectedCount = document.querySelector("#selected-count");
    selectedCount.textContent = selectedCards;
});


// Render card templates
function renderCards(jsonData) {

    for (const card in jsonData) {
        const cardTemplate = document.querySelector("#card-template").innerHTML;
        const renderedCard = mustache.render(cardTemplate, jsonData[card]);
        const cardElement = document.createElement("div");

        cardElement.classList.add("card-container");
        cardElement.innerHTML = renderedCard;
        cardElement.setAttribute("data-json", JSON.stringify(jsonData[card]));
        document.querySelector("#card-grid").appendChild(cardElement);
        cardElement.addEventListener("click", () => {
            saveSelectedCards(cardElement);
            cardElement.classList.add("flash");
            setTimeout(() => {
                cardElement.classList.remove("flash");
            }, 500); // duration of the animation in milliseconds
        })
    }
}
document.querySelector("#save-deck-button").addEventListener("click", () => {
    const selectedCardsList = document.querySelector("#selected-cards-list");
    const selectedCards = selectedCardsList.querySelectorAll("li");
    const deckData = [];

    for (const selectedCard of selectedCards) {
        const cardData = JSON.parse(selectedCard.getAttribute("data-json"));
        deckData.push(cardData);
    }

    const deckJson = JSON.stringify(deckData);
    const blob = new Blob([deckJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.download = "deck.json";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.getElementById("btn-Convert-Html2Image").addEventListener("click", async function () {
    const cards = document.getElementsByClassName("card");
    document.getElementById("pagination").innerHTML += "<p><h3>Generated JPGs:</h3></p>";
    document.getElementById("pagination").innerHTML += "<p><button>Download All</button></p>";
    burgerMenu.classList.toggle("close");
    overlay.classList.toggle("overlay");

    for (const card of cards) {
        const name = card.querySelector(".title").textContent;
        const canvas = await html2canvas(card, {allowTaint: true, logging: true, taintTest: false});
        const anchorTag = document.createElement("a");
        document.body.appendChild(anchorTag);
        document.getElementById("previewImg").appendChild(canvas);
        anchorTag.download = name + ".jpg";
        try {
            anchorTag.href = canvas.toDataURL();
            anchorTag.target = '_blank';
            anchorTag.click();
        } catch (e) {
            if (e.name !== "SecurityError") {
                throw e;
            }
        }
    }
});

function saveSelectedCards(cardElement) {
    const selectedCardsList = document.querySelector("#selected-cards-list");

    const cardData = JSON.parse(cardElement.getAttribute("data-json"));
    const li = document.createElement("li");
    li.setAttribute("data-json", JSON.stringify(cardData));
    li.textContent = cardData.name + " (" + cardData.type + ")";
    removeAllButton.style.display = selectedCardsList.children.length > 5 ? "block" : "none";

    const removeButton = document.createElement("button");
    removeButton.classList.add("remove-button");
    removeButton.addEventListener("click", () => {
        li.remove();
        const selectedCards = selectedCardsList.querySelectorAll("li").length;
        const selectedCount = document.querySelector("#selected-count");
        selectedCount.textContent = selectedCards;
    });
    li.appendChild(removeButton);

    selectedCardsList.appendChild(li);

    const selectedCards = selectedCardsList.querySelectorAll("li").length;

    const saveDeckButton = document.querySelector("#save-deck-button");
    saveDeckButton.style.display = selectedCards > 0 ? "block" : "none";

    if (selectedCards === 0) {
        requiredCrystals = {};
        providedCrystals = {};
    }

    const required = cardData.crystals.requires;
    const provided = cardData.crystals.provides;

    // Update required and provided crystals variables
    Object.keys(required).forEach(color => {
        requiredCrystals[color] = (requiredCrystals[color] || 0) + required[color];
    });
    Object.keys(provided).forEach(color => {
        providedCrystals[color] = (providedCrystals[color] || 0) + provided[color];
    });

    // Update deck status text
    const deckStatus = document.querySelector("#deck-status");
    const selectedCount = document.querySelector("#selected-count");
    selectedCount.textContent = selectedCards;
    const requiredCrystalsText = Object.values(requiredCrystals).join(", ");
    const providedCrystalsText = Object.values(providedCrystals).join(", ");

    if (selectedCards > 0) {
        if (JSON.stringify(requiredCrystals) === JSON.stringify(providedCrystals)) {
            //deckStatus.textContent = "Deck ready";
        } else {
            //deckStatus.textContent = `Deck not ready, Required Crystals: ${requiredCrystalsText}, Provided Crystals: ${providedCrystalsText}.`;
        }
    } else {
        //deckStatus.textContent = "Deck not ready";
    }

    selectedCount.textContent = selectedCards;
}

const burgerMenu = document.getElementById('burger-menu');
const overlay = document.getElementById('menu');

function toggleOverlay() {
    overlay.classList.toggle("overlay");
}

burgerMenu.addEventListener('click', toggleOverlay);
overlay.addEventListener('click', toggleOverlay);

async function filterData(filter, currentPage = 1, jsonData) {
    const values = Object.values(jsonData);
    let filtered = values.filter((value) => {
        const valueString = JSON.stringify(value).toLowerCase();
        const words = filter.split(",").map((word) => word.trim());
        return words.every((word) => {
            if (word.toLowerCase().startsWith("type:")) {
                // Handle type filter separately
                const typeValue = word.split(":")[1].toLowerCase().trim();
                if (Array.isArray(value.type)) {
                    return value.type.includes(typeValue);
                }
                return value.type.toLowerCase() === typeValue;
            } else if (word.toLowerCase().startsWith("crystals:")) {
                // Handle crystals filter separately
                const crystalsValue = word.split(":")[1].toLowerCase().trim();
                console.log(value.crystals);
                const crystalsObject = value.crystals;
                if (crystalsObject && crystalsObject.requires && crystalsObject.requires.length > 0) {
                    console.log(crystalsObject)
                    return crystalsObject.requires.includes(crystalsValue)
                }

                if (crystalsObject && crystalsObject.provides && crystalsObject.provides.length > 0) {
                    console.log(crystalsObject)
                    return crystalsObject.provides.includes(crystalsValue);
                }

                return false;
            } else {
                // Regular text filter
                const isIncluded = valueString.includes(word.toLowerCase());
                if (word.includes(" ")) {
                    // Handle multi-word queries
                    const multiWordQuery = word.toLowerCase().split(" ");
                    return isIncluded && multiWordQuery.every(query => valueString.includes(query));
                }
                return isIncluded;
            }
        });
    }).filter((value) => {
        // Handle additional filters
        const valueString = JSON.stringify(value).toLowerCase();
        const words = filter.split(",").map((word) => word.trim());
        const typeFilters = words.filter((word) => word.toLowerCase().startsWith("type:"));
        const crystalsFilters = words.filter((word) => word.toLowerCase().startsWith("crystals:"));
        const additionalFilters = words.filter((word) => !word.toLowerCase().startsWith("type:") && !word.toLowerCase().startsWith("crystals:"));
        return additionalFilters.every((word) => valueString.includes(word.toLowerCase())) &&
            typeFilters.every((filter) => {
                const typeValue = filter.split(":")[1].toLowerCase().trim();
                if (Array.isArray(value.type)) {
                    return value.type.includes(typeValue);
                }
                return value.type.toLowerCase() === typeValue;
            }) &&
            crystalsFilters.every((filter) => {
                const crystalsValue = filter.split(":")[1].toLowerCase().trim();
                const crystalsObject = value.crystals;
                if (crystalsObject && (crystalsObject.requires.length > 0 || crystalsObject.provides.length > 0)) {
                    return crystalsObject.requires.includes(crystalsValue) || crystalsObject.provides.includes(crystalsValue);
                }
                return false;
            });
    });

    const itemsPerPage = 20;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedResults = filtered.slice(start, end);
    document.querySelector("#card-grid").innerHTML = "";
    renderCards(paginatedResults);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const nextPageButton = document.createElement("button");
    nextPageButton.innerText = "Next Page";
    nextPageButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            filterData(filter, currentPage, loadedData);
        }
    });
    const previousPageButton = document.createElement("button");
    previousPageButton.innerText = "Previous Page";
    previousPageButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            filterData(filter, currentPage, loadedData);
        }
    });
    const pageButtonsContainer = document.createElement("div");
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = i;
        if (i === currentPage) {
            pageButton.disabled = true;
        } else {
            pageButton.addEventListener("click", () => {
                filterData(filter, i, loadedData);
            });
        }
        pageButtonsContainer.appendChild(pageButton);
    }
    document.querySelector("#pagination").innerHTML = "";
    document.querySelector("#pagination").appendChild(previousPageButton);
    document.querySelector("#pagination").appendChild(pageButtonsContainer);
    document.querySelector("#pagination").appendChild(nextPageButton);
}

let loadedData = {};

async function loadStartUp() {
    selectedCardsList.innerHTML = "";
    removeAllButton.style.display = "none";
    const selectedCards = selectedCardsList.querySelectorAll("li").length;
    const selectedCount = document.querySelector("#selected-count");
    selectedCount.textContent = selectedCards;
    const json = await fetch("HoH_all.json");
    loadedData = await json.json();
    await filterData("", 1, loadedData);
}

loadStartUp();

const myInput = document.getElementById('my-input');
myInput.addEventListener('keyup', async function() {
    await filterData(this.value.toLowerCase(), 1, loadedData);
});

window.addEventListener('load', async function() {
    const filter = myInput.value.toLowerCase();
    if (filter) {
        await filterData(filter, 1, loadedData);
    }
});

// Load JSON file
const loadJsonButton = document.querySelector("#load-json");
loadJsonButton.addEventListener("click", function() {
    const jsonFileInput = document.querySelector("#json-file-input");
    jsonFileInput.click();
});

document.querySelector("#load-hoh").addEventListener("click", async function() {
    await loadStartUp();
    console.log("");
});

const jsonFileInput = document.querySelector("#json-file-input");
jsonFileInput.addEventListener("change", function() {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const fileData = event.target.result;
        try {
            loadedData = JSON.parse(fileData);
            filterData("", 1, loadedData).then(() => {
                console.log("loadedData");
            });
        } catch (error) {
            console.error("Invalid JSON file");
        }
    };
    reader.readAsText(file);
});

const generateBoosterPack = async () => {
    const response = await fetch("HoH_all.json");
    const data = await response.json();

    const characters = data.filter(card => card.type === "character");
    const features = data.filter(card => card.type === "feature");
    const trainings = data.filter(card => card.type === "training");
    const items = data.filter(card => card.type === "item" && card.type !== "magic");
    const backgrounds = data.filter(card => card.type === "background");
    const abilities = data.filter(card => card.type === "ability");



    const getRandomCards = (cards, count) => {
        const randomCards = [];

        while (randomCards.length < count) {
            const randomIndex = Math.floor(Math.random() * cards.length);
            const card = cards[randomIndex];

            if (!randomCards.includes(card)) {
                randomCards.push(card);
            }
        }

        return randomCards;
    };

    const randomCards = [
        ...getRandomCards(characters, 1),
        ...getRandomCards(features, 1),
        ...getRandomCards(trainings, 1),
        ...getRandomCards(items, 3),
        ...getRandomCards(backgrounds, 1),
        ...getRandomCards(abilities, 1)


    ];

    const json = JSON.stringify(randomCards);
    return randomCards;
};

document.querySelector("#booster-pack").addEventListener("click", async () => {
    const randomCards = await generateBoosterPack();
    selectedCardsList.innerHTML = "";
    removeAllButton.style.display = "none";
    const selectedCards = selectedCardsList.querySelectorAll("li").length;
    const selectedCount = document.querySelector("#selected-count");
    selectedCount.textContent = selectedCards;
filterData("", 1, randomCards);
    console.log(randomCards);
});

const inputElement = document.getElementById("my-input");

const input = document.getElementById("my-input");
const popup = document.getElementById("popup");

input.addEventListener("input", () => {
    const inputValue = input.value.toLowerCase();
    if (inputValue === "help") {
        popup.style.display = "block";
    } else {
        popup.style.display = "none";
    }
});

