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


//This is a JavaScript function that is responsible for rendering cards on a web page, given a JSON object representing the card data. The function uses Mustache.js to render the card template and create the HTML elements for each card.
// The function first sets up some variables and constants, including references to the HTML elements that will be used to display and interact with the cards.
// Next, it loops through each card in the JSON data, creates a new HTML element for the card, and renders the card using the card template and Mustache.js. The card element is then added to the web page, and event listeners are set up to handle clicks on the card and the various buttons associated with each card.
// If the web page is the "gm-panel.html" page, an "Edit" button is also added to each card that will open a modal dialog where the user can edit the card data in JSON format.
// If the web page is the "deck-manager.html" page, additional buttons are added to each card to allow the user to move the card between the main deck and the side deck, or discard the card altogether. Depending on the initial status of the card, either the "Put in Main Deck" and "Discard" buttons, or the "Put in Side Deck" button, are added to the card.
// Overall, this function provides a flexible and dynamic way to render and interact with cards on a web page, and can be customized to fit a wide range of use cases.

async function renderCards(jsonData, isBooster) {
    let cardId = 0;
    const editorModal = document.querySelector(".editor-modal");
    const modal = document.querySelector(".editor-modal");
    const jsonEditorSection = document.querySelector(".json-editor-section");
    const jsonEditor = document.querySelector("#json-editor");
    const autoCalculateToggle = document.querySelector("#auto-calculate-toggle");
    const miniCardView = document.querySelector("#mini-card-view");
    const submitButton = document.querySelector("#submit-button");
    const cancelButton = document.querySelector("#cancel-button");

    miniCardView.addEventListener("change", () => {
        console.log("switched")
        const cards = document.querySelectorAll(".card");
        cards.forEach(function (card) {
            if (card.classList.contains('mini-card')) {
                card.classList.remove('mini-card');
            } else {
                card.classList.add('mini-card');
            }
        });
    });


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
        const buttonsContainer = document.createElement("div");


        const mainDeckButton = document.createElement("button");
        mainDeckButton.classList.add("main-deck-button");
        mainDeckButton.addEventListener("click", (event) => {
            event.stopPropagation();
            card.status = "activated";
            cardElement.setAttribute("data-json", JSON.stringify(card));
            const sideDeckElements = document.querySelectorAll(`[data-json-id="${card.id}"][data-status="deactivated"]`);
            for (const sideDeckElement of sideDeckElements) {
                sideDeckElement.classList.remove("deactivated");
                sideDeckElement.removeAttribute("data-status");
            }
            cardElement.classList.add("main-deck");
            cardElement.setAttribute("data-status", "activated");
        });

        const sideDeckButton = document.createElement("button");
        sideDeckButton.classList.add("side-deck-button");
        sideDeckButton.addEventListener("click", (event) => {
            event.stopPropagation();
            card.status = "deactivated";
            cardElement.setAttribute("data-json", JSON.stringify(card));
            const mainDeckElements = document.querySelectorAll(`[data-json-id="${card.id}"][data-status="activated"]`);
            for (const mainDeckElement of mainDeckElements) {
                mainDeckElement.classList.remove("main-deck");
                mainDeckElement.removeAttribute("data-status");
            }
            cardElement.classList.add("deactivated");
            cardElement.setAttribute("data-status", "deactivated");
        });

        if (card.type.includes("character")) {
            const mainCharButton = document.createElement("button");
            mainCharButton.classList.add("main-char-button");
            mainCharButton.addEventListener("click", (event) => {
                event.stopPropagation();
                const mainDeckElements = document.querySelectorAll(`[data-json-id="${card.id}"]`);
                for (const mainDeckElement of mainDeckElements) {
                    if (!mainDeckElement.getAttribute("character-status")){
                        cardElement.classList.add("main-character");
                        card.characterstatus = "main";
                        cardElement.setAttribute("data-json", JSON.stringify(card));
                        cardElement.setAttribute("character-status", "main");
                    } else {
                        card.characterstatus = "";
                        cardElement.setAttribute("data-json", JSON.stringify(card));
                        cardElement.classList.remove("main-character");
                        cardElement.removeAttribute("character-status");
                    }
                }
            });

            // append button to card element
            cardElement.appendChild(mainCharButton);
            buttonsContainer.appendChild(mainCharButton);
        }


        const discardButton = document.createElement("button");
        discardButton.classList.add("discard-button");
        discardButton.addEventListener("click", (event) => {
            event.stopPropagation();
            const confirmed = confirm("Are you sure you want to discard this card? Discarding means removing permanently a card from your character's deck. You get 1 XP for each crystal symbol present in the card if its not an item.");
            if (confirmed) {
                cardElement.remove();
            }
        });

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

        if (filename !== "deck-manager.html") {


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

        }

        if (window.location.pathname.endsWith("deck-manager.html")) {
            buttonsContainer.appendChild(mainDeckButton);
            buttonsContainer.appendChild(sideDeckButton);
            buttonsContainer.appendChild(discardButton);

            if (card.characterstatus === "main") {
                cardElement.classList.add("main-character");
                cardElement.setAttribute("character-status", "main-character");

            }

            if (card.status === "deactivated") {
                cardElement.classList.add("deactivated");
                cardElement.setAttribute("data-status", "deactivated");

            }

        }

        if (isBooster) {
            cardElement.classList.add("flipped");
            cardElement.classList.add("flipped-background");
            cardElement.addEventListener('click', () => {
                cardElement.classList.remove('flipped');
            });
        }
    }

    if (window.location.pathname.endsWith("gm-panel.html")) {

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
            const cardIndex = loadedData["deck_list"].findIndex((card) => card.name === updatedCard.name);

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

}

