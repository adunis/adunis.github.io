import mustache from "https://cdn.skypack.dev/mustache@4.2.0";
import html2canvas from "https://cdn.skypack.dev/html2canvas";
import CryptoJS from 'https://cdn.skypack.dev/crypto-js';
import JSZip from 'https://cdn.skypack.dev/jszip';

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
            if (cardElement.classList.contains('flipped')) {
                return;
            }
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

document.querySelector("#save-deck-button-encrypted").addEventListener("click", () => {
    const selectedCardsList = document.querySelector("#selected-cards-list");
    const selectedCards = selectedCardsList.querySelectorAll("li");
    const deckData = [];

    for (const selectedCard of selectedCards) {
        const cardData = JSON.parse(selectedCard.getAttribute("data-json"));
        deckData.push(cardData);
    }

    const deckJson = JSON.stringify(deckData);
    const encryptedJson = encrypt(deckJson); // encrypt the JSON data
    const blob = new Blob([encryptedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const randomNumber = Math.floor(Math.random() * 10000000000000000);
    const fileName = `handful_of_heroes_booster_${randomNumber}.hoh`;
    a.download = fileName; // change the file extension to indicate that it is encrypted
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.querySelector("#save-deck-button-loot-encrypted").addEventListener("click", () => {
    const selectedCardsList = document.querySelector("#selected-cards-list");
    const selectedCards = selectedCardsList.querySelectorAll("li");
    const deckData = [];

    for (const selectedCard of selectedCards) {
        const cardData = JSON.parse(selectedCard.getAttribute("data-json"));
        deckData.push(cardData);
    }

    const deckJson = JSON.stringify(deckData);
    const encryptedJson = encrypt(deckJson); // encrypt the JSON data
    const blob = new Blob([encryptedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const randomNumber = Math.floor(Math.random() * 10000000000000000);
    const fileName = `handful_of_heroes_loot_${randomNumber}.hoh`;
    a.download = fileName; // change the file extension to indicate that it is encrypted
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Get the loading indicator element
const loadingIndicator = document.getElementById("loadingIndicator");

document.getElementById("btn-Convert-Html2Image").addEventListener("click", async function () {
    // Show the loading indicator
    loadingIndicator.style.display = "block";

    const cards = document.getElementsByClassName("card");
    const zip = new JSZip();
    //const previewImg = document.getElementById("previewImg");

    for (const card of cards) {
        const name = card.querySelector(".title").textContent;
        const canvas = await html2canvas(card, {allowTaint: true, logging: true, taintTest: false, useCORS: true});
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"));
        zip.file(name + ".jpg", blob);
    }

    zip.generateAsync({type: "blob"}).then(function (content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        const randomNumber = Math.floor(Math.random() * 1000);
        const fileBox = `images_${randomNumber}.zip`;
        a.download = fileBox;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Hide the loading indicator
        loadingIndicator.style.display = "none";
    });
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
    const saveDeckButtonEncrypted = document.querySelector("#save-deck-button-encrypted");
    const saveDeckButtonLootEncrypted = document.querySelector("#save-deck-button-loot-encrypted");

    saveDeckButton.style.display = selectedCards > 0 ? "block" : "none";
    saveDeckButtonEncrypted.style.display = selectedCards > 0 ? "block" : "none";
    saveDeckButtonLootEncrypted.style.display = selectedCards > 0 ? "block" : "none";


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

function encrypt(jsonData) {
    const key = "my-secret-key"; // replace with your own secret key
    const encJson = CryptoJS.AES.encrypt(jsonData, key).toString();
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
}

const burgerMenu = document.getElementById('burger-menu');
const overlay = document.getElementById('menu');

function toggleOverlay() {
    overlay.classList.toggle("overlay");
}

burgerMenu.addEventListener('click', toggleOverlay);
overlay.addEventListener('click', toggleOverlay);

async function filterData(filter, currentPage = 1, jsonData) {
    const filtered = jsonData.filter((value) => {
        // Handle additional filters
        const valueString = JSON.stringify(value).toLowerCase();
        const words = filter.split(",").map((word) => word.trim());
        const typeFilters = words.filter((word) => word.toLowerCase().startsWith("type:"));
        const crystalsFilters = words.filter((word) => word.toLowerCase().startsWith("crystals:"));
        const additionalFilters = words.filter((word) => !word.toLowerCase().startsWith("type:") && !word.toLowerCase().startsWith("crystals:"));
        return additionalFilters.every((word) => valueString.includes(word.toLowerCase())) &&
            typeFilters.every((filter) => {
                const typeValue = filter.split(":")[1].toLowerCase().trim();
                if (value.type != null) {
                   return Array.isArray(value.type) ? value.type.includes(typeValue) : value.type.toLowerCase() === typeValue;
                }
            }) &&
            crystalsFilters.every((filter) => {
                console.log(value)
                const crystalsValue = filter.split(":")[1].toLowerCase().trim();
                const crystalsObject = value.crystals;
                if (crystalsObject && crystalsObject.provides && crystalsObject.provides.length > 0) {
                    return crystalsObject.provides.includes(crystalsValue);
                }

                if (crystalsObject && crystalsObject.requires && crystalsObject.requires.length > 0) {
                    return crystalsObject.requires.includes(crystalsValue);
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

    const characters = data.filter(card => card.type && card.type.includes("character"));
    const features = data.filter(card => card.type && card.type.includes("feature"));
    const trainings = data.filter(card => card.type && card.type.includes("training"));
    const backgrounds = data.filter(card => card.type && card.type.includes("background"));
    const abilities = data.filter(card => card.type && card.type.includes("ability"));

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
        ...getRandomCards(features, 3),
        ...getRandomCards(trainings, 1),
        ...getRandomCards(backgrounds, 2),
        ...getRandomCards(abilities, 1)
    ];

    const json = JSON.stringify(randomCards);
    return randomCards;
};

const generateLootBoosterPack = async () => {
    const response = await fetch("HoH_all.json");
    const data = await response.json();

    const items = data.filter(card => card.type && card.type.includes("item") && !card.type.includes("common")&& !card.type.includes("uncommon")&& !card.type.includes("rare"));
    const magic = data.filter(card => card.type && card.type.includes("item") &&  (card.type.includes("common") || card.type.includes("uncommon") || card.type.includes("rare")));

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
        ...getRandomCards(items, 6),
        ...getRandomCards(magic, 1)
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

document.querySelector("#booster-box").addEventListener("click", async () => {
    const zip = new JSZip();

    for (let i = 0; i < 20; i++) {
        const randomCards = await generateBoosterPack();
        const deckData = JSON.stringify(randomCards);
        const encryptedJson = encrypt(deckData);
        const blob = new Blob([encryptedJson], {type: "application/json"});

        // Generate a random number and concatenate it with the file name
        const randomNumber = Math.floor(Math.random() * 100000);
        const fileName = `booster_pack_${randomNumber}.hoh`;

        // Add the file to the zip object
        zip.file(fileName, blob);
    }

    // Generate the zip file and download it
    zip.generateAsync({type: "blob"}).then(function (content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        const randomNumber = Math.floor(Math.random() * 1000);
        const fileBox = `booster_box_${randomNumber}.zip`;
        a.download = fileBox;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

});

    document.querySelector("#loot-box").addEventListener("click", async () => {
        const zip = new JSZip();

        for (let i = 0; i < 20; i++) {
            const randomCards = await generateLootBoosterPack()
            const deckData = JSON.stringify(randomCards);
            const encryptedJson = encrypt(deckData);
            const blob = new Blob([encryptedJson], {type: "application/json"});

            // Generate a random number and concatenate it with the file name
            const randomNumber = Math.floor(Math.random() * 100000);
            const fileName = `loot_box_${randomNumber}.hoh`;

            // Add the file to the zip object
            zip.file(fileName, blob);
        }

        // Generate the zip file and download it
        zip.generateAsync({type: "blob"}).then(function (content) {
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            const randomNumber = Math.floor(Math.random() * 1000);
            const fileBox = `loot_box_${randomNumber}.zip`;
            a.download = fileBox;
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

    });


document.querySelector("#booster-loot-pack").addEventListener("click", async () => {
    const randomCards = await generateLootBoosterPack();
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

const openBoosterPackButton = document.querySelector("#open-booster-pack");
const boosterPackFileInput = document.querySelector("#booster-pack-file-input");

openBoosterPackButton.addEventListener("click", () => {
    boosterPackFileInput.click();
});

function decrypt(encryptedJson) {
    const key = "my-secret-key"; // replace with your own secret key
    const decData = CryptoJS.enc.Base64.parse(encryptedJson).toString(CryptoJS.enc.Utf8);
    const bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(bytes);
}

boosterPackFileInput.addEventListener("change", function() {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const fileData = event.target.result;
            const decryptedJson = decrypt(fileData);
            filterData("", 1, decryptedJson).then(() => {
                // Hide all cards in grid
                const gridCards = document.querySelectorAll(".card-container");
                gridCards.forEach((card) => {
                    card.classList.add("flipped");
                    card.classList.add("flipped-background");
                    card.addEventListener('click', () => {
                        card.classList.remove('flipped');
                    });
                });
            });
        } catch (error) {
            console.error("Invalid or corrupted encrypted file");
        }
    };
    reader.readAsText(file);
});
