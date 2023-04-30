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

// Create "Save Deck" button
const saveDeckButton = document.createElement("button");
saveDeckButton.textContent = "Save Deck";
saveDeckButton.addEventListener("click", () => {
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


// Get the filename of the current HTML page
const filename = window.location.pathname.split("/").pop();
const removeAllButton = document.createElement("button");


// Call relevant code based on the filename
if (filename === "gm-panel.html") {
    // Add button to selection info div
    const selectionInfo = document.querySelector("#selection-info");
    selectionInfo.insertBefore(selectAllButton, selectedCardsList);

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

}


async function renderCards(jsonData, isBooster) {
    let cardId = 0;
    const editorModal = document.querySelector(".editor-modal");
    const modal = document.querySelector(".editor-modal");
    const jsonEditorSection = document.querySelector(".json-editor-section");
    const jsonEditor = document.querySelector("#json-editor");
    const autoCalculateToggle = document.querySelector("#auto-calculate-toggle");
    const submitButton = document.querySelector("#submit-button");
    const cancelButton = document.querySelector("#cancel-button");

    for (const card of jsonData) {
        card.id = cardId++;
        const cardTemplate = document.querySelector("#card-template").innerHTML;
        const cardElement = document.createElement("div");
        var renderedCard = mustache.render(cardTemplate, card);
        cardElement.classList.add("card-container");
        cardElement.innerHTML = renderedCard;
        cardElement.setAttribute("data-json-id", card.id);
        cardElement.setAttribute("data-json", JSON.stringify(card));

        const editButton = document.createElement("button");
        editButton.innerText = "Edit";
        editButton.classList.add("edit-button");

        const discardButton = document.createElement("button");
        discardButton.innerText = "Discard";
        discardButton.classList.add("discard-button");
        discardButton.addEventListener("click", (event) => {
            event.stopPropagation();
            cardElement.remove();
        });

        const mainDeckButton = document.createElement("button");
        mainDeckButton.innerText = "Put in Main Deck";
        mainDeckButton.classList.add("main-deck-button");
        mainDeckButton.addEventListener("click", (event) => {
            event.stopPropagation();
            card.status = "main_deck";
            cardElement.setAttribute("data-json", JSON.stringify(card));
            saveSelectedCards(cardElement);
            const sideDeckElements = document.querySelectorAll(`[data-json-id="${card.id}"][data-status="side_deck"]`);
            for (const sideDeckElement of sideDeckElements) {
                sideDeckElement.classList.remove("side-deck");
                sideDeckElement.removeAttribute("data-status");
            }
            cardElement.classList.add("main-deck");
            cardElement.setAttribute("data-status", "main_deck");
        });

        const sideDeckButton = document.createElement("button");
        sideDeckButton.innerText = "Put in SideDeck";
        sideDeckButton.classList.add("side-deck-button");
        sideDeckButton.addEventListener("click", (event) => {
            event.stopPropagation();
            card.status = "side_deck";
            cardElement.setAttribute("data-json", JSON.stringify(card));
            saveSelectedCards(cardElement);
            const mainDeckElements = document.querySelectorAll(`[data-json-id="${card.id}"][data-status="main_deck"]`);
            for (const mainDeckElement of mainDeckElements) {
                mainDeckElement.classList.remove("main-deck");
                mainDeckElement.removeAttribute("data-status");
            }
            cardElement.classList.add("side-deck");
            cardElement.setAttribute("data-status", "side_deck");
        });

        const buttonsContainer = document.createElement("div");
        buttonsContainer.classList.add("buttons-container");


        if (window.location.pathname.endsWith("gm-panel.html")) {
            const editButton = document.createElement("button");
            editButton.innerText = "Edit";
            editButton.classList.add("edit-button");

            editButton.addEventListener("click", (event) => {
                event.stopPropagation();

                const previewCard = document.createElement("div");
                previewCard.innerHTML = mustache.render(cardTemplate, card);
                const cardPreview = document.querySelector(".card-preview");
                cardPreview.setAttribute("data-json-id", JSON.stringify(card.id));
                cardPreview.innerHTML = "";
                cardPreview.appendChild(previewCard);

                editorModal.classList.add("open");
                jsonEditor.value = JSON.stringify(card, null, 2);
            });

            buttonsContainer.appendChild(editButton);
        }

        cardElement.appendChild(buttonsContainer);

        document.querySelector("#card-grid").appendChild(cardElement);

        cardElement.addEventListener("click", () => {
            if (cardElement.classList.contains("flipped")) {
                return;
            }
            saveSelectedCards(cardElement);
            cardElement.classList.add("flash");
            setTimeout(() => {
                cardElement.classList.remove("flash");
            }, 500);
        });


        if (window.location.pathname.endsWith("deck-manager.html")) {
            buttonsContainer.appendChild(discardButton);
            buttonsContainer.appendChild(mainDeckButton);
            buttonsContainer.appendChild(sideDeckButton);


        if (card.status === "side_deck") {
            cardElement.classList.add("side-deck");
            cardElement.setAttribute("data-status", "side_deck");
            const discardButton = document.createElement("button");
            discardButton.innerText = "Discard";
            discardButton.classList.add("discard-button");

            discardButton.addEventListener("click", (event) => {
                event.stopPropagation();
                cardElement.remove();
            });
            cardElement.appendChild(discardButton);

            const mainDeckButton = document.createElement("button");
            mainDeckButton.innerText = "Put in Main Deck";
            mainDeckButton.classList.add("main-deck-button");

            mainDeckButton.addEventListener("click", (event) => {
                event.stopPropagation();
                card.status = "main_deck";
                cardElement.setAttribute("data-json", JSON.stringify(card));
                cardElement.setAttribute("data-status", "main_deck");
            });
            cardElement.appendChild(mainDeckButton);
        } else if (card.status === "main_deck") {
            const sideDeckButton = document.createElement("button");
            sideDeckButton.innerText = "Put in Side Deck";
            sideDeckButton.classList.add("side-deck-button");

            sideDeckButton.addEventListener("click", (event) => {
                event.stopPropagation();
                card.status = "side_deck";
                cardElement.setAttribute("data-json", JSON.stringify(card));
                cardElement.setAttribute("data-status", "side_deck");
            });
            cardElement.appendChild(sideDeckButton);
        }

        if (cardElement.getAttribute("data-status") === "side_deck") {
            cardElement.classList.add("greyscale");
        }


        }


        document.querySelector("#card-grid").appendChild(cardElement);

        cardElement.addEventListener("click", () => {
            if (cardElement.classList.contains("flipped")) {
                return;
            }
            saveSelectedCards(cardElement);
            cardElement.classList.add("flash");
            setTimeout(() => {
                cardElement.classList.remove("flash");
            }, 500);
        });

        if (isBooster) {
            cardElement.classList.add("flipped");
            cardElement.classList.add("flipped-background");
            cardElement.addEventListener('click', () => {
                cardElement.classList.remove('flipped');
            });
        }
    }

    submitButton.addEventListener("click", async () => {
        const newJsonData = jsonEditor.value;
        const updatedCard = JSON.parse(newJsonData);
        if (autoCalculateToggle.checked) {
            // Calculate card stats automatically
        }
        const cardPreview = document.querySelector(".card-preview");
        const cardId = cardPreview.getAttribute("data-json-id");
        const cardElement = document.querySelector(".card-container[data-json-id='" + cardId + "']");

        // Find card with matching name and update its properties
        const cardIndex = loadedData.findIndex((card) => card.name === updatedCard.name);

        if (cardIndex !== -1) {
            loadedData[cardIndex] = updatedCard;
        } else {
            // Add new card to loadedData
            loadedData.push(updatedCard);
        }

        // Save changes to HoH_all.json file
        const fileName = window.prompt("Save file as:", "HoH_all.json");
        if (fileName !== null) {
            // Create a new blob with the updated jsonData
            const blob = new Blob([JSON.stringify(loadedData)], {type: "application/json"});
            // Create a download link for the blob and click it
            const downloadLink = document.createElement("a");
            downloadLink.download = fileName;
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.click();
        }

        // Update card element with new data
        const cardTemplate = document.querySelector("#card-template").innerHTML;
        cardElement.innerHTML = mustache.render(cardTemplate, updatedCard);
        editorModal.classList.remove("open");
    });

    cancelButton.addEventListener("click", async () => {
        editorModal.classList.remove("open");
    });

    }

if (filename === "gm-panel.html" || filename === "index.html") {

    document.querySelector("#save-deck-button").addEventListener("click", () => {
        const selectedCardsList = document.querySelector("#selected-cards-list");
        const selectedCards = selectedCardsList.querySelectorAll("li");
        const deckData = [];

        for (const selectedCard of selectedCards) {
            const cardData = JSON.parse(selectedCard.getAttribute("data-json"));
            deckData.push(cardData);
        }


        const deckJson = JSON.stringify(deckData);
        const blob = new Blob([deckJson], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.download = "deck.json";
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

}

if (filename === "gm-panel.html") {

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
    const blob = new Blob([encryptedJson], {type: "application/json"});
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
}


if (filename === "gm-panel.html") {

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
    const blob = new Blob([encryptedJson], {type: "application/json"});
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
}

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
        const canvas = await html2canvas(card, {
            allowTaint: true,
            logging: true,
            taintTest: false,
            useCORS: true,
            scale: 2
        });
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

    const filename = window.location.pathname.split("/").pop();

// Call relevant code based on the filename
    if (filename !== "deck-manager.html") {
        // Add button to selection info div
        const selectionInfo = document.querySelector("#selection-info");
        selectionInfo.insertBefore(saveDeckButton, selectedCardsList);
        saveDeckButtonEncrypted.style.display = selectedCards > 0 ? "block" : "none";
        saveDeckButtonLootEncrypted.style.display = selectedCards > 0 ? "block" : "none";

    }


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

async function filterData(filter, currentPage = 1, jsonData, isBooster) {
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

    let itemsPerPage = 50;

    // Get the filename of the current HTML page
    const filename = window.location.pathname.split("/").pop();

    // Call relevant code based on the filename
    if (filename === "deck-manager.html") {
        itemsPerPage = 200;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedResults = filtered.slice(start, end);
    const htmlname = window.location.pathname.split("/").pop();
// Call relevant code based on the filename
    if (htmlname !== "deck-manager.html") {
        document.querySelector("#card-grid").innerHTML = "";
    }
    renderCards(paginatedResults, isBooster);
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
    // Get the filename of the current HTML page
    const filename = window.location.pathname.split("/").pop();

    // Create a modal that allows the user to choose between uploading a custom JSON file or using the default file
    const modal = document.querySelector("#json-upload-modal");
    const customFileUploadButton = document.querySelector("#custom-file-upload-button");
    const defaultFileUploadButton = document.querySelector("#default-file-upload-button");
    const fileInput = document.querySelector("#json-file-input-2");

    customFileUploadButton.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", async () => {
        const selectedFile = fileInput.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = async function (event) {
                const jsonData = JSON.parse(event.target.result);
                // Call relevant code based on the filename and loaded data
                loadedData = jsonData;
                await handleLoadedData(jsonData, filename);
            };
            reader.readAsText(selectedFile);
        }
        modal.classList.remove("open");
    });

    defaultFileUploadButton.addEventListener("click", async () => {
        const json = await fetch("HoH_all.json");
        loadedData = await json.json();
        // Call relevant code based on the filename and loaded data
        await handleLoadedData(loadedData, filename);
        modal.classList.remove("open");
    });

    modal.classList.add("open");

}
async function handleLoadedData(loadedData, filename) {
    if (filename === "deck-manager.html") {

        await filterData("", 1, loadedData);
    } else if (filename === "gm-panel.html") {
        // Handle GM panel
        selectedCardsList.innerHTML = "";
        removeAllButton.style.display = "none";
        const selectedCards = selectedCardsList.querySelectorAll("li").length;
        const selectedCount = document.querySelector("#selected-count");
        selectedCount.textContent = selectedCards;
        await filterData("", 1, loadedData);
    } else if (filename === "index.html") {
        const json = await fetch("HoH_all.json");
        const loadedData = await json.json();
        // Handle index
        selectedCardsList.innerHTML = "";
        removeAllButton.style.display = "none";
        const selectedCards = selectedCardsList.querySelectorAll("li").length;
        const selectedCount = document.querySelector("#selected-count");
        selectedCount.textContent = selectedCards;
        await filterData("", 1, loadedData);
    }
}


loadStartUp();

const myInput = document.getElementById('my-input');
myInput.addEventListener('keyup', async function () {
    await filterData(this.value.toLowerCase(), 1, loadedData);
});

window.addEventListener('load', async function () {
    const filter = myInput.value.toLowerCase();
    if (filter) {
        await filterData(filter, 1, loadedData);
    }
});

// Load JSON file
const loadJsonButton = document.querySelector("#load-json");
loadJsonButton.addEventListener("click", function () {
    const jsonFileInput = document.querySelector("#json-file-input");
    jsonFileInput.click();
});

document.querySelector("#load-hoh").addEventListener("click", async function () {
    await loadStartUp();
    console.log("");
});

const jsonFileInput = document.querySelector("#json-file-input");
jsonFileInput.addEventListener("change", function () {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
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
    const backgrounds = data.filter(card => card.type && card.type.includes("background"));
    const species = data.filter(card => card.type && card.type.includes("species"));
    const destinies = data.filter(card => card.type && card.type.includes("destiny"));

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
        ...getRandomCards(backgrounds, 3),
        ...getRandomCards(species, 1),
        ...getRandomCards(destinies, 1)

    ];

    const json = JSON.stringify(randomCards);
    return randomCards;
};

const generateLootBoosterPack = async () => {
    const response = await fetch("HoH_all.json");
    const data = await response.json();

    const items = data.filter(card => card.type && card.type.includes("item") && !card.type.includes("common") && !card.type.includes("uncommon") && !card.type.includes("rare"));

// Filter the magic cards by rarity
    const commonMagic = data.filter(card => card.type && card.type.includes("item") && card.type.includes("common"));
    const uncommonMagic = data.filter(card => card.type && card.type.includes("item") && card.type.includes("uncommon"));
    const rareMagic = data.filter(card => card.type && card.type.includes("item") && card.type.includes("rare"));

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

// Select one magic card based on their rarity probability
    const randomMagicCard = Math.random() < 0.9 ? getRandomCards(commonMagic, 1)[0] : Math.random() < 0.99 ? getRandomCards(uncommonMagic, 1)[0] : getRandomCards(rareMagic, 1)[0];

    const randomCards = [
        ...getRandomCards(items, 6),
        randomMagicCard
    ];

    const json = JSON.stringify(randomCards);
    return randomCards;
};

if (filename === "gm-panel.html") {
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
}

if (filename === "gm-panel.html") {
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
}


if (filename === "gm-panel.html") {
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

}


if (filename === "gm-panel.html") {

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
}

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

boosterPackFileInput.addEventListener("change", function () {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const fileData = event.target.result;
            const decryptedJson = decrypt(fileData);
            filterData("", 1, decryptedJson, true);
        } catch (error) {
            console.error("Invalid or corrupted encrypted file");
        }
    };
    reader.readAsText(file);
});

const dropArea = document.querySelector("#drop-area");

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
    document.body.addEventListener(eventName, preventDefaults, false)
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

function highlight(e) {
    dropArea.classList.add('highlight')
}

function unhighlight(e) {
    dropArea.classList.remove('highlight')
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    // Check if file is valid
    if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const fileData = event.target.result;
                if (file.name.endsWith(".hoh")) {
                    const decryptedJson = decrypt(fileData);
                    filterData("", 1, decryptedJson, true);
                }
                else {
                    filterData("", 1, JSON.parse(fileData));
                }
            } catch (error) {
                console.error("Invalid or corrupted encrypted file");
            }
        };
        reader.readAsText(file);
    }
}