if (filename === "deck-manager.html") {
    document.querySelector("#save-deck-manager-button").addEventListener("click", () => {


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

        const deckData = loadedData;
        deckData["deck_list"] = [];
        const selectedCardsList = document.querySelector("#selected-cards-list");
        const selectedCards = selectedCardsList.querySelectorAll("li");
        for (const selectedCard of selectedCards) {
            const cardData = JSON.parse(selectedCard.getAttribute("data-json"));
            deckData.deck_list.push(cardData);
        }


        const deckJson = JSON.stringify(deckData);
        const blob = new Blob([deckJson], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = loadedData["deck_name"] + ".json";
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}


if (filename === "gm-panel.html" || filename === "index.html") {
    document.querySelector("#save-deck-button").addEventListener("click", () => {
        const deckData = loadedData;
        deckData["deck_list"] = [];
        const selectedCardsList = document.querySelector("#selected-cards-list");
        const selectedCards = selectedCardsList.querySelectorAll("li");
        for (const selectedCard of selectedCards) {
            const cardData = JSON.parse(selectedCard.getAttribute("data-json"));
            deckData.deck_list.push(cardData);
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
    const saveDeckManagerButton = document.querySelector("#save-deck-mananager-button");
    const saveDeckButtonEncrypted = document.querySelector("#save-deck-button-encrypted");
    const saveDeckButtonLootEncrypted = document.querySelector("#save-deck-button-loot-encrypted");

    const filename = window.location.pathname.split("/").pop();

// Call relevant code based on the filename
    if (filename !== "deck-manager.html") {
        saveDeckButton.style.display = selectedCards > 0 ? "block" : "none";
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
    const selectedCount = document.querySelector("#selected-count");
    selectedCount.textContent = selectedCards;

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


//This is an asynchronous function named filterData that takes four arguments: filter, currentPage, jsonData, and isBooster. It filters the jsonData based on the filter argument and the additional filters for type and crystals. The filtered data is then paginated and passed to the renderCards method along with the isBooster argument.
// The function also checks if the current HTML page is deck-manager.html and if so, it renders the deck statistics template to the #deck-stats element. The number of items per page is determined by the filename, and a pagination component is created with Next Page, Previous Page, and numbered page buttons.
// When the Next Page or Previous Page button is clicked, the currentPage value is incremented or decremented, and the filterData method is called again with the updated currentPage value.


async function filterData(filter, currentPage = 1, jsonData, isBooster) {

    const htmlname = window.location.pathname.split("/").pop();


    if (htmlname === "deck-manager.html") {
        document.querySelector("#deck-stats").innerHTML = "";
        const deckStatsTemplate = document.querySelector("#deck-stats-template").innerHTML;
        const deckStatsElement = document.createElement("div");

        deckStatsElement.innerHTML = mustache.render(deckStatsTemplate, loadedData);
        document.querySelector("#deck-stats").appendChild(deckStatsElement);

        const deckName = document.getElementById("deck-name-text");
        const deckPicture = document.getElementById("deck-picture");
        const deckDescription = document.getElementById("deck-description");

// add event listeners for editing deck name, image, and description
        deckName.addEventListener("click", () => {
            const newDeckName = prompt("Enter new deck name:");
            if (newDeckName) {
                loadedData["deck_name"] = newDeckName;
                deckName.textContent = newDeckName;
            }
        });

        deckPicture.addEventListener("click", () => {
            const newDeckImage = prompt("Enter new deck image URL:");
            if (newDeckImage) {
                loadedData["deck_image"] = newDeckImage;
                deckPicture.style.backgroundImage = `url(${newDeckImage})`;
            }
        });

        deckDescription.addEventListener("click", () => {
            const newDeckDescription = prompt("Enter new deck description:");
            if (newDeckDescription) {
                loadedData["deck_description"] = newDeckDescription;
                deckDescription.textContent = newDeckDescription;
            }
        });

        const increaseCoinsBtn = document.getElementById("increase-coins-btn");
        increaseCoinsBtn.addEventListener("click", function() {
            const coinCounter = document.getElementById("coin-counter");
            const coinValue = parseInt(coinCounter.innerText);
            coinCounter.innerText = coinValue + 1;
            loadedData.coin = coinValue +1;
        });

        const decreaseCoinsBtn = document.getElementById("decrease-coins-btn");
        decreaseCoinsBtn.addEventListener("click", function() {
            const coinCounter = document.getElementById("coin-counter");
            const coinValue = parseInt(coinCounter.innerText);
            coinCounter.innerText = coinValue - 1;
            loadedData.coin = coinValue  -1;
        });


        const increaseXPBtn = document.getElementById("increase-xp-btn");
        increaseXPBtn.addEventListener("click", function() {
            const xpCounter = document.getElementById("xp-counter");
            const xpValue = parseInt(xpCounter.innerText);
            xpCounter.innerText = xpValue + 1;
            loadedData.xp = xpValue +1;
        });

        const decreaseXPBtn = document.getElementById("decrease-xp-btn");
        decreaseXPBtn.addEventListener("click", function() {
            const xpCounter = document.getElementById("xp-counter");
            const xpValue = parseInt(xpCounter.innerText);
            xpCounter.innerText = xpValue - 1;
            loadedData.XP = xpValue  - 1;
        });

    }

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
            filterData(filter, currentPage, loadedData["deck_list"]);
        }
    });
    const previousPageButton = document.createElement("button");
    previousPageButton.innerText = "Previous Page";
    previousPageButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            filterData(filter, currentPage, loadedData["deck_list"]);
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
                filterData(filter, i, loadedData["deck_list"]);
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
                await handleLoadedData(jsonData["deck_list"], filename);
            };
            reader.readAsText(selectedFile);
        }
        modal.classList.remove("open");
    });

    if (filename !== "deck-manager.html") {
        defaultFileUploadButton.addEventListener("click", async () => {
            const json = await fetch("HoH_all.json");
            loadedData = await json.json();
            // Call relevant code based on the filename and loaded data
            await handleLoadedData(loadedData["deck_list"], filename);
            modal.classList.remove("open");
        });
    }

    // Array of possible background sentences
    const backgrounds = [
        "was born into a wealthy family",
        "grew up in poverty",
        "was orphaned at a young age",
        "used to be a soldier",
        "was a successful merchant",
        "was once a notorious criminal",
        "lived in isolation for many years",
        "was a skilled craftsman",
    ];

// Array of possible personality sentences
    const personalities = [
        "is very friendly and outgoing",
        "tends to be quiet and reserved",
        "has a quick temper",
        "is always looking for a fight",
        "is very curious and loves to explore",
        "is fiercely loyal to their friends",
        "has a dark sense of humor",
        "is very superstitious",
    ];

// Array of possible story sentences
    const stories = [
        "is on a quest to find a lost artifact",
        "is trying to start a new business venture",
        "is hiding from a dangerous enemy",
        "is searching for a long-lost relative",
        "is dealing with a personal tragedy",
        "is trying to clear their name after being falsely accused of a crime",
        "is working as a spy for a secret organization",
        "is seeking revenge against those who wronged them",
    ];



    if (filename == "deck-manager.html") {

// Method to generate a random NPC
        function generateNPC(name) {
            // Select a random sentence from each array
            const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
            const personality = personalities[Math.floor(Math.random() * personalities.length)];
            const story = stories[Math.floor(Math.random() * stories.length)];

            // Combine the sentences into a single string
            // Return the NPC string
            return name + " " + `${background}, ${personality} and ${story}.`;
        }

        const images = ['001.png', '002.png', '003.png', '004.png', '005.png', '006.png', '007.png', '008.png', '009.png', '010.png', '011.png', '012.png', '013.png', '014.png', '015.png', '016.png', '017.png', '018.png', '019.png', '020.png', '021.png', '022.png', '023.png', '024.png', '025.png', '026.png', '027.png', '028.png', '029.png', '030.png', '031.png', '032.png', '033.png', '034.png', '035.png', '036.png', '037.png', '038.png', '039.png', '040.png', '041.png', '042.png', '043.png', '044.png', '045.png', '046.png', '047.png', '048.png', '049.png', '050.png', '051.png', '052.png', '053.png', '054.png', '055.png', '056.png', '057.png', '058.png', '059.png', '060.png', '061.png', '062.png', '063.png', '064.png', '065.png', '066.png', '067.png', '068.png', '069.png', '070.png', '071.png', '072.png', '073.png', '074.png', '075.png', '076.png', '077.png', '078.png', '079.png', '080.png', '081.png', '082.png', '083.png', '084.png', '085.png', '086.png', '087.png', '088.png', '089.png', '090.png', '091.png', '092.png', '093.png', '094.png', '095.png', '096.png', '097.png', '098.png', '099.png', '100.png', '101.png', '102.png', '103.png', '104.png', '105.png', '106.png', '107.png', '108.png', '109.png', '110.png', '111.png', '112.png', '113.png', '114.png', '115.png', '116.png', '117.png', '118.png', '119.png', '120.png', '121.png', '122.png', '123.png', '124.png', '125.png', '126.png', '127.png', '128.png', '129.png', '130.png', '131.png', '132.png', '133.png', '134.png', '135.png', '136.png', '137.png', '138.png', '139.png', '140.png', '141.png', '142.png', '143.png', '144.png', '145.png', '146.png', '147.png', '148.png', '149.png', '150.png', '151.png', '152.png', '153.png', '154.png', '155.png', '156.png', '157.png', '158.png', '159.png', '160.png', '161.png', '162.png', '163.png', '164.png', '165.png', '166.png', '167.png', '168.png', '169.png', '170.png', '171.png', '172.png', '173.png', '174.png', '175.png', '176.png', '177.png', '178.png', '179.png', '180.png', '181.png', '182.png', '183.png', '184.png', '185.png', '186.png', '187.png', '188.png', '189.png', '190.png', '191.png', '192.png', '193.png', '194.png', '195.png', '196.png', '197.png', '198.png', '199.png', '200.png', '201.png', '202.png', '203.png', '204.png', '205.png', '206.png', '207.png', '208.png', '209.png', '210.png', '211.png', '212.png', '213.png', '214.png', '215.png', '216.png', '217.png', '218.png', '219.png', '220.png', '221.png', '222.png', '223.png', '224.png', '225.png', '226.png', '227.png', '228.png', '229.png', '230.png', '231.png', '232.png', '233.png', '234.png', '235.png', '236.png', '237.png', '238.png', '239.png', '240.png', '241.png', '242.png', '243.png', '244.png', '245.png', '246.png', '247.png', '248.png', '249.png', '250.png', '251.png', '252.png', '253.png', '254.png', '255.png', '256.png', '257.png', '258.png', '259.png', '260.png', '261.png', '262.png', '263.png', '264.png', '265.png', '266.png', '267.png', '268.png', '269.png', '270.png', '271.png', '272.png', '273.png', '274.png', '275.png', '276.png', '277.png', '278.png', '279.png', '280.png', '281.png', '282.png', '283.png', '284.png', '285.png', '286.png', '287.png', '288.png', '289.png', '290.png', '291.png', '292.png', '293.png', '294.png', '295.png', '296.png', '297.png', '298.png', '299.png', '300.png', '301.png', '302.png', '303.png', '304.png', '305.png', '306.png', '307.png', '308.png', '309.png', '310.png', '311.png', '312.png', '313.png', '314.png', '315.png', '316.png', '317.png', '318.png', '319.png', '320.png', '321.png', '322.png', '323.png', '324.png', '325.png', '326.png', '327.png', '328.png', '329.png', '330.png', '331.png', '332.png', '333.png', '334.png', '335.png', '336.png', '337.png', '338.png', '339.png', '340.png', '341.png', '342.png', '343.png', '344.png', '345.png', '346.png', '347.png', '348.png', '349.png', '350.png', '351.png', '352.png', '353.png', '354.png', '355.png', '356.png', '357.png', '358.png', '359.png', '360.png', '361.png', '362.png', '363.png', '364.png', '365.png', '366.png', '367.png', '368.png', '369.png', '370.png', '371.png', '372.png', '373.png', '374.png', '375.png', '376.png', '377.png', '378.png', '379.png', '380.png', '381.png', '382.png', '383.png', '384.png', '385.png', '386.png', '387.png', '388.png', '389.png', '390.png', '391.png', '392.png', '393.png', '394.png', '395.png', '396.png', '397.png', '398.png', '399.png', '400.png', '401.png', '402.png', '403.png', '404.png', '405.png', '406.png', '407.png', '408.png', '409.png', '410.png', '411.png', '412.png', '413.png', '414.png', '415.png', '416.png', '417.png', '418.png', '419.png', '420.png', '421.png', '422.png', '423.png', '424.png', '425.png', '426.png', '427.png', '428.png', '429.png', '430.png', '431.png', '432.png', '433.png', '434.png', '435.png', '436.png', '437.png', '438.png', '439.png', '440.png', '441.png', '442.png', '443.png', '444.png', '445.png', '446.png', '447.png', '448.png', '449.png', '450.png', '451.png', '452.png', '453.png', '454.png', '455.png', '456.png', '457.png', '458.png', '459.png', '460.png', '461.png', '462.png', '463.png', '464.png', '465.png', '466.png', '467.png', '468.png', '469.png', '470.png', '471.png', '472.png', '473.png', '474.png', '475.png', '476.png', '477.png', '478.png', '479.png', '480.png', '481.png', '482.png', '483.png', '484.png', '485.png', '486.png', '487.png', '488.png', '489.png', '490.png', '491.png', '492.png', '493.png', '494.png', '495.png', '496.png', '497.png', '498.png', '499.png', '500.png', '501.png', '502.png', '503.png', '504.png', '505.png', '506.png', '507.png', '508.png', '509.png', '510.png', '511.png', '512.png', '513.png', '514.png', '515.png', '516.png', '517.png', '518.png', '519.png', '520.png', '521.png', '522.png', '523.png', '524.png', '525.png', '526.png', '527.png', '528.png', '529.png', '530.png', '531.png', '532.png', '533.png', '534.png', '535.png', '536.png', '537.png', '538.png', '539.png', '540.png', '541.png', '542.png', '543.png', '544.png', '545.png', '546.png', '547.png', '548.png', '549.png', '550.png', '551.png', '552.png', '553.png', '554.png', '555.png', '556.png', '557.png', '558.png', '559.png', '560.png', '561.png', '562.png', '563.png', '564.png', '565.png', '566.png', '567.png', '568.png', '569.png', '570.png', '571.png', '572.png', '573.png', '574.png', '575.png', '576.png', '577.png', '578.png', '579.png', '580.png', '581.png', '582.png', '583.png', '584.png', '585.png', '586.png', '587.png', '588.png', '589.png', '590.png', '591.png', '592.png', '593.png', '594.png', '595.png', '596.png', '597.png', '598.png', '599.png', '600.png', '601.png', '602.png', '603.png', '604.png', '605.png', '606.png', '607.png', '608.png', '609.png', '610.png', '611.png', '612.png', '613.png', '614.png', '615.png', '616.png', '617.png', '618.png', '619.png', '620.png', '621.png', '622.png', '623.png', '624.png', '625.png', '626.png', '627.png', '628.png', '629.png', '630.png', '631.png', '632.png', '633.png', '634.png', '635.png', '636.png', '637.png', '638.png', '639.png', '640.png', '641.png', '642.png', '643.png', '644.png', '645.png', '646.png', '647.png', '648.png', '649.png', '650.png', '651.png', '652.png', '653.png', '654.png', '655.png', '656.png', '657.png', '658.png', '659.png', '660.png', '661.png', '662.png', '663.png', '664.png', '665.png', '666.png', '667.png', '668.png', '669.png', '670.png', '671.png', '672.png', '673.png', '674.png', '675.png', '676.png', '677.png', '678.png', '679.png', '680.png', '681.png', '682.png', '683.png', '684.png', '685.png', '686.png', '687.png', '688.png', '689.png', '690.png', '691.png', '692.png', '693.png', '694.png', '695.png', '696.png', '697.png', '698.png', '699.png', '700.png', '701.png', '702.png', '703.png', '704.png', '705.png', '706.png', '707.png', '708.png', '709.png', '710.png', '711.png', '712.png', '713.png', '714.png', '715.png', '716.png', '717.png', '718.png', '719.png', '720.png', '721.png', '722.png', '723.png', '724.png', '725.png', '726.png', '727.png', '728.png', '729.png', '730.png', '731.png', '732.png', '733.png', '734.png', '735.png', '736.png', '737.png', '738.png', '739.png', '740.png', '741.png', '742.png', '743.png', '744.png', '745.png', '746.png', '747.png', '748.png', '749.png', '750.png', '751.png', '752.png', '753.png', '754.png', '755.png', '756.png', '757.png', '758.png', '759.png', '760.png', '761.png', '762.png', '763.png', '764.png', '765.png', '766.png', '767.png', '768.png', '769.png', '770.png', '771.png', '772.png', '773.png', '774.png', '775.png', '776.png', '777.png', '778.png', '779.png', '780.png', '781.png', '782.png', '783.png', '784.png', '785.png', '786.png', '787.png', '788.png', '789.png', '790.png', '791.png', '792.png', '793.png', '794.png', '795.png', '796.png', '797.png', '798.png', '799.png', '800.png', '801.png', '802.png', '803.png', '804.png', '805.png', '806.png', '807.png', '808.png', '809.png', '810.png', '811.png', '812.png', '813.png', '814.png', '815.png', '816.png', '817.png', '818.png', '819.png', '820.png', '821.png', '822.png', '823.png', '824.png', '825.png', '826.png', '827.png', '828.png', '829.png', '830.png', '831.png', '832.png', '833.png', '834.png', '835.png', '836.png', '837.png', '838.png', '839.png', '840.png', '841.png', '842.png', '843.png', '844.png', '845.png', '846.png', '847.png', '848.png', '849.png', '850.png', '851.png', '852.png', '853.png', '854.png', '855.png', '856.png', '857.png', '858.png', '859.png', '860.png', '861.png', '862.png', '863.png', '864.png', '865.png', '866.png', '867.png', '868.png', '869.png', '870.png', '871.png', '872.png', '873.png', '874.png', '875.png', '876.png', '877.png', '878.png', '879.png', '880.png', '881.png', '882.png', '883.png', '884.png', '885.png', '886.png', '887.png', '888.png', '889.png', '890.png', '891.png', '892.png', '893.png', '894.png', '895.png', '896.png', '897.png', '898.png', '899.png', '900.png', '901.png', '902.png', '903.png', '904.png', '905.png', '906.png', '907.png', '908.png', '909.png', '910.png', '911.png', '912.png', '913.png', '914.png', '915.png', '916.png', '917.png', '918.png', '919.png', '920.png', '921.png', '922.png', '923.png', '924.png', '925.png', '926.png', '927.png', '928.png', '929.png', '930.png', '931.png', '932.png', '933.png', '934.png', '935.png', '936.png', '937.png', '938.png', '939.png', '940.png', '941.png', '942.png', '943.png', '944.png', '945.png', '946.png', '947.png', '948.png', '949.png', '950.png', '951.png', '952.png', '953.png', '954.png', '955.png', '956.png', '957.png', '958.png', '959.png', '960.png', '961.png', '962.png', '963.png', '964.png', '965.png', '966.png', '967.png', '968.png', '969.png', '970.png', '971.png', '972.png', '973.png', '974.png', '975.png', '976.png', '977.png', '978.png', '979.png', '980.png', '981.png', '982.png', '983.png', '984.png', '985.png', '986.png', '987.png', '988.png', '989.png', '990.png', '991.png', '992.png', '993.png', '994.png', '995.png', '996.png', '997.png', '998.png', '999.png', '1000.png', '1001.png', '1002.png', '1003.png', '1004.png', '1005.png', '1006.png', '1007.png', '1008.png', '1009.png', '1010.png', '1011.png', '1012.png', '1013.png', '1014.png', '1015.png', '1016.png', '1017.png', '1018.png', '1019.png', '1020.png', '1021.png', '1022.png', '1023.png', '1024.png', '1025.png', '1026.png', '1027.png', '1028.png', '1029.png', '1030.png', '1031.png', '1032.png', '1033.png', '1034.png', '1035.png', '1036.png', '1037.png', '1038.png', '1039.png', '1040.png', '1041.png', '1042.png', '1043.png', '1044.png', '1045.png', '1046.png', '1047.png', '1048.png', '1049.png', '1050.png', '1051.png', '1052.png', '1053.png', '1054.png', '1055.png', '1056.png', '1057.png', '1058.png', '1059.png', '1060.png', '1061.png', '1062.png', '1063.png', '1064.png', '1065.png', '1066.png', '1067.png', '1068.png', '1069.png', '1070.png', '1071.png', '1072.png', '1073.png', '1074.png', '1075.png', '1076.png', '1077.png', '1078.png', '1079.png', '1080.png', '1081.png', '1082.png', '1083.png', '1084.png', '1085.png', '1086.png', '1087.png', '1088.png', '1089.png', '1090.png', '1091.png', '1092.png', '1093.png', '1094.png', '1095.png', '1096.png', '1097.png', '1098.png', '1099.png', '1100.png', '1101.png', '1102.png', '1103.png', '1104.png', '1105.png', '1106.png', '1107.png', '1108.png', '1109.png', '1110.png', '1111.png', '1112.png', '1113.png', '1114.png', '1115.png', '1116.png', '1117.png', '1118.png', '1119.png', '1120.png', '1121.png', '1122.png', '1123.png', '1124.png', '1125.png', '1126.png', '1127.png', '1128.png']; // List of available images
        const colorButtons = document.querySelectorAll(".color-button");

        colorButtons.forEach((button) => {
            button.addEventListener("click", async () => {
                loadedData["deck_name"] = generateFantasyName();
                console.log(loadedData["deck_name"]);

                const color = button.dataset.color;
                const randomIndex = Math.floor(Math.random() * images.length); // Generate a random index
                // Get the corresponding image URL
                loadedData["deck_image"] = `/images/Face NPC Portraits/${images[randomIndex]}`;
                loadedData["deck_description"] = generateNPC(loadedData["deck_name"]);
                console.log(loadedData["deck_image"]);

                const randomCards = await generateCharacter(color);
                selectedCardsList.innerHTML = "";
                removeAllButton.style.display = "none";
                const selectedCards = selectedCardsList.querySelectorAll("li").length;
                const selectedCount = document.querySelector("#selected-count");
                selectedCount.textContent = selectedCards;
                await filterData("", 1, randomCards);
                modal.classList.remove("open");
            });
        });

    }
    modal.classList.add("open");

}





async function handleLoadedData(loadedData, filename) {
    if (filename === "deck-manager.html") {
        selectedCardsList.innerHTML = "";
        removeAllButton.style.display = "none";
        const selectedCards = selectedCardsList.querySelectorAll("li").length;
        const selectedCount = document.querySelector("#selected-count");
        selectedCount.textContent = selectedCards;
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
        await filterData("", 1, loadedData["deck_list"]);
    }
}


loadStartUp();

const myInput = document.getElementById('my-input');
myInput.addEventListener('keyup', async function () {
    await filterData(this.value.toLowerCase(), 1, loadedData["deck_list"]);
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
            filterData("", 1, loadedData["deck_list"]).then(() => {
                console.log("loadedData");
            });
        } catch (error) {
            console.error("Invalid JSON file");
        }
    };
    reader.readAsText(file);
});

