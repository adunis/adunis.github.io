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
    const superMiniCardView = document.querySelector("#super-mini-card-view");
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

    superMiniCardView.addEventListener("change", () => {
        console.log("switched")
        const cards = document.querySelectorAll(".card");
        cards.forEach(function (card) {
            if (card.classList.contains('super-mini-card')) {
                card.classList.remove('super-mini-card');
            } else {
                card.classList.add('super-mini-card');
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

        if (window.location.pathname.endsWith("gm-panel.html")) {
        if (card.type.includes("character")) {
            const mainCharButton = document.createElement("button");
            mainCharButton.classList.add("main-char-button");
            mainCharButton.addEventListener("click", (event) => {
                event.stopPropagation();
                const mainDeckElements = document.querySelectorAll(`[data-json-id="${card.id}"]`);
                for (const mainDeckElement of mainDeckElements) {
                    if (!mainDeckElement.getAttribute("character-status")) {
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
        const deckToggle = document.querySelector('#toggle-deck-stats-btn');
        const deckStats = document.querySelector("#deck-container");


// add event listeners for editing deck name, image, and description

        deckToggle.addEventListener('change', () => {
            isChecked = deckToggle.checked;
            if (isChecked) {
                console.log("deck stats changed")
                deckStats.classList.add("deckStatsHidden");
            } else { 
                console.log("deck stats changed")
                deckStats.classList.remove("deckStatsHidden");
            }
        });


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

        const modal = document.getElementById("modal-deck-description");
        const modalContent = document.getElementById("modal-content-deck-description");
        const modalClose = document.getElementById("modal-close-deck-description");
        const modalForm = document.getElementById("modal-form-deck-description");
        const modalInput = document.getElementById("modal-input-deck-description");
        deckDescription.addEventListener("click", () => {
            modal.style.display = "block";
            modalInput.value = loadedData["deck_description"];
        });

        modalClose.addEventListener("click", () => {
            modal.style.display = "none";
        });

        modalForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const newDeckDescription = modalInput.value;
            if (newDeckDescription) {
                loadedData["deck_description"] = newDeckDescription;
                deckDescription.textContent = newDeckDescription;
                modal.style.display = "none";
            }
        });

        const increaseCoinsBtn = document.getElementById("increase-coins-btn");
        increaseCoinsBtn.addEventListener("click", function () {
            const coinCounter = document.getElementById("coin-counter");
            const coinValue = parseInt(coinCounter.innerText);
            coinCounter.innerText = coinValue + 1;
            loadedData.coin = coinValue + 1;
        });

        const decreaseCoinsBtn = document.getElementById("decrease-coins-btn");
        decreaseCoinsBtn.addEventListener("click", function () {
            const coinCounter = document.getElementById("coin-counter");
            const coinValue = parseInt(coinCounter.innerText);
            coinCounter.innerText = coinValue - 1;
            loadedData.coin = coinValue - 1;
        });


        const increaseXPBtn = document.getElementById("increase-xp-btn");
        increaseXPBtn.addEventListener("click", function () {
            const xpCounter = document.getElementById("xp-counter");
            const xpValue = parseInt(xpCounter.innerText);
            xpCounter.innerText = xpValue + 1;
            loadedData.xp = xpValue + 1;
        });

        const decreaseXPBtn = document.getElementById("decrease-xp-btn");
        decreaseXPBtn.addEventListener("click", function () {
            const xpCounter = document.getElementById("xp-counter");
            const xpValue = parseInt(xpCounter.innerText);
            xpCounter.innerText = xpValue - 1;
            loadedData.XP = xpValue - 1;
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
        "was born into a wealthy family in the city of Venice, but was exiled after a scandalous affair",
        "grew up in poverty in the slums of Paris, struggling to survive as a beggar",
        "was orphaned at a young age after their family was killed by marauding orcs in the Black Forest",
        "used to be a soldier in the King's army, fighting in the War of the Roses",
        "was a successful merchant in the bustling trading city of Constantinople",
        "was once a notorious criminal, running with a gang of thieves in the back alleys of Naples",
        "lived in isolation for many years in a remote monastery high in the Swiss Alps, studying ancient texts and forbidden magic",
        "was a skilled craftsman in the guilds of Bruges, renowned for their intricate woodcarvings",
        "was a member of a nomadic tribe of horse-riders on the steppes of Eastern Europe",
        "was a scholar in the great libraries of Oxford, delving into the secrets of alchemy and astrology",
        "was a pirate on the high seas, plundering ships and hiding out in the pirate havens of the Caribbean",
        "was a member of a secret society of assassins, trained in the deadly arts in the hidden fortress of Masyaf",
        "was a bard in the courts of the German princes, singing tales of love and war to entertain the nobility",
        "was a knight in the service of the Holy Roman Empire, fighting against the infidel in the Crusades",
        "was born into a wealthy noble family from the Kingdom of Aragon",
        "grew up in poverty in the slums of Venice, constantly fighting to survive",
        "was orphaned at a young age due to a dragon attack in the countryside of France",
        "used to be a soldier in the Ottoman army, fighting in the siege of Constantinople",
        "was a successful merchant in the Hanseatic League, traveling from London to Novgorod",
        "was once a notorious criminal, leading a band of orcs and goblins in the hills of Scotland",
        "lived in isolation for many years in the Black Forest, studying dark magic and alchemy",
        "was a skilled craftsman from the Guild of Blacksmiths in the Holy Roman Empire, creating weapons and armor for knights and nobles",
        "grew up as an orphan among the elves of the Enchanted Forest, learning the ways of archery and nature magic",
        "was a scholar from the University of Salamanca, studying ancient texts and lore from across the world",
        "lived as a hermit in the mountains of the Carpathians, communicating with spirits and ghosts",
        "was a pirate from the Free City of Danzig, sailing the seas and raiding merchant ships",
        "was a monk from the Abbey of Cluny, practicing meditation and contemplation",
        "was a farmer from the countryside of Tuscany, tending to vineyards and crops",
        "was a member of the Knights Templar, fighting in the Crusades and defending the Holy Land",
        "was a scribe from the Court of the Holy Roman Emperor, writing chronicles and manuscripts",
        "grew up among the dwarves of the mines of Cornwall, learning the secrets of metallurgy and gem-cutting",
        "was a troubadour from the Court of the King of France, singing songs and telling stories",
        "was a healer from the Scottish Highlands, using herbal remedies and magic to cure ailments",
        "was a spy from the Court of the Doge of Venice, gathering information and secrets for the Republic",
        "was a hunter from the forests of Bohemia, tracking down wolves and bears for their pelts and meat",
        "was a monk from the Monastery of Montserrat, studying theology and philosophy",
        "was a gladiator from the Roman Colosseum, fighting for glory and freedom",
        "was a member of the Thieves' Guild in the City of Genoa, stealing and pickpocketing from unsuspecting victims",
        "was a bard from the Court of the King of England, composing ballads and sonnets",
        "was a knight from the Court of the Duke of Burgundy, jousting and competing in tournaments",
        "was a spy from the Court of the Sultan of the Ottoman Empire, infiltrating enemy cities and armies",
        "was a sailor from the Republic of Venice, navigating the seas and exploring distant lands",
        "was a monk from the Monastery of Clonmacnoise, copying manuscripts and illuminating texts",
        "was a minstrel from the Court of the King of Castile, playing music and entertaining guests",
        "was a thief from the streets of Naples, stealing from rich merchants and nobles",
        "was a scholar from the University of Oxford, studying natural philosophy and mathematics",
        "was a knight from the Court of the King of Poland, defending the borders and fighting invaders",
        "was a gladiator from the Arena of Verona, battling fierce beasts and opponents",
        "was raised by a family of elven nomads in the forests of Germany",
        "grew up in a small village in the Scottish Highlands, fending off attacks from marauding orcs",
        "was born to a noble family in the kingdom of Castile, and trained in the art of chivalry",
        "spent their childhood in the mountains of Transylvania, honing their skills as a vampire hunter",
        "was the apprentice of a powerful wizard in the city of Prague",
        "was taken in by a tribe of dragon-riders in the mountains of Wales",
        "was trained as a knight in the holy city of Jerusalem, and fought in the Crusades",
        "spent years traveling as a mercenary in the wars between the Italian city-states",
        "was raised by a family of dwarven blacksmiths in the mines of the Carpathian Mountains",
        "was a member of a secret society of assassins in the Ottoman Empire",
        "was a sailor on a pirate ship that roamed the Mediterranean",
        "was a scholar in the university town of Oxford, studying ancient magical tomes",
        "was a member of a band of Robin Hood-like thieves in the forests of Sherwood",
        "was a monk in a secluded abbey in the Swiss Alps, dedicating their life to prayer and meditation",
        "was a druidic priestess in the misty hills of Ireland, communing with the spirits of the land",
        "was a squire in the service of a knightly order in the Holy Roman Empire",
        "was a member of a cult of snake-worshippers in the deserts of Egypt",
        "was a gladiator in the arenas of Rome, fighting for survival against fierce beasts and other warriors",
        "was a bard in the courts of the French kings, composing songs of love and war",
        "was a student in the alchemical academy of Salamanca, seeking the secrets of transmutation",
        "was a member of a guild of thieves and smugglers in the port city of Hamburg",
        "was a werewolf hunter in the forests of the Carpathians, battling the beasts that threatened the local villagers",
        "was a hermit in the Pyrenees mountains, living off the land and studying the secrets of the universe",
        "was a member of a secret society of vampire hunters in the city of Venice",
        "was a soldier in the army of the Byzantine Empire, defending the eastern frontier from invading hordes",
        "was a member of a coven of witches in the forests of Bavaria, practicing ancient rituals to gain power",
        "was a knight of the Teutonic Order, fighting against pagans and infidels in the Baltic lands",
        "was a member of a guild of monster-hunters in the city of Bruges, taking on dangerous contracts for gold and glory",
        "was a troubadour in the courts of the Moorish kings of Andalusia, singing of love and adventure",
        "was a member of a sect of necromancers in the catacombs beneath Paris, raising the dead to do their bidding",
        "was a sailor on a ship that sailed the high seas, battling sea monsters and pirates",
        "was a member of a tribe of nomadic gypsies in the Balkans, traveling from town to town and performing feats of daring",
        "was a knight in the service of the king of England, fighting in the Hundred Years' War against the French",
        "was a member of a band of Viking raiders, plundering the coasts of northern Europe",
        "was a monk in the monastery of Montserrat, dedicating their life to the pursuit",
        "was born into a family of elven nobles in the forests of Lothlindor",
        "grew up as a ward of the Church in the Kingdom of Aragonia",
        "was orphaned when their village was raided by orcs in the Duchy of Württemberg",
        "used to be a knight of the Order of the Dragon, serving in the Holy Roman Empire",
        "was a successful alchemist in the Free City of Krakow",
        "was once a notorious pirate, sailing the seas off the coast of Brittany",
        "lived in isolation for many years, studying the ancient magic of the druids in the forests of the Ardennes",
        "was a skilled blacksmith in the Kingdom of Castile, crafting weapons and armor for the armies of the Reconquista",
        "was a court jester in the court of the Duke of Burgundy",
        "served as a diplomat for the Kingdom of Denmark, negotiating with the trolls of Jotunheim",
        "was a hermit in the mountains of the Carpathians, where they discovered a dragon's hoard",
        "was a member of the Order of the Black Sun, a secret society of necromancers in the Papal States",
        "was a slave in the salt mines of Transylvania, before being freed by a group of rebels",
        "was a member of the Knights Templar, who fled to the Kingdom of Cyprus after the fall of their order",
        "was a scholar in the University of Paris, where they studied the ancient texts of the Merovingian kings",
        "was a thief in the slums of Constantinople, before being recruited by the Assassin's Guild",
        "was a ranger in the forests of the Ardennes, fighting against the orcish hordes of the Kingdom of Rhineland",
        "was a member of the Varangian Guard, serving the Byzantine Empire in their wars against the Ottoman Turks",
        "was a monk in the abbey of Monte Cassino, where they witnessed a battle between angels and demons",
        "was a spy for the Kingdom of Scotland, infiltrating the court of the King of England",
        "was a mercenary in the armies of the Grand Duchy of Lithuania, fighting against the Teutonic Order",
        "was a member of the Inquisition, hunting down heretics and witches in the Kingdom of Portugal",
        "was a gladiator in the Colosseum of Rome, where they fought against minotaurs and other monsters",
        "was a bard in the court of the High King of Ireland, where they learned the secrets of the fae",
        "was a samurai in the service of the Shogun, fighting against the oni in the Land of the Rising Sun",
        "was a member of the Guild of Adventurers, exploring ancient ruins in the deserts of Arabia",
        "was a warrior in the armies of the Khan, fighting against the dragons of the steppe",
        "was a member of the Druidic Circle, protecting the sacred groves of Stonehenge",
        "was a knight of the Round Table, serving King Arthur in their quest for the Holy Grail",
        "was a wizard in the court of the Tsar, where they studied the ancient magic of the Rus",
        "was born into a wealthy family in the Kingdom of Castile",
        "grew up in poverty in the slums of Paris",
        "was orphaned at a young age during the siege of Constantinople",
        "used to be a soldier in the army of the Holy Roman Empire",
        "was a successful merchant in the Republic of Venice",
        "was once a notorious criminal in the streets of London",
        "lived in isolation for many years in the Black Forest of Germany",
        "was a skilled craftsman in the Kingdom of Aragon",
        "served as a squire to a noble lord in the Kingdom of Scotland",
        "was a member of a secret society in the Ottoman Empire",
        "trained as a monk in a monastery in the Swiss Alps",
        "was a sailor on a trading ship from the Hanseatic League",
        "was a prisoner of war in the Kingdom of Hungary",
        "was a member of a band of gypsies in the Carpathian Mountains",
        "was a scholar at the University of Salamanca",
        "was a hunter in the forests of Bohemia",
        "was a gladiator in the Roman Colosseum",
        "was a hermit in the mountains of the Balkans",
        "was a member of the Knights Templar during the Crusades",
        "was a spy for the Kingdom of Portugal in the court of Spain",
        "was a member of the Inquisition in the Kingdom of Aragon",
        "was a thief in the bazaars of Istanbul",
        "was a farmer in the fields of Tuscany",
        "was a knight in the service of the King of France",
        "was a member of a traveling troupe of performers in the Kingdom of Poland",
        "was a witch in the forests of Transylvania",
        "was a monk in the Abbey of Saint Gall in Switzerland",
        "was a trader on the Silk Road from China to Europe",
        "was a pirate in the Mediterranean Sea",
        "was a vampire in the Carpathian Mountains",
        "was a member of a secret order of knights in the Kingdom of Hungary",
        "was a bard in the courts of the Kingdom of Denmark",
        "was a monk in the monastery of Mont Saint-Michel in Normandy",
        "was a mercenary in the service of the Doge of Genoa",
        "was a diplomat in the court of the Holy Roman Emperor",
        "was a member of the Order of the Dragon in the Kingdom of Hungary",
        "was a scholar at the University of Oxford",
        "was a member of the Royal Society in the Kingdom of England",
        "was a doctor in the city of Florence",
        "was a poet in the court of the King of Portugal",
        "was a member of the Assassins in the Middle East",
        "was a member of the Teutonic Knights in the Baltic region",
        "was a member of the Hashshashin in Persia",
        "was a monk in the monastery of Cluny in France",
        "was a knight in the service of the Emperor of the Byzantine Empire",
        "was a scholar at the University of Bologna",
        "was a member of the Knights of Santiago in the Kingdom of Castile",
        "was a heretic in the Kingdom of Bohemia",
        "was a troubadour in the courts of the Kingdom of Aragon",
        "was a member of the Varangian Guard in the service of the Byzantine Emperor"
    ];

// Array of possible personality sentences
    const personalities = [
        "is very friendly and outgoing, always making new friends wherever they go",
        "tends to be quiet and reserved, preferring to keep to themselves",
        "has a quick temper and a fierce sense of justice, always ready to stand up for what's right",
        "is always looking for a fight, eager to test their strength against worthy opponents",
        "is very curious and loves to explore, always seeking out new and exciting experiences",
        "is fiercely loyal to their friends, willing to do whatever it takes to protect them",
        "has a dark sense of humor, finding joy in the macabre and the grotesque",
        "is very superstitious, always carrying lucky charms and avoiding certain places and people",
        "is a recluse, living alone in a dark castle on the edge of the Carpathian Mountains",
        "is very friendly and outgoing, always making new friends wherever they go",
        "tends to be quiet and reserved, preferring to keep to themselves",
        "has a quick temper and a fierce sense of justice, always ready to stand up for what's right",
        "is always looking for a fight, eager to test their strength against worthy opponents",
        "is very curious and loves to explore, always seeking out new and exciting experiences",
        "is fiercely loyal to their friends, willing to do whatever it takes to protect them",
        "has a dark sense of humor, finding joy in the macabre and the grotesque",
        "is very superstitious, always carrying lucky charms and avoiding certain places and people",
        "is a recluse, living alone in a dark castle on the edge of the Carpathian Mountains",
        "is a master of diplomacy, able to charm their way out of any situation",
        "is a natural leader, inspiring others with their courage and wisdom",
        "is haunted by a tragic past, struggling to come to terms with their grief",
        "is a scholar, spending hours poring over dusty tomes and ancient manuscripts",
        "is a skilled artisan, crafting beautiful works of art with their own two hands",
        "is a devout follower of the gods, praying for guidance and protection in all their endeavors",
        "is a bit of a wild card, unpredictable and prone to sudden outbursts of emotion",
        "is a shrewd trader, always on the lookout for a good deal",
        "is a notorious pirate, feared and respected on the high seas",
        "is a master thief, able to slip in and out of even the most heavily guarded places unnoticed",
        "is a powerful mage, wielding magic with ease and finesse",
        "is a wise old sage, dispensing advice and wisdom to all who seek it",
        "is a skilled hunter, stalking their prey with deadly precision",
        "is a renowned chef, able to turn even the most humble ingredients into a feast fit for a king",
        "is a devout follower of nature, always seeking to live in harmony with the world around them",
        "is a noble knight, sworn to defend the weak and uphold the principles of chivalry",
        "is a grizzled mercenary, fighting for coin and glory on the battlefields of Europe",
        "is a member of a secret society, sworn to protect ancient knowledge and artifacts from falling into the wrong hands",
        "is a wandering minstrel, entertaining crowds with their songs and stories",
        "is a master of disguise, able to blend in seamlessly with any crowd",
        "is a hermit, living a simple life in the mountains far from civilization",
        "is a member of a mysterious order of monks, training their bodies and minds to achieve enlightenment",
        "is a skilled blacksmith, forging weapons and armor of unsurpassed quality",
        "is a deadly assassin, hired to eliminate targets with ruthless efficiency",
        "is a master of the dark arts, summoning demons and other malevolent creatures to do their bidding",
        "is a skilled healer, able to cure even the most deadly of diseases and injuries",
        "is a mad scientist, conducting twisted experiments in their quest for knowledge and power",
        "is a brave explorer, venturing into unknown lands in search of treasure and adventure",
        "is a powerful warlord, commanding armies of orcs, goblins, and other monstrous creatures",
        "is a notorious bandit, robbing from the rich and giving to the poor",
        "is very friendly and outgoing, always making new friends wherever they go",
        "tends to be quiet and reserved, preferring to keep to themselves",
        "has a quick temper and a fierce sense of justice, always ready to stand up for what's right",
        "is always looking for a fight, eager to test their strength against worthy opponents",
        "is very curious and loves to explore, always seeking out new and exciting experiences",
        "is fiercely loyal to their friends, willing to do whatever it takes to protect them",
        "has a dark sense of humor, finding joy in the macabre and the grotesque",
        "is very superstitious, always carrying lucky charms and avoiding certain places and people",
        "is a recluse, living alone in a dark castle on the edge of the Carpathian Mountains",
        "is a cunning strategist, able to outthink and outmaneuver even the most formidable foes",
        "has a deep reverence for nature, and spends most of their time communing with the spirits of the forest",
        "is a skilled artisan, crafting beautiful works of art and intricate machinery with ease",
        "is a natural born leader, inspiring others with their charisma and strength of will",
        "is a devout follower of the gods, performing elaborate rituals and ceremonies to gain their favor",
        "is a shrewd merchant, always on the lookout for the next big deal or profitable opportunity",
        "is a master of disguise, able to blend in seamlessly with any crowd or environment",
        "is an accomplished musician, able to stir the hearts and souls of all who hear them play",
        "is a fierce defender of their homeland, willing to lay down their life to protect their people",
        "is a nomadic wanderer, roaming the land in search of adventure and enlightenment",
        "is a brilliant inventor, creating groundbreaking technologies that change the world",
        "is a skilled healer, able to mend even the most grievous wounds with ease",
        "is a notorious pirate, plundering the high seas and terrorizing coastal towns",
        "is a wise sage, dispensing knowledge and guidance to all who seek their counsel",
        "is a powerful mage, wielding magic that can reshape the very fabric of reality",
        "is a skilled assassin, able to strike with deadly precision and vanish into the shadows",
        "is a charismatic diplomat, able to broker peace between even the bitterest of enemies",
        "is very friendly and outgoing, always making new friends wherever they go, even with the orcs of the Black Forest or the elves of the Emerald Isles",
        "tends to be quiet and reserved, preferring to keep to themselves, often lost in thought about the ancient ruins of Rome or the mysteries of the Pyramids",
        "has a quick temper and a fierce sense of justice, always ready to stand up for what's right, even against the monsters that lurk in the forests of the Balkans or the dragons that soar over the Alps",
        "is always looking for a fight, eager to test their strength against worthy opponents, whether it be the trolls of Norway or the goblins of the Iberian Peninsula",
        "is very curious and loves to explore, always seeking out new and exciting experiences, from the castles of Transylvania to the catacombs beneath Paris",
        "is fiercely loyal to their friends, willing to do whatever it takes to protect them, even if it means venturing into the haunted forests of Germany or the swamps of Poland",
        "has a dark sense of humor, finding joy in the macabre and the grotesque, often making jokes about the vampires of Romania or the werewolves of England",
        "is very superstitious, always carrying lucky charms and avoiding certain places and people, such as the witches of Salem or the haunted castles of Scotland",
        "is a recluse, living alone in a dark castle on the edge of the Carpathian Mountains, shunning the company of others and only venturing out to hunt the monsters that threaten their land"
    ];

// Array of possible story sentences
    const stories = [
        "is on a quest to retrieve a powerful relic from the ruins of a long-forgotten elven city in the forest of Broceliande, France.",
        "is trying to establish a trade route between the orcish clans of the Carpathian Mountains and the merchants of Venice, Italy.",
        "is hiding from a band of marauding dragons that have taken up residence in the abandoned castle of Dracula in Transylvania.",
        "is searching for the lost tomb of Saint James the Apostle, rumored to be hidden somewhere along the Camino de Santiago pilgrimage route in northern Spain.",
        "is dealing with the aftermath of a devastating plague that has ravaged their hometown in the Germanic lands.",
        "is trying to clear their name after being accused of witchcraft by the Inquisition in Rome, Italy.",
        "is working as a spy for the Knights Hospitaller, tasked with infiltrating the Ottoman Empire's stronghold of Constantinople to gather intelligence on their military movements.",
        "is seeking revenge against a group of marauding goblins who attacked their village in the Black Forest of Germany, leaving their family and friends dead or missing.",
        "is on a quest to discover the truth behind a mysterious prophecy that foretells the rise of a great evil in the world, said to be located in the far-off kingdom of Byzantium.",
        "is trying to broker a peace treaty between the warring factions of elves and dwarves in the Alpine Mountains of Switzerland.",
        "is hiding from a horde of rampaging orcs that have been unleashed from the ancient tombs of the Huns in Hungary.",
        "is searching for a powerful sorceress who is rumored to live in the enchanted forests of Sherwood, England.",
        "is dealing with the consequences of a failed assassination attempt on the king of France, which has led to them being labeled a traitor by the royal court in Paris.",
        "is trying to clear the name of their family, who have been accused of collaborating with the enemy during the Hundred Years' War between England and France.",
        "is working as a bodyguard for the Holy Roman Emperor, tasked with protecting him from assassination attempts by rival factions in the city of Prague.",
        "is seeking revenge against a group of trolls that have been raiding their family's lands in the fjords of Norway.",
        "is on a quest to uncover the lost city of Atlantis, rumored to be located somewhere in the Mediterranean Sea.",
        "is trying to unite the various tribes of goblins and hobgoblins in the Balkans to form a powerful army that can resist the Ottoman Empire's expansion into Europe.",
        "is hiding from the wrath of a powerful sorcerer who has placed a curse on them, forcing them to flee to the remote island of Skye in Scotland.",
        "is searching for a legendary dragon-slaying sword that is said to be hidden in the catacombs beneath the Vatican in Rome.",
        "is dealing with a personal tragedy, having lost their family and home to a devastating flood that swept through the lowlands of the Netherlands.",
        "is trying to clear their name after being falsely accused of stealing a priceless artifact from the royal treasury in the city of Krakow, Poland.",
        "is working as a smuggler, transporting contraband goods across the English Channel to evade the strict trade restrictions imposed by the Hanseatic League.",
        "is seeking revenge against the orcish warlord who killed their mentor in battle in the mountains of the Balkans.",
        "is on a quest to retrieve a powerful relic from the ruins of a long-forgotten elven city in the forest of Broceliande, France.",
        "is trying to establish a trade route between the orcish clans of the Carpathian Mountains and the merchants of Venice, Italy.",
        "is hiding from a band of marauding dragons that have taken up residence in the abandoned castle of Dracula in Transylvania, Romania.",
        "is searching for the lost tomb of Saint James the Apostle, rumored to be hidden somewhere along the Camino de Santiago pilgrimage route in northern Spain.",
        "is dealing with the aftermath of a devastating plague that has ravaged their hometown in the Germanic lands, with reports of orcish and goblinoid raids on the outskirts of the city.",
        "is trying to clear their name after being accused of witchcraft by the Inquisition in Rome, Italy, while also facing attacks from dark elves and trolls lurking in the shadows.",
        "is working as a spy for the Knights Hospitaller, tasked with infiltrating the Ottoman Empire's stronghold of Constantinople to gather intelligence on their military movements and to confront an evil dragon that has taken refuge in the city.",
        "is seeking revenge against a group of marauding goblins who attacked their village in the Black Forest of Germany, leaving their family and friends dead or missing, and is aided by a wise old elf who has knowledge of the ancient magic of the land.",
        "is on a quest to discover the truth behind a mysterious prophecy that foretells the rise of a great evil in the world, said to be located in the far-off kingdom of Byzantium, and is pursued by savage beasts and undead creatures.",
        "is trying to broker a peace treaty between the warring factions of elves and dwarves in the Alpine Mountains of Switzerland, but is opposed by a powerful dragon and its army of orcish mercenaries.",
        "is hiding from a horde of rampaging orcs that have been unleashed from the ancient tombs of the Huns in Hungary, and seeks refuge in the legendary city of Camelot, where they encounter knights and sorcerers.",
        "is searching for a powerful sorceress who is rumored to live in the enchanted forests of Sherwood, England, and is accompanied by a group of valiant dwarves who possess great knowledge of ancient runes and spells.",
        "is dealing with the consequences of a failed assassination attempt on the king of France, which has led to them being labeled a traitor by the royal court in Paris, and is forced to seek sanctuary in the dark forests of Germany, where they encounter treacherous trolls and shape-shifting creatures.",
        "is trying to clear the name of their family, who have been accused of collaborating with the enemy during the Hundred Years' War between England and France, and is pursued by a powerful dragon that seeks to prevent them from revealing the truth.",
        "is working as a bodyguard for the Holy Roman Emperor, tasked with protecting him from assassination attempts by rival factions in the city of Prague, and is aided by a wise old sage who possesses knowledge of the arcane arts.",
        "is seeking revenge against a group of trolls that have been raiding their family's lands in the fjords of Norway, and embarks on a perilous journey to the fiery pits of Mount Etna in Italy to acquire a powerful magical artifact that can defeat them.",
        "is on a quest to uncover the lost city of Atlantis, rumored to be located somewhere in the Mediterranean Sea, and must navigate treacherous waters filled with sea monsters and merfolks",
        "is on a quest to retrieve a powerful relic from the ruins of a long-forgotten elven city in the forest of Broceliande, France, rumored to be guarded by a fierce dragon that once terrorized the nearby town of Nantes.",
        "is trying to establish a trade route between the orcish clans of the Carpathian Mountains and the merchants of Venice, Italy, passing through the treacherous Alps that have claimed the lives of many travelers over the years.",
        "is hiding from a band of marauding dragons that have taken up residence in the abandoned castle of Dracula in Transylvania, once a seat of power for the infamous Vlad the Impaler.",
        "is searching for the lost tomb of Saint James the Apostle, rumored to be hidden somewhere along the Camino de Santiago pilgrimage route in northern Spain, facing dangerous bandits and treacherous terrain along the way.",
        "is dealing with the aftermath of a devastating plague that has ravaged their hometown in the Germanic lands, forcing them to seek refuge in the city of Strasbourg, where they must navigate the complex political landscape of the Holy Roman Empire.",
        "is trying to clear their name after being accused of witchcraft by the Inquisition in Rome, Italy, seeking sanctuary in the shadowy alleys of the ancient city and enlisting the help of a powerful sorcerer rumored to be living in the nearby hills of Tuscany.",
        "is working as a spy for the Knights Hospitaller, tasked with infiltrating the Ottoman Empire's stronghold of Constantinople to gather intelligence on their military movements, navigating the treacherous waters of the Aegean Sea and avoiding the dreaded pirates of the Barbary Coast.",
        "is seeking revenge against a group of marauding goblins who attacked their village in the Black Forest of Germany, leaving their family and friends dead or missing, using their tracking skills to follow the trail of the goblins to their hidden lair deep in the mountains.",
        "is on a quest to discover the truth behind a mysterious prophecy that foretells the rise of a great evil in the world, said to be located in the far-off kingdom of Byzantium, traveling through the rugged terrain of the Balkans and crossing the treacherous waters of the Bosphorus Strait.",
        "is trying to broker a peace treaty between the warring factions of elves and dwarves in the Alpine Mountains of Switzerland, meeting with both sides in the neutral territory of Geneva and using their diplomatic skills to find a common ground.",
        "is hiding from a horde of rampaging orcs that have been unleashed from the ancient tombs of the Huns in Hungary, seeking shelter in the fortified city of Buda and joining forces with a group of rebel knights who seek to overthrow the corrupt ruler of the land.",
        "is searching for a powerful sorceress who is rumored to live in the enchanted forests of Sherwood, England, navigating the treacherous marshes of East Anglia and avoiding the dangerous bandits who lurk in the shadows of the woods.",
        "is dealing with the consequences of a failed assassination attempt on the king of France, which has led to them being labeled a traitor by the royal court in Paris, seeking refuge in the catacombs beneath the city and enlisting the help of a group of thieves who seek to overthrow the corrupt monarchy.",
        "is trying to clear the name of their family, who have been accused of collaborating with the enemy during the Hundred Years' War between England and France, embarking on a dangerous journey across the English Channel to find evidence of their family's innocence in the archives of the Vatican in Rome.",
        "is on a perilous journey to reach the lost city of Machu Picchu in the Andes Mountains of Peru, seeking to uncover the secrets of an ancient Incan civilization.",
        "is leading a rebellion against a tyrannical emperor who rules over a sprawling empire that spans across the deserts of Arabia and Persia.",
        "is exploring the vast jungles of the Congo in search of a rare plant that is said to have miraculous healing properties.",
        "is battling against a fierce dragon that has made its lair on the slopes of Mount Everest in the Himalayas.",
        "is navigating through the treacherous waters of the Pacific Ocean, seeking to uncover the mysteries of a lost underwater city near the coast of Japan.",
        "is trying to broker a peace deal between the feuding clans of Scottish highlanders who have been locked in a bitter conflict for generations.",
        "is traveling through the frozen tundra of Siberia to retrieve a precious gemstone from a hidden mine, located deep within the Ural Mountains.",
        "is investigating a series of bizarre disappearances that have taken place in the dark, foggy streets of Victorian-era London.",
        "is fighting against a horde of demonic creatures that have been unleashed from the underworld and are wreaking havoc across the Spanish countryside.",
        "is on a mission to rescue a kidnapped prince who has been taken hostage by a powerful warlord in the heart of the Mongolian steppes.",
        "is navigating through the dense forests of the Amazon River basin, searching for a rare orchid that is said to bloom only once a century.",
        "is leading a group of adventurers on a perilous journey to the top of Mount Kilimanjaro in Africa, hoping to discover a hidden treasure trove of ancient artifacts.",
        "is battling against a monstrous sea serpent that has been terrorizing the coastlines of Portugal and Spain.",
        "is embarking on a perilous expedition to the Arctic Circle, hoping to uncover the secrets of a lost civilization that thrived in the frozen wasteland.",
        "is infiltrating the inner sanctum of a powerful sorcerer who has been using dark magic to control the minds of the ruling elite in Venice, Italy.",
        "is searching for a fabled city of gold that is said to be hidden deep within the jungles of Central America.",
        "is leading a resistance movement against an invading army of orcs and trolls that have overrun the lands of the Baltic states.",
        "is exploring the ruins of an ancient temple in Egypt, seeking to uncover the secrets of a long-forgotten pharaoh.",
        "is fighting against a powerful necromancer who has raised an army of undead warriors to wage war against the kingdoms of Europe.",
        "is traveling through the deserts of the Middle East to find a legendary oasis that is said to possess magical healing properties.",
        "is attempting to steal a powerful magical artifact from the tower of a mad wizard who has been terrorizing the lands of Eastern Europe.",
        "is leading a team of adventurers on a perilous mission to explore the depths of the Grand Canyon in the United States, hoping to uncover a hidden trove of ancient artifacts.",
        "is trying to unite the feuding tribes of Native Americans on the Great Plains of North America, hoping to create a strong and unified nation.",
        "is battling against a ferocious kraken that has been wreaking havoc across the Atlantic Ocean, sinking ships and causing chaos wherever it goes.",
        "is navigating through the treacherous waters of the Bermuda Triangle, hoping to uncover the secrets of a lost civilization that is said to have vanished without a trace.",
        "is venturing deep into the heart of the Sahara desert to recover an ancient talisman from the ruins of a lost city, hoping to gain the favor of the nomadic Tuareg tribes.",
        "is leading a band of mercenaries across the rugged terrain of the Scottish Highlands to quell a rebellion led by a clan of fierce berserkers.",
        "is racing against time to locate a legendary elven healer in the misty valleys of the Himalayas, hoping to find a cure for a deadly disease that is spreading across the land.",
        "is embarking on a perilous journey through the Amazon rainforest to retrieve a rare plant specimen that is said to have mystical properties, sought after by both healers and warlocks alike.",
        "is navigating through the treacherous waters of the Caribbean Sea as a notorious pirate, hunting for hidden treasures and dodging the Spanish Armada.",
        "is serving as a scout for the Mongol Empire, tasked with infiltrating the city of Constantinople and assessing its defenses before launching an invasion.",
        "is fighting alongside the legendary samurai warriors of Japan, defending their land from an invasion by monstrous oni from the underworld.",
        "is leading a rebellion against the oppressive rule of a tyrannical queen in the lush jungles of Madagascar, inspiring the local tribes to rise up and fight for their freedom.",
        "is on a quest to unravel the mystery of an ancient temple in the Egyptian desert, deciphering the hieroglyphics and uncovering the secrets of the gods.",
        "is working as a spy for the Chinese emperor, gathering intelligence on the imperial court in the forbidden city of Beijing and thwarting foreign infiltrators.",
        "is trying to survive in the harsh wilderness of Siberia, hunted by a pack of fierce werewolves that roam the frozen tundra under the full moon.",
        "is seeking vengeance against a dragon that burned down their village in the rolling hills of the English countryside, wielding a legendary sword passed down through their family for generations.",
        "is protecting a caravan of traders as they journey through the treacherous Himalayan passes, fending off bandits and savage beasts along the way.",
        "is trying to restore the balance of power between the noble houses of Westeros, navigating the treacherous political landscape and fighting in bloody battles.",
        "is leading a band of rebels against the corrupt priesthood that rules over the Aztec empire, fighting to restore the ancient traditions and protect the people from human sacrifice.",
        "is exploring the vast subterranean realm of the dwarves, seeking the lost treasures and ancient relics hidden in their underground cities and tunnels.",
        "is on a mission to track down and capture a notorious monster hunter who has gone rogue, causing chaos and destruction in their wake.",
        "is fighting in the front lines of a massive battle between the armies of heaven and hell, wielding divine weapons and channeling holy powers to protect humanity.",
        "is embarking on a perilous expedition to Antarctica, braving the freezing temperatures and treacherous ice floes in search of a hidden civilization that predates human history.",
        "is leading a rebellion against the vampiric rulers of Romania, rallying the human peasants and werewolf tribes to overthrow their bloodthirsty oppressors.",
        "is on a mission to find the fabled Fountain of Youth in the dense jungles of Central America, hoping to unlock the secret to immortality.",
        "is serving as a squire for a noble knight in medieval England, training in the art of sword fighting and chivalry while striving to prove their worth."
    ];


    if (filename == "deck-manager.html") {

// Method to generate a random NPC
        function generateNPC(name, loadedData) {
            // Select a random sentence from each array
            const character = loadedData.filter(card => card.type === "character")[0].name;
            const training = loadedData.filter(card => card.type === "core training")[0].name;
            const background = loadedData.filter(card => card.type === "background")[0].name;
            const species = loadedData.filter(card => card.type === "species")[0].name;
            const personality = personalities[Math.floor(Math.random() * personalities.length)];
            const story = stories[Math.floor(Math.random() * stories.length)];

            // Combine the sentences into a single string
            // Return the NPC string
            return name + " " + `was a ${species} ${character} that grew up in/as a ${background} before joining the/becoming a ${training}. ${name} ${personality} and ${story}`;        }

        const images = ['001.png', '002.png', '003.png', '004.png', '005.png', '006.png', '007.png', '008.png', '009.png', '010.png', '011.png', '012.png', '013.png', '014.png', '015.png', '016.png', '017.png', '018.png', '019.png', '020.png', '021.png', '022.png', '023.png', '024.png', '025.png', '026.png', '027.png', '028.png', '029.png', '030.png', '031.png', '032.png', '033.png', '034.png', '035.png', '036.png', '037.png', '038.png', '039.png', '040.png', '041.png', '042.png', '043.png', '044.png', '045.png', '046.png', '047.png', '048.png', '049.png', '050.png', '051.png', '052.png', '053.png', '054.png', '055.png', '056.png', '057.png', '058.png', '059.png', '060.png', '061.png', '062.png', '063.png', '064.png', '065.png', '066.png', '067.png', '068.png', '069.png', '070.png', '071.png', '072.png', '073.png', '074.png', '075.png', '076.png', '077.png', '078.png', '079.png', '080.png', '081.png', '082.png', '083.png', '084.png', '085.png', '086.png', '087.png', '088.png', '089.png', '090.png', '091.png', '092.png', '093.png', '094.png', '095.png', '096.png', '097.png', '098.png', '099.png', '100.png', '101.png', '102.png', '103.png', '104.png', '105.png', '106.png', '107.png', '108.png', '109.png', '110.png', '111.png', '112.png', '113.png', '114.png', '115.png', '116.png', '117.png', '118.png', '119.png', '120.png', '121.png', '122.png', '123.png', '124.png', '125.png', '126.png', '127.png', '128.png', '129.png', '130.png', '131.png', '132.png', '133.png', '134.png', '135.png', '136.png', '137.png', '138.png', '139.png', '140.png', '141.png', '142.png', '143.png', '144.png', '145.png', '146.png', '147.png', '148.png', '149.png', '150.png', '151.png', '152.png', '153.png', '154.png', '155.png', '156.png', '157.png', '158.png', '159.png', '160.png', '161.png', '162.png', '163.png', '164.png', '165.png', '166.png', '167.png', '168.png', '169.png', '170.png', '171.png', '172.png', '173.png', '174.png', '175.png', '176.png', '177.png', '178.png', '179.png', '180.png', '181.png', '182.png', '183.png', '184.png', '185.png', '186.png', '187.png', '188.png', '189.png', '190.png', '191.png', '192.png', '193.png', '194.png', '195.png', '196.png', '197.png', '198.png', '199.png', '200.png', '201.png', '202.png', '203.png', '204.png', '205.png', '206.png', '207.png', '208.png', '209.png', '210.png', '211.png', '212.png', '213.png', '214.png', '215.png', '216.png', '217.png', '218.png', '219.png', '220.png', '221.png', '222.png', '223.png', '224.png', '225.png', '226.png', '227.png', '228.png', '229.png', '230.png', '231.png', '232.png', '233.png', '234.png', '235.png', '236.png', '237.png', '238.png', '239.png', '240.png', '241.png', '242.png', '243.png', '244.png', '245.png', '246.png', '247.png', '248.png', '249.png', '250.png', '251.png', '252.png', '253.png', '254.png', '255.png', '256.png', '257.png', '258.png', '259.png', '260.png', '261.png', '262.png', '263.png', '264.png', '265.png', '266.png', '267.png', '268.png', '269.png', '270.png', '271.png', '272.png', '273.png', '274.png', '275.png', '276.png', '277.png', '278.png', '279.png', '280.png', '281.png', '282.png', '283.png', '284.png', '285.png', '286.png', '287.png', '288.png', '289.png', '290.png', '291.png', '292.png', '293.png', '294.png', '295.png', '296.png', '297.png', '298.png', '299.png', '300.png', '301.png', '302.png', '303.png', '304.png', '305.png', '306.png', '307.png', '308.png', '309.png', '310.png', '311.png', '312.png', '313.png', '314.png', '315.png', '316.png', '317.png', '318.png', '319.png', '320.png', '321.png', '322.png', '323.png', '324.png', '325.png', '326.png', '327.png', '328.png', '329.png', '330.png', '331.png', '332.png', '333.png', '334.png', '335.png', '336.png', '337.png', '338.png', '339.png', '340.png', '341.png', '342.png', '343.png', '344.png', '345.png', '346.png', '347.png', '348.png', '349.png', '350.png', '351.png', '352.png', '353.png', '354.png', '355.png', '356.png', '357.png', '358.png', '359.png', '360.png', '361.png', '362.png', '363.png', '364.png', '365.png', '366.png', '367.png', '368.png', '369.png', '370.png', '371.png', '372.png', '373.png', '374.png', '375.png', '376.png', '377.png', '378.png', '379.png', '380.png', '381.png', '382.png', '383.png', '384.png', '385.png', '386.png', '387.png', '388.png', '389.png', '390.png', '391.png', '392.png', '393.png', '394.png', '395.png', '396.png', '397.png', '398.png', '399.png', '400.png', '401.png', '402.png', '403.png', '404.png', '405.png', '406.png', '407.png', '408.png', '409.png', '410.png', '411.png', '412.png', '413.png', '414.png', '415.png', '416.png', '417.png', '418.png', '419.png', '420.png', '421.png', '422.png', '423.png', '424.png', '425.png', '426.png', '427.png', '428.png', '429.png', '430.png', '431.png', '432.png', '433.png', '434.png', '435.png', '436.png', '437.png', '438.png', '439.png', '440.png', '441.png', '442.png', '443.png', '444.png', '445.png', '446.png', '447.png', '448.png', '449.png', '450.png', '451.png', '452.png', '453.png', '454.png', '455.png', '456.png', '457.png', '458.png', '459.png', '460.png', '461.png', '462.png', '463.png', '464.png', '465.png', '466.png', '467.png', '468.png', '469.png', '470.png', '471.png', '472.png', '473.png', '474.png', '475.png', '476.png', '477.png', '478.png', '479.png', '480.png', '481.png', '482.png', '483.png', '484.png', '485.png', '486.png', '487.png', '488.png', '489.png', '490.png', '491.png', '492.png', '493.png', '494.png', '495.png', '496.png', '497.png', '498.png', '499.png', '500.png', '501.png', '502.png', '503.png', '504.png', '505.png', '506.png', '507.png', '508.png', '509.png', '510.png', '511.png', '512.png', '513.png', '514.png', '515.png', '516.png', '517.png', '518.png', '519.png', '520.png', '521.png', '522.png', '523.png', '524.png', '525.png', '526.png', '527.png', '528.png', '529.png', '530.png', '531.png', '532.png', '533.png', '534.png', '535.png', '536.png', '537.png', '538.png', '539.png', '540.png', '541.png', '542.png', '543.png', '544.png', '545.png', '546.png', '547.png', '548.png', '549.png', '550.png', '551.png', '552.png', '553.png', '554.png', '555.png', '556.png', '557.png', '558.png', '559.png', '560.png', '561.png', '562.png', '563.png', '564.png', '565.png', '566.png', '567.png', '568.png', '569.png', '570.png', '571.png', '572.png', '573.png', '574.png', '575.png', '576.png', '577.png', '578.png', '579.png', '580.png', '581.png', '582.png', '583.png', '584.png', '585.png', '586.png', '587.png', '588.png', '589.png', '590.png', '591.png', '592.png', '593.png', '594.png', '595.png', '596.png', '597.png', '598.png', '599.png', '600.png', '601.png', '602.png', '603.png', '604.png', '605.png', '606.png', '607.png', '608.png', '609.png', '610.png', '611.png', '612.png', '613.png', '614.png', '615.png', '616.png', '617.png', '618.png', '619.png', '620.png', '621.png', '622.png', '623.png', '624.png', '625.png', '626.png', '627.png', '628.png', '629.png', '630.png', '631.png', '632.png', '633.png', '634.png', '635.png', '636.png', '637.png', '638.png', '639.png', '640.png', '641.png', '642.png', '643.png', '644.png', '645.png', '646.png', '647.png', '648.png', '649.png', '650.png', '651.png', '652.png', '653.png', '654.png', '655.png', '656.png', '657.png', '658.png', '659.png', '660.png', '661.png', '662.png', '663.png', '664.png', '665.png', '666.png', '667.png', '668.png', '669.png', '670.png', '671.png', '672.png', '673.png', '674.png', '675.png', '676.png', '677.png', '678.png', '679.png', '680.png', '681.png', '682.png', '683.png', '684.png', '685.png', '686.png', '687.png', '688.png', '689.png', '690.png', '691.png', '692.png', '693.png', '694.png', '695.png', '696.png', '697.png', '698.png', '699.png', '700.png', '701.png', '702.png', '703.png', '704.png', '705.png', '706.png', '707.png', '708.png', '709.png', '710.png', '711.png', '712.png', '713.png', '714.png', '715.png', '716.png', '717.png', '718.png', '719.png', '720.png', '721.png', '722.png', '723.png', '724.png', '725.png', '726.png', '727.png', '728.png', '729.png', '730.png', '731.png', '732.png', '733.png', '734.png', '735.png', '736.png', '737.png', '738.png', '739.png', '740.png', '741.png', '742.png', '743.png', '744.png', '745.png', '746.png', '747.png', '748.png', '749.png', '750.png', '751.png', '752.png', '753.png', '754.png', '755.png', '756.png', '757.png', '758.png', '759.png', '760.png', '761.png', '762.png', '763.png', '764.png', '765.png', '766.png', '767.png', '768.png', '769.png', '770.png', '771.png', '772.png', '773.png', '774.png', '775.png', '776.png', '777.png', '778.png', '779.png', '780.png', '781.png', '782.png', '783.png', '784.png', '785.png', '786.png', '787.png', '788.png', '789.png', '790.png', '791.png', '792.png', '793.png', '794.png', '795.png', '796.png', '797.png', '798.png', '799.png', '800.png', '801.png', '802.png', '803.png', '804.png', '805.png', '806.png', '807.png', '808.png', '809.png', '810.png', '811.png', '812.png', '813.png', '814.png', '815.png', '816.png', '817.png', '818.png', '819.png', '820.png', '821.png', '822.png', '823.png', '824.png', '825.png', '826.png', '827.png', '828.png', '829.png', '830.png', '831.png', '832.png', '833.png', '834.png', '835.png', '836.png', '837.png', '838.png', '839.png', '840.png', '841.png', '842.png', '843.png', '844.png', '845.png', '846.png', '847.png', '848.png', '849.png', '850.png', '851.png', '852.png', '853.png', '854.png', '855.png', '856.png', '857.png', '858.png', '859.png', '860.png', '861.png', '862.png', '863.png', '864.png', '865.png', '866.png', '867.png', '868.png', '869.png', '870.png', '871.png', '872.png', '873.png', '874.png', '875.png', '876.png', '877.png', '878.png', '879.png', '880.png', '881.png', '882.png', '883.png', '884.png', '885.png', '886.png', '887.png', '888.png', '889.png', '890.png', '891.png', '892.png', '893.png', '894.png', '895.png', '896.png', '897.png', '898.png', '899.png', '900.png', '901.png', '902.png', '903.png', '904.png', '905.png', '906.png', '907.png', '908.png', '909.png', '910.png', '911.png', '912.png', '913.png', '914.png', '915.png', '916.png', '917.png', '918.png', '919.png', '920.png', '921.png', '922.png', '923.png', '924.png', '925.png', '926.png', '927.png', '928.png', '929.png', '930.png', '931.png', '932.png', '933.png', '934.png', '935.png', '936.png', '937.png', '938.png', '939.png', '940.png', '941.png', '942.png', '943.png', '944.png', '945.png', '946.png', '947.png', '948.png', '949.png', '950.png', '951.png', '952.png', '953.png', '954.png', '955.png', '956.png', '957.png', '958.png', '959.png', '960.png', '961.png', '962.png', '963.png', '964.png', '965.png', '966.png', '967.png', '968.png', '969.png', '970.png', '971.png', '972.png', '973.png', '974.png', '975.png', '976.png', '977.png', '978.png', '979.png', '980.png', '981.png', '982.png', '983.png', '984.png', '985.png', '986.png', '987.png', '988.png', '989.png', '990.png', '991.png', '992.png', '993.png', '994.png', '995.png', '996.png', '997.png', '998.png', '999.png', '1000.png', '1001.png', '1002.png', '1003.png', '1004.png', '1005.png', '1006.png', '1007.png', '1008.png', '1009.png', '1010.png', '1011.png', '1012.png', '1013.png', '1014.png', '1015.png', '1016.png', '1017.png', '1018.png', '1019.png', '1020.png', '1021.png', '1022.png', '1023.png', '1024.png', '1025.png', '1026.png', '1027.png', '1028.png', '1029.png', '1030.png', '1031.png', '1032.png', '1033.png', '1034.png', '1035.png', '1036.png', '1037.png', '1038.png', '1039.png', '1040.png', '1041.png', '1042.png', '1043.png', '1044.png', '1045.png', '1046.png', '1047.png', '1048.png', '1049.png', '1050.png', '1051.png', '1052.png', '1053.png', '1054.png', '1055.png', '1056.png', '1057.png', '1058.png', '1059.png', '1060.png', '1061.png', '1062.png', '1063.png', '1064.png', '1065.png', '1066.png', '1067.png', '1068.png', '1069.png', '1070.png', '1071.png', '1072.png', '1073.png', '1074.png', '1075.png', '1076.png', '1077.png', '1078.png', '1079.png', '1080.png', '1081.png', '1082.png', '1083.png', '1084.png', '1085.png', '1086.png', '1087.png', '1088.png', '1089.png', '1090.png', '1091.png', '1092.png', '1093.png', '1094.png', '1095.png', '1096.png', '1097.png', '1098.png', '1099.png', '1100.png', '1101.png', '1102.png', '1103.png', '1104.png', '1105.png', '1106.png', '1107.png', '1108.png', '1109.png', '1110.png', '1111.png', '1112.png', '1113.png', '1114.png', '1115.png', '1116.png', '1117.png', '1118.png', '1119.png', '1120.png', '1121.png', '1122.png', '1123.png', '1124.png', '1125.png', '1126.png', '1127.png', '1128.png']; // List of available images
        const colorButtons = document.querySelectorAll(".color-button");

        colorButtons.forEach((button) => {
            button.addEventListener("click", async () => {
                loadedData["deck_name"] = generateFantasyName();
                console.log(loadedData["deck_name"]);

                const color = button.dataset.color;
                const randomIndex = Math.floor(Math.random() * images.length); // Generate a random index
                // Get the corresponding image URL
              

                const randomCards = await generateCharacter(color);

                loadedData["deck_image"] = `/images/Face NPC Portraits/${images[randomIndex]}`;
                loadedData["deck_description"] = generateNPC(loadedData["deck_name"], randomCards);

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
    const trainings = data.filter(card => card.type && card.type === "training");
    const coreTrainings = filterCardsByColor(data.filter(card => card.type && card.type.includes("core training")));
    const backgrounds = data.filter(card => card.type && card.type.includes("background"));
    const species = data.filter(card => card.type && card.type.includes("species"));
    const destinies = data.filter(card => card.type && card.type.includes("destiny"));
    const items = data.filter(card => card.type && card.type.includes("item") && !card.type.includes("uncommon") && !card.type.includes("rare") && !card.type.includes("mythic"));
    const weapons = data.filter(card => card.type && card.type.includes("weapon") && !card.type.includes("uncommon") && !card.type.includes("rare") && !card.type.includes("mythic"));

    const getRandomCards = (cards, count) => {
        const randomCards = [];

        if (cards.length < count) {
            count = cards.length;
        }

        while (randomCards.length < count) {

            const randomIndex = Math.floor(Math.random() * cards.length);
            const card = cards[randomIndex];

            if (!randomCards.includes(card)) {
                randomCards.push(card);
            }
        }

        return randomCards;
    };

if (color === ''){
    return [
        ...getRandomCards(characters, 1),
        ...getRandomCards(coreTrainings, 1),
        ...getRandomCards(trainings, 4),
        ...getRandomCards(features, 4),
        ...getRandomCards(backgrounds, 1),
        ...getRandomCards(species, 1),
        ...getRandomCards(destinies, 1),
        ...getRandomCards(items, 4),
        ...getRandomCards(weapons, 1)

    ];
} else {
    return [
        ...getRandomCards(characters, 1),
        ...getRandomCards(coreTrainings, 1),
        ...getRandomCards(trainings, 1),
        ...getRandomCards(features, 2),
        ...getRandomCards(backgrounds, 1),
        ...getRandomCards(species, 1),
        ...getRandomCards(destinies, 1),
        ...getRandomCards(items, 4),
        ...getRandomCards(weapons, 1)

    ];
}
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
    const syllables = ['thor', 'lar', 'mir', 'gorn', 'en', 'eth', 'li', 'on', 'riel', 'cal', 'dor', 'mor', 'ian', 'rim', 'ar', 'syl', 'mund', 'val', 'den', 'gar', 'ris', 'fro', 'mar', 'dur', 'ver', 'ka', 'ter', 'na', 'sha', 'dal', 'kar', 'arv', 'ran', 'cel', 'gil', 'wen', 'fel', 'ran', 'gal', 'bal', 'las', 'vir', 'thor', 'end', 'ar', 'fel', 'nal', 'mir', 'thi', 'jor', 'kil', 'thor', 'fa', 'rad', 'nor', 'iel', 'eld', 'hel', 'ron', 'ras', 'tal', 'or', 'mir', 'fur', 'van', 'had', 'kri', 'fer', 'wal', 'kyl', 'cor', 'kam', 'and', 'mel', 'san', 'tir', 'vor', 'sis', 'tol', 'rin', 'hil', 'dil', 'fyr', 'nir', 'til', 'gil', 'zor', 'kru', 'bor', 'mos', 'fel', 'yel', 'ral', 'dor', 'fyr', 'zer', 'vyn', 'kin', 'gar', 'sal', 'myr', 'nar', 'ynd', 'mol', 'ryl', 'vak', 'zal', 'mis', 'zir', 'ryn', 'lyr', 'rav', 'nav', 'mol', 'fyx', 'zir', 'tul', 'lur', 'sul', 'dar', 'dyl', 'ver', 'fiz', 'lym', 'vyr', 'dil', 'rym', 'mil', 'cyl', 'mor', 'tyr', 'fyn', 'rak', 'val', 'cyn', 'don', 'lyd', 'syr', 'vol', 'tym', 'zon', 'ryk', 'dyn', 'rol', 'syl', 'dor', 'kim', 'fyn', 'pal', 'byl', 'ral', 'lud', 'tur', 'fim', 'lor', 'syr', 'fol', 'dun', 'zyl', 'rym', 'byr', 'tir', 'pon', 'vyl', 'gol', 'ryx', 'jyl', 'sir', 'ryd', 'dul', 'zyr', 'lyn', 'dor', 'tyl', 'thul', 'vur', 'zol', 'nyr', 'pyr', 'lyl', 'fur', 'vax', 'wyn', 'tho', 'gol', 'kyl', 'sor', 'dyn', 'vyx', 'rum', 'fyl', 'pyn', 'wyn', 'ful', 'vul', 'dym', 'lax', 'dor', 'gyr', 'kyl', 'lyd', 'gyr', 'tyn', 'bor', 'zur', 'gyr', 'cyn', 'myl', 'byr', 'vyd', 'ryn', 'lir', 'tul'];
    const nicknames = [
        "the Brave",
        "the Wise",
        "the Dark",
        "the Bold",
        "the Swift",
        "the Strong",
        "the Mighty",
        "the Valiant",
        "the Fierce",
        "the Fearless",
        "the Noble",
        "the Righteous",
        "the Just",
        "the Merciless",
        "the Cursed",
        "the Blessed",
        "the Radiant",
        "the Grim",
        "the Enchanted",
        "the Wandering",
        "the Wanderer",
        "the Lost",
        "the Seeker",
        "the Keeper",
        "the Protector",
        "the Hunter",
        "the Huntress",
        "the Shadow",
        "the Phantom",
        "the Ghost",
        "the Specter",
        "the Revenant",
        "the Necromancer",
        "the Warlock",
        "the Sorcerer",
        "the Wizard",
        "the Magician",
        "the Enchanter",
        "the Alchemist",
        "the Summoner",
        "the Druid",
        "the Shaman",
        "the Priest",
        "the Cleric",
        "the Paladin",
        "the Crusader",
        "the Knight",
        "the Gladiator",
        "the Barbarian",
        "the Rogue",
        "the Thief",
        "the Assassin",
        "the Swashbuckler",
        "the Musketeer",
        "the Duelist",
        "the Pirate",
        "the Privateer",
        "the Admiral",
        "the Captain",
        "the Navigator",
        "the Explorer",
        "the Adventurer",
        "the Hero",
        "the Legend",
        "the Myth",
        "the Immortal",
        "the Eternal",
        "the Phoenix",
        "the Dragon",
        "the Serpent",
        "the Griffin",
        "the Chimera",
        "the Gorgon",
        "the Hydra",
        "the Leviathan",
        "the Kraken",
        "the Behemoth",
        "the Colossus",
        "the Titan",
        "the Giant",
        "the Cyclops",
        "the Ogre",
        "the Troll",
        "the Minotaur",
        "the Harpy",
        "the Siren",
        "the Nymph",
        "the Dryad",
        "the Faerie",
        "the Sprite",
        "the Angel",
        "the Demon",
        "the Devil",
        "the Vampire",
        "the Werewolf",
        "the Lycanthrope",
        "the Zombie",
        "the Skeleton",
        "the Spectral",
        "the Phantom",
        "the Poltergeist",
        "the Wraith",
        "the Shade",
        "the Banshee",
        "the Haunt",
        "the Possessed",
        "the Cursed",
        "the Mad",
        "the Insane",
        "the Genius",
        "the Visionary",
        "the Artist",
        "the Poet",
        "the Musician",
        "the Dancer",
        "the Acrobat",
        "the Athlete",
        "the Scholar",
        "the Teacher",
        "the Student",
        "the Philosopher",
        "the Scientist",
        "the Inventor",
        "the Engineer",
        "the Architect",
        "the Designer",
        "the Crafter",
        "the Builder",
        "the Farmer",
        "the Gardener",
        "the Chef",
        "the Baker",
        "the Brewer",
        "the Vintner"];
    const numSyllables = Math.floor(Math.random() * 5) + 1; // Generates a random number of syllables between 3 and 5
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

  // Render the sidebar using Mustache.js
  const template = document.getElementById("sidebar-template").innerHTML;
  const json = await fetch("HoH_all.json");
  var allCards = await json.json();
  console.log(allCards)
  const renderedHTML = mustache.render(template, allCards["deck_list"]);

  // Add the rendered HTML to the page
  const sidebarContainer = document.getElementById("sidebar-container");
  sidebarContainer.innerHTML = renderedHTML;