const autoCalculateToggle = document.querySelector('#auto-calculate-toggle');
let isChecked = autoCalculateToggle.checked;
const jsonEditor = document.querySelector("#json-editor");
const cardPreview = document.querySelector(".card-preview");

jsonEditor.addEventListener("input", () => {
    let jsonData = JSON.parse(jsonEditor.value);
    if (isChecked) {
        jsonData = autoCalculateStats(jsonData);
    }
    cardPreview.innerHTML = ""; // clear the card preview
    const cardTemplate = document.querySelector("#card-template").innerHTML;
    const renderedCard = mustache.render(cardTemplate, jsonData);
    const cardElement = document.createElement("div");
    cardElement.innerHTML = renderedCard;
    cardPreview.appendChild(cardElement);
});

const default_values = {
    "hp": 6,
    "mp": 0,
    "sp": 6,
    "hd": "1d4",
    "md": "1d4",
    "sd": "1d4",
    "STR": 0,
    "DEX": 0,
    "CON": 0,
    "INT": 0,
    "WIS": 0,
    "CAR": 0
};

const modifiers = {
    "red": {
        "hp": 4,
        "mp": 2,
        "hd_steps": 1,
        "md_steps": 1,
        "STR": 1,
        "COS": 1,
        "WIS": -1,
    },
    "orange": {
        "hp": 6,
        "hd_steps": 2,
        "STR": 1,
        "COS": 1,
        "INT": -1
    },
    "green": {
        "hp": 4,
        "mp": 2,
        "hd_steps": 1,
        "sd_steps": 1,
        "DEX": 1,
        "STR": 1,
        "INT": -1,
    },
    "emerald": {
        "hp": 1,
        "sp": 2,
        "mp": 3,
        "md_steps": 1,
        "sd_steps": 1,
        "WIS": 1,
        "COS": 1,
        "CAR": -1,
    },
    "cerulean": {
        "mp": 6,
        "md_steps": 2,
        "INT": 1,
        "WIS": 1,
        "STR": -1,
        "COS": -1
    },
    "purple": {
        "hp": 2,
        "mp": 2,
        "sp": 2,
        "sd_steps": 2,
        "CAR": 1,
        "DEX": 1,
        "COS": -1,
    },
    "gold": {
        "hp": 2,
        "mp": 2,
        "sp": 2,
        "sd_steps": 1,
        "md_steps": 1,
        "WIS": 1,
        "INT": 1,
        "STR": -1,
    },
    "black": {
        "hp": 2,
        "mp": 1,
        "sp": 3,
        "hd_steps": 1,
        "sd_steps": 1,
        "DEX": 1,
        "INT": 1,
        "WIS": -1,
    },
    "blue": {
        "hp": 3,
        "sp": 1,
        "mp": 2,
        "hd_steps": 1,
        "md_steps": 1,
        "STR": 1,
        "CAR": 1,
        "WIS": -1,
    },
    "white": {
        "hp": 1,
        "mp": 3,
        "sp": 2,
        "md_steps": 1,
        "sd_steps": 1,
        "WIS": 1,
        "CAR": 1,
        "COS": -1,
    },
};