const generateBoosterPack = async (color = '') => {
    const response = await fetch("HoH_all.json");
    const result = await response.json();
    const data = result.deck_list;

    const filterCardsByColor = (cards) => {
        if (color === '') {
            return cards;
        }
        return cards.filter((card) => {
            const crystals = card.crystals || {};
            const {requires = [], provides = []} = crystals;
            return requires.includes(color) || provides.includes(color);
        });
    };

    const characters = filterCardsByColor(data.filter(card => card.type && card.type.includes("character")));
    const features = filterCardsByColor(data.filter(card => card.type && card.type.includes("feature")));
    const backgrounds = filterCardsByColor(data.filter(card => card.type && card.type.includes("background")));
    const species = filterCardsByColor(data.filter(card => card.type && card.type.includes("species")));
    const destinies = filterCardsByColor(data.filter(card => card.type && card.type.includes("destiny")));

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
        ...getRandomCards(characters, 0),
        ...getRandomCards(features, 3),
        ...getRandomCards(backgrounds, 0),
        ...getRandomCards(species, 0),
        ...getRandomCards(destinies, 0)
    ];

    const json = JSON.stringify(randomCards);
    return randomCards;
};

const generateCharacter = async (color = '') => {
    const response = await fetch("HoH_all.json");
    const result = await response.json();
    const data = result.deck_list;

    const filterCardsByColor = (cards) => {
        if (color === '') {
            return cards;
        }
        return cards.filter((card) => {
            const crystals = card.crystals || {};
            const {requires = [], provides = []} = crystals;
            return requires.includes(color) || provides.includes(color);
        });
    };

    console.log(color)


    const characters = (data.filter(card => card.type && card.type.includes("character")));
    const features = filterCardsByColor(data.filter(card => card.type && card.type.includes("feature")));
    const backgrounds = filterCardsByColor(data.filter(card => card.type && card.type.includes("background")));
    const species = data.filter(card => card.type && card.type.includes("species"));
    const destinies = data.filter(card => card.type && card.type.includes("destiny"));
    const items = data.filter(card => card.type && card.type.includes("item") && !card.type.includes("uncommon") && !card.type.includes("rare") && !card.type.includes("mythic"));

    const getRandomCards = (cards, count) => {
        const randomCards = [];



        while (randomCards.length < count) {
            if (randomCards.length < count){
                count = randomCards.length;
            }
            const randomIndex = Math.floor(Math.random() * cards.length);
            const card = cards[randomIndex];

            if (!randomCards.includes(card)) {
                randomCards.push(card);
            }
        }

        return randomCards;
    };

    return [
        ...getRandomCards(characters, 1),
        ...getRandomCards(features, 3),
        ...getRandomCards(backgrounds, 2),
        ...getRandomCards(species, 1),
        ...getRandomCards(destinies, 1),
        ...getRandomCards(items, 6)

    ];
};

const generateLootBoosterPack = async () => {
    const response = await fetch("HoH_all.json");
    const result = await response.json();
    const data = result["deck_list"];

    const items = data.filter(card => card.type && card.type.includes("item") && !card.type.includes("uncommon") && !card.type.includes("rare") && !card.type.includes("mythic"));

// Filter the magic cards by rarity
    const commonMagic = data.filter(card => card.type && card.type.includes("item") && card.type.includes("uncommon"));
    const uncommonMagic = data.filter(card => card.type && card.type.includes("item") && card.type.includes("rare"));
    const rareMagic = data.filter(card => card.type && card.type.includes("item") && card.type.includes("mythic"));

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
        let color = prompt("Enter a color to generate for (leave blank for any color):");
        color = color ? color.trim().toLowerCase() : "";

        const randomCards = await generateBoosterPack(color);
        selectedCardsList.innerHTML = "";
        removeAllButton.style.display = "none";
        const selectedCards = selectedCardsList.querySelectorAll("li").length;
        const selectedCount = document.querySelector("#selected-count");
        selectedCount.textContent = selectedCards;
        filterData("", 1, randomCards);
        console.log(randomCards);
    });

    document.querySelector("#generate-character").addEventListener("click", async () => {
        let color = prompt("Enter a color to generate for (leave blank for any color):");
        color = color ? color.trim().toLowerCase() : "";
        loadedData["deck_name"] = generateFantasyName();
        console.log(loadedData["deck_name"]);

        const images = ['001.png', '002.png', '003.png', '004.png', '005.png', '006.png', '007.png', '008.png', '009.png', '010.png', '011.png', '012.png', '013.png', '014.png', '015.png', '016.png', '017.png', '018.png', '019.png', '020.png', '021.png', '022.png', '023.png', '024.png', '025.png', '026.png', '027.png', '028.png', '029.png', '030.png', '031.png', '032.png', '033.png', '034.png', '035.png', '036.png', '037.png', '038.png', '039.png', '040.png', '041.png', '042.png', '043.png', '044.png', '045.png', '046.png', '047.png', '048.png', '049.png', '050.png', '051.png', '052.png', '053.png', '054.png', '055.png', '056.png', '057.png', '058.png', '059.png', '060.png', '061.png', '062.png', '063.png', '064.png', '065.png', '066.png', '067.png', '068.png', '069.png', '070.png', '071.png', '072.png', '073.png', '074.png', '075.png', '076.png', '077.png', '078.png', '079.png', '080.png', '081.png', '082.png', '083.png', '084.png', '085.png', '086.png', '087.png', '088.png', '089.png', '090.png', '091.png', '092.png', '093.png', '094.png', '095.png', '096.png', '097.png', '098.png', '099.png', '100.png', '101.png', '102.png', '103.png', '104.png', '105.png', '106.png', '107.png', '108.png', '109.png', '110.png', '111.png', '112.png', '113.png', '114.png', '115.png', '116.png', '117.png', '118.png', '119.png', '120.png', '121.png', '122.png', '123.png', '124.png', '125.png', '126.png', '127.png', '128.png', '129.png', '130.png', '131.png', '132.png', '133.png', '134.png', '135.png', '136.png', '137.png', '138.png', '139.png', '140.png', '141.png', '142.png', '143.png', '144.png', '145.png', '146.png', '147.png', '148.png', '149.png', '150.png', '151.png', '152.png', '153.png', '154.png', '155.png', '156.png', '157.png', '158.png', '159.png', '160.png', '161.png', '162.png', '163.png', '164.png', '165.png', '166.png', '167.png', '168.png', '169.png', '170.png', '171.png', '172.png', '173.png', '174.png', '175.png', '176.png', '177.png', '178.png', '179.png', '180.png', '181.png', '182.png', '183.png', '184.png', '185.png', '186.png', '187.png', '188.png', '189.png', '190.png', '191.png', '192.png', '193.png', '194.png', '195.png', '196.png', '197.png', '198.png', '199.png', '200.png', '201.png', '202.png', '203.png', '204.png', '205.png', '206.png', '207.png', '208.png', '209.png', '210.png', '211.png', '212.png', '213.png', '214.png', '215.png', '216.png', '217.png', '218.png', '219.png', '220.png', '221.png', '222.png', '223.png', '224.png', '225.png', '226.png', '227.png', '228.png', '229.png', '230.png', '231.png', '232.png', '233.png', '234.png', '235.png', '236.png', '237.png', '238.png', '239.png', '240.png', '241.png', '242.png', '243.png', '244.png', '245.png', '246.png', '247.png', '248.png', '249.png', '250.png', '251.png', '252.png', '253.png', '254.png', '255.png', '256.png', '257.png', '258.png', '259.png', '260.png', '261.png', '262.png', '263.png', '264.png', '265.png', '266.png', '267.png', '268.png', '269.png', '270.png', '271.png', '272.png', '273.png', '274.png', '275.png', '276.png', '277.png', '278.png', '279.png', '280.png', '281.png', '282.png', '283.png', '284.png', '285.png', '286.png', '287.png', '288.png', '289.png', '290.png', '291.png', '292.png', '293.png', '294.png', '295.png', '296.png', '297.png', '298.png', '299.png', '300.png', '301.png', '302.png', '303.png', '304.png', '305.png', '306.png', '307.png', '308.png', '309.png', '310.png', '311.png', '312.png', '313.png', '314.png', '315.png', '316.png', '317.png', '318.png', '319.png', '320.png', '321.png', '322.png', '323.png', '324.png', '325.png', '326.png', '327.png', '328.png', '329.png', '330.png', '331.png', '332.png', '333.png', '334.png', '335.png', '336.png', '337.png', '338.png', '339.png', '340.png', '341.png', '342.png', '343.png', '344.png', '345.png', '346.png', '347.png', '348.png', '349.png', '350.png', '351.png', '352.png', '353.png', '354.png', '355.png', '356.png', '357.png', '358.png', '359.png', '360.png', '361.png', '362.png', '363.png', '364.png', '365.png', '366.png', '367.png', '368.png', '369.png', '370.png', '371.png', '372.png', '373.png', '374.png', '375.png', '376.png', '377.png', '378.png', '379.png', '380.png', '381.png', '382.png', '383.png', '384.png', '385.png', '386.png', '387.png', '388.png', '389.png', '390.png', '391.png', '392.png', '393.png', '394.png', '395.png', '396.png', '397.png', '398.png', '399.png', '400.png', '401.png', '402.png', '403.png', '404.png', '405.png', '406.png', '407.png', '408.png', '409.png', '410.png', '411.png', '412.png', '413.png', '414.png', '415.png', '416.png', '417.png', '418.png', '419.png', '420.png', '421.png', '422.png', '423.png', '424.png', '425.png', '426.png', '427.png', '428.png', '429.png', '430.png', '431.png', '432.png', '433.png', '434.png', '435.png', '436.png', '437.png', '438.png', '439.png', '440.png', '441.png', '442.png', '443.png', '444.png', '445.png', '446.png', '447.png', '448.png', '449.png', '450.png', '451.png', '452.png', '453.png', '454.png', '455.png', '456.png', '457.png', '458.png', '459.png', '460.png', '461.png', '462.png', '463.png', '464.png', '465.png', '466.png', '467.png', '468.png', '469.png', '470.png', '471.png', '472.png', '473.png', '474.png', '475.png', '476.png', '477.png', '478.png', '479.png', '480.png', '481.png', '482.png', '483.png', '484.png', '485.png', '486.png', '487.png', '488.png', '489.png', '490.png', '491.png', '492.png', '493.png', '494.png', '495.png', '496.png', '497.png', '498.png', '499.png', '500.png', '501.png', '502.png', '503.png', '504.png', '505.png', '506.png', '507.png', '508.png', '509.png', '510.png', '511.png', '512.png', '513.png', '514.png', '515.png', '516.png', '517.png', '518.png', '519.png', '520.png', '521.png', '522.png', '523.png', '524.png', '525.png', '526.png', '527.png', '528.png', '529.png', '530.png', '531.png', '532.png', '533.png', '534.png', '535.png', '536.png', '537.png', '538.png', '539.png', '540.png', '541.png', '542.png', '543.png', '544.png', '545.png', '546.png', '547.png', '548.png', '549.png', '550.png', '551.png', '552.png', '553.png', '554.png', '555.png', '556.png', '557.png', '558.png', '559.png', '560.png', '561.png', '562.png', '563.png', '564.png', '565.png', '566.png', '567.png', '568.png', '569.png', '570.png', '571.png', '572.png', '573.png', '574.png', '575.png', '576.png', '577.png', '578.png', '579.png', '580.png', '581.png', '582.png', '583.png', '584.png', '585.png', '586.png', '587.png', '588.png', '589.png', '590.png', '591.png', '592.png', '593.png', '594.png', '595.png', '596.png', '597.png', '598.png', '599.png', '600.png', '601.png', '602.png', '603.png', '604.png', '605.png', '606.png', '607.png', '608.png', '609.png', '610.png', '611.png', '612.png', '613.png', '614.png', '615.png', '616.png', '617.png', '618.png', '619.png', '620.png', '621.png', '622.png', '623.png', '624.png', '625.png', '626.png', '627.png', '628.png', '629.png', '630.png', '631.png', '632.png', '633.png', '634.png', '635.png', '636.png', '637.png', '638.png', '639.png', '640.png', '641.png', '642.png', '643.png', '644.png', '645.png', '646.png', '647.png', '648.png', '649.png', '650.png', '651.png', '652.png', '653.png', '654.png', '655.png', '656.png', '657.png', '658.png', '659.png', '660.png', '661.png', '662.png', '663.png', '664.png', '665.png', '666.png', '667.png', '668.png', '669.png', '670.png', '671.png', '672.png', '673.png', '674.png', '675.png', '676.png', '677.png', '678.png', '679.png', '680.png', '681.png', '682.png', '683.png', '684.png', '685.png', '686.png', '687.png', '688.png', '689.png', '690.png', '691.png', '692.png', '693.png', '694.png', '695.png', '696.png', '697.png', '698.png', '699.png', '700.png', '701.png', '702.png', '703.png', '704.png', '705.png', '706.png', '707.png', '708.png', '709.png', '710.png', '711.png', '712.png', '713.png', '714.png', '715.png', '716.png', '717.png', '718.png', '719.png', '720.png', '721.png', '722.png', '723.png', '724.png', '725.png', '726.png', '727.png', '728.png', '729.png', '730.png', '731.png', '732.png', '733.png', '734.png', '735.png', '736.png', '737.png', '738.png', '739.png', '740.png', '741.png', '742.png', '743.png', '744.png', '745.png', '746.png', '747.png', '748.png', '749.png', '750.png', '751.png', '752.png', '753.png', '754.png', '755.png', '756.png', '757.png', '758.png', '759.png', '760.png', '761.png', '762.png', '763.png', '764.png', '765.png', '766.png', '767.png', '768.png', '769.png', '770.png', '771.png', '772.png', '773.png', '774.png', '775.png', '776.png', '777.png', '778.png', '779.png', '780.png', '781.png', '782.png', '783.png', '784.png', '785.png', '786.png', '787.png', '788.png', '789.png', '790.png', '791.png', '792.png', '793.png', '794.png', '795.png', '796.png', '797.png', '798.png', '799.png', '800.png', '801.png', '802.png', '803.png', '804.png', '805.png', '806.png', '807.png', '808.png', '809.png', '810.png', '811.png', '812.png', '813.png', '814.png', '815.png', '816.png', '817.png', '818.png', '819.png', '820.png', '821.png', '822.png', '823.png', '824.png', '825.png', '826.png', '827.png', '828.png', '829.png', '830.png', '831.png', '832.png', '833.png', '834.png', '835.png', '836.png', '837.png', '838.png', '839.png', '840.png', '841.png', '842.png', '843.png', '844.png', '845.png', '846.png', '847.png', '848.png', '849.png', '850.png', '851.png', '852.png', '853.png', '854.png', '855.png', '856.png', '857.png', '858.png', '859.png', '860.png', '861.png', '862.png', '863.png', '864.png', '865.png', '866.png', '867.png', '868.png', '869.png', '870.png', '871.png', '872.png', '873.png', '874.png', '875.png', '876.png', '877.png', '878.png', '879.png', '880.png', '881.png', '882.png', '883.png', '884.png', '885.png', '886.png', '887.png', '888.png', '889.png', '890.png', '891.png', '892.png', '893.png', '894.png', '895.png', '896.png', '897.png', '898.png', '899.png', '900.png', '901.png', '902.png', '903.png', '904.png', '905.png', '906.png', '907.png', '908.png', '909.png', '910.png', '911.png', '912.png', '913.png', '914.png', '915.png', '916.png', '917.png', '918.png', '919.png', '920.png', '921.png', '922.png', '923.png', '924.png', '925.png', '926.png', '927.png', '928.png', '929.png', '930.png', '931.png', '932.png', '933.png', '934.png', '935.png', '936.png', '937.png', '938.png', '939.png', '940.png', '941.png', '942.png', '943.png', '944.png', '945.png', '946.png', '947.png', '948.png', '949.png', '950.png', '951.png', '952.png', '953.png', '954.png', '955.png', '956.png', '957.png', '958.png', '959.png', '960.png', '961.png', '962.png', '963.png', '964.png', '965.png', '966.png', '967.png', '968.png', '969.png', '970.png', '971.png', '972.png', '973.png', '974.png', '975.png', '976.png', '977.png', '978.png', '979.png', '980.png', '981.png', '982.png', '983.png', '984.png', '985.png', '986.png', '987.png', '988.png', '989.png', '990.png', '991.png', '992.png', '993.png', '994.png', '995.png', '996.png', '997.png', '998.png', '999.png', '1000.png', '1001.png', '1002.png', '1003.png', '1004.png', '1005.png', '1006.png', '1007.png', '1008.png', '1009.png', '1010.png', '1011.png', '1012.png', '1013.png', '1014.png', '1015.png', '1016.png', '1017.png', '1018.png', '1019.png', '1020.png', '1021.png', '1022.png', '1023.png', '1024.png', '1025.png', '1026.png', '1027.png', '1028.png', '1029.png', '1030.png', '1031.png', '1032.png', '1033.png', '1034.png', '1035.png', '1036.png', '1037.png', '1038.png', '1039.png', '1040.png', '1041.png', '1042.png', '1043.png', '1044.png', '1045.png', '1046.png', '1047.png', '1048.png', '1049.png', '1050.png', '1051.png', '1052.png', '1053.png', '1054.png', '1055.png', '1056.png', '1057.png', '1058.png', '1059.png', '1060.png', '1061.png', '1062.png', '1063.png', '1064.png', '1065.png', '1066.png', '1067.png', '1068.png', '1069.png', '1070.png', '1071.png', '1072.png', '1073.png', '1074.png', '1075.png', '1076.png', '1077.png', '1078.png', '1079.png', '1080.png', '1081.png', '1082.png', '1083.png', '1084.png', '1085.png', '1086.png', '1087.png', '1088.png', '1089.png', '1090.png', '1091.png', '1092.png', '1093.png', '1094.png', '1095.png', '1096.png', '1097.png', '1098.png', '1099.png', '1100.png', '1101.png', '1102.png', '1103.png', '1104.png', '1105.png', '1106.png', '1107.png', '1108.png', '1109.png', '1110.png', '1111.png', '1112.png', '1113.png', '1114.png', '1115.png', '1116.png', '1117.png', '1118.png', '1119.png', '1120.png', '1121.png', '1122.png', '1123.png', '1124.png', '1125.png', '1126.png', '1127.png', '1128.png']; // List of available images
        const randomIndex = Math.floor(Math.random() * images.length); // Generate a random index
         // Get the corresponding image URL
        loadedData["deck_image"] = `/img/Face NPC Portraits/${images[randomIndex]}`;

        console.log(loadedData["deck_image"]);
        const randomCards = await generateCharacter(color);
        selectedCardsList.innerHTML = "";
        removeAllButton.style.display = "none";
        const selectedCards = selectedCardsList.querySelectorAll("li").length;
        const selectedCount = document.querySelector("#selected-count");
        selectedCount.textContent = selectedCards;
        filterData("", 1, randomCards);
    });

}