function autoCalculateStats(card) {

    if (card['type'].includes('creature') || card['type'].includes('character')) {
        card['stats'] = [
            { "stat_name": "hp", "stat_value": default_values["hp"] },
            { "stat_name": "mp", "stat_value": default_values["mp"] },
            { "stat_name": "sp", "stat_value": default_values["sp"] },
            { "stat_name": "hd", "stat_value": default_values["hd"] },
            { "stat_name": "md", "stat_value": default_values["md"] },
            { "stat_name": "sd", "stat_value": default_values["sd"] }
        ];
        card['abilities'] = [
            { "ability_name": "STR", "ability_value": default_values["STR"] },
            { "ability_name": "DEX", "ability_value": default_values["DEX"] },
            { "ability_name": "COS", "ability_value": default_values["CON"] },
            { "ability_name": "INT", "ability_value": default_values["INT"] },
            { "ability_name": "WIS", "ability_value": default_values["WIS"] },
            { "ability_name": "CAR", "ability_value": default_values["CAR"] }
        ];
    }

    const stepArray = ["1", "1d2", "1d4", "1d6", "1d8", "1d10", "2d6", "2d8", "3d6", "3d8", "4d6", "4d8", "6d6", "6d8", "8d6", "8d8", "12d6", "12d8", "16d6"]

    if (card.type.includes('creature') || card.type.includes('character')) {
        let abilities = card.abilities;
        let stats = card.stats;
        let crystals = card.crystals.provides;

        crystals.forEach((crystal) => {
            if (crystal in modifiers) {
                let modifier = modifiers[crystal];
                for (let [key, value] of Object.entries(modifier)) {
                    if (abilities.some((ability) => ability.ability_name === key)) {
                        let abilityIndex = abilities.findIndex((ability) => ability.ability_name === key);
                        abilities[abilityIndex].ability_value += value;
                    } else if (key.endsWith('_steps')) {
                        let statName = key.replace('_steps', '');
                        let statIndex = stats.findIndex((stat) => stat.stat_name === statName);
                        if (statIndex !== -1) {
                            let originalStatValue = stats[statIndex].stat_value;
                            let originalStepIndex = stepArray.indexOf(originalStatValue);
                            let newStepIndex = Math.min(Math.max(originalStepIndex + value, 0), stepArray.length - 1);
                            stats[statIndex].stat_value = stepArray[newStepIndex];
                        }
                    } else if (stats.some((stat) => stat.stat_name === key)) {
                        let statIndex = stats.findIndex((stat) => stat.stat_name === key);
                        stats[statIndex].stat_value += value;
                    }
                }
            }
        });

        card.abilities = abilities;
        card.stats = stats;
        return card;
    }
}

autoCalculateToggle.addEventListener('change', () => {
    isChecked = autoCalculateToggle.checked;
    if (isChecked) {
        const jsonData = JSON.parse(jsonEditor.value);
        autoCalculateStats(jsonData);
    }
});