function generateFantasyName() {
    const syllables = ['thor', 'lar', 'mir', 'gorn', 'en', 'eth', 'li', 'on', 'riel', 'cal', 'dor', 'mor', 'ian', 'rim', 'ar'];
    const nicknames = ['the Brave', 'the Wise', 'the Dark', 'the Bold', 'the Swift', 'the Strong'];
    const numSyllables = Math.floor(Math.random() * 3) + 1; // Generates a random number of syllables between 3 and 5
    let name = '';

    for (let i = 0; i < numSyllables; i++) {
        const syllableIndex = Math.floor(Math.random() * syllables.length);
        const syllable = syllables[syllableIndex];

        name += syllable;
    }

    name = name.charAt(0).toUpperCase() + name.slice(1); // Capitalizes first letter of name

    const nicknameIndex = Math.floor(Math.random() * nicknames.length);
    const nickname = nicknames[nicknameIndex];

    name += ` ${nickname}`; // Appends random nickname to name

    return name;
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
                    filterData("", 1, decryptedJson["deck_list"], true);
                } else {
                    filterData("", 1, JSON.parse(fileData)["deck_list"]);
                }
            } catch (error) {
                console.error("Invalid or corrupted encrypted file");
            }
        };
        reader.readAsText(file);
    }
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
            if (file.name.endsWith(".hoh")) {
                const decryptedJson = decrypt(fileData);
                filterData("", 1, decryptedJson["deck_list"], true);
            } else {
                filterData("", 1, JSON.parse(fileData)["deck_list"]);
            }
        } catch (error) {
            console.error("Invalid or corrupted encrypted file");
        }
    };
    reader.readAsText(file);
});


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
            {"stat_name": "hp", "stat_value": default_values["hp"]},
            {"stat_name": "mp", "stat_value": default_values["mp"]},
            {"stat_name": "sp", "stat_value": default_values["sp"]},
            {"stat_name": "hd", "stat_value": default_values["hd"]},
            {"stat_name": "md", "stat_value": default_values["md"]},
            {"stat_name": "sd", "stat_value": default_values["sd"]}
        ];
        card['abilities'] = [
            {"ability_name": "STR", "ability_value": default_values["STR"]},
            {"ability_name": "DEX", "ability_value": default_values["DEX"]},
            {"ability_name": "COS", "ability_value": default_values["CON"]},
            {"ability_name": "INT", "ability_value": default_values["INT"]},
            {"ability_name": "WIS", "ability_value": default_values["WIS"]},
            {"ability_name": "CAR", "ability_value": default_values["CAR"]}
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

