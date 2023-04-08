import mustache from "https://cdn.skypack.dev/mustache@4.2.0";
import html2canvas from "https://cdn.skypack.dev/html2canvas";
import $ from 'https://cdn.skypack.dev/jquery'


let data = null; // store the JSON data

// Initialize variables
var selectedCards = 0;
var requiredCrystals = {};
var providedCrystals = {};

// Add event listener to each card element to toggle selection
var cardElements = document.querySelectorAll(".card-container");
cardElements.forEach(function (cardElement) {
    cardElement.addEventListener("click", function () {
        this.classList.toggle("selected");


    });
});

function renderCards(jsonData) {
    for (var card in jsonData) {
        var cardTemplate = document.querySelector("#card-template").innerHTML;
        var renderedCard = mustache.render(cardTemplate, jsonData[card]);
        var cardElement = document.createElement("div");
        cardElement.classList.add("card-container");
        cardElement.innerHTML = renderedCard;
        cardElement.setAttribute("data-json", JSON.stringify(jsonData[card])); // Set the data-json attribute
        cardElement.addEventListener("click", function () {


            if (selectedCards === 0) {
                requiredCrystals = {};
                providedCrystals = {};
            }


            this.classList.toggle("selected");
            // Update selectedCards variable and show/hide save deck button
            selectedCards = document.querySelectorAll(".card-container.selected").length;
            if (selectedCards > 0) {
                document.querySelector("#save-deck-button").style.display = "block";
            } else {
                document.querySelector("#save-deck-button").style.display = "none";
            }

            // Update required and provided crystals variables
            if (this.classList.contains("selected")) {
                var cardData = JSON.parse(this.getAttribute("data-json"));
                var required = cardData.crystals.requires
                var provided = cardData.crystals.provides
                console.log("adding crystlals" + required + provided)

                Object.keys(required).forEach(function (color) {
                    requiredCrystals[color] = (requiredCrystals[color] || 0) + required[color];
                });
                Object.keys(provided).forEach(function (color) {
                    providedCrystals[color] = (providedCrystals[color] || 0) + provided[color];
                });
            } else {
                // Remove required and provided crystals of deselected card
                var cardData = JSON.parse(this.getAttribute("data-json"));
                var required = cardData.crystals.requires;
                var provided = cardData.crystals.provides;
                Object.keys(required).forEach(function(color) {
                    requiredCrystals[color] -= required[color];
                    if (requiredCrystals[color] <= 0) {
                        delete requiredCrystals[color];
                    }
                });
            }

            // Update deck status text
            var deckStatusText = "Deck not ready";
            if (selectedCards > 0) {
                var requiredCrystalsText = Object.keys(requiredCrystals).map(function (color) {
                    return requiredCrystals[color];
                }).join(", ");
                var providedCrystalsText = Object.keys(providedCrystals).map(function (color) {
                    return providedCrystals[color];
                }).join(", ");
                if (JSON.stringify(requiredCrystals) === JSON.stringify(providedCrystals)) {
                    deckStatusText = "Deck ready";
                } else {
                    deckStatusText = "Deck not ready, Required Crystals:" + requiredCrystalsText + ", Provided Crystals:" + providedCrystalsText + ".";
                }
            }
            document.querySelector("#deck-status").textContent = deckStatusText;
            document.querySelector("#selected-count").textContent = selectedCards;

        });
        document.querySelector("#card-grid").appendChild(cardElement);
    }
}

document.querySelector("#save-deck-button").addEventListener("click", function () {
    var selectedCards = document.querySelectorAll(".selected");
    var deckData = [];
    for (var i = 0; i < selectedCards.length; i++) {
        var cardData = JSON.parse(selectedCards[i].getAttribute("data-json"));
        deckData.push(cardData);
    }
    var deckJson = JSON.stringify(deckData);
    var blob = new Blob([deckJson], {type: "application/json"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.download = "deck.json";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.getElementById("btn-Convert-Html2Image").addEventListener("click", function () {

    //your critical access to ressources !
    //rules = document.styleSheets[i].cssRules;
    var cards = document.getElementsByClassName("card");
    document.getElementById("pagination").innerHTML += "<p><h3>Generated JPGs:</h3></p>";
    document.getElementById("pagination").innerHTML += "<p><button>Download All</button></p>";
    burgerMenu.classList.toggle("close");
    overlay.classList.toggle("overlay");

    for (var card in cards) {
        document.querySelector("#previewImg").innerHTML = "";

        const name = document.getElementsByClassName("title")[0].innerHTML;
        html2canvas(cards[card], {allowTaint: true, logging: true, taintTest: false}).then(function (canvas) {
            var anchorTag = document.createElement("a");
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
        })
    }
});

var burgerMenu = document.getElementById('burger-menu');
var overlay = document.getElementById('menu');

burgerMenu.addEventListener('click', function () {
    overlay.classList.toggle("overlay");
});

overlay.addEventListener('click', function () {
    overlay.classList.remove("overlay");
});

const filterData = async (filter, currentPage = 1) => {
    let input, values, filtered;
    input = document.getElementById("my-input");

    var data = await fetch('HoH_all.json');
    values = Object.values(await data.json()); // get an array of the values of the JSON object
    filtered = values.filter(value => { // filter the values by the input value
        let valueString;
        valueString = JSON.stringify(value); // convert the value to a string
        var words = filter.split(","); // split the input value by commas
        var match = true; // flag to indicate if the value matches all words
        words.forEach(word => { // loop through each word
            if (!valueString.toLowerCase().includes(word.trim())) { // check if the value string contains the word
                match = false; // if not, set match to false
            }
        });
        return match; // return true if match is true, false otherwise
    });

    const itemsPerPage = 20;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedResults = filtered.slice(start, end);

    document.querySelector("#card-grid").innerHTML = "";
    renderCards(paginatedResults); // render only the filtered values

    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const nextPageButton = document.createElement('button');
    nextPageButton.innerText = 'Next Page';
    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            filterData(filter, currentPage);
        }
    });

    const previousPageButton = document.createElement('button');
    previousPageButton.innerText = 'Previous Page';
    previousPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            filterData(filter, currentPage);
        }
    });

    const pageButtonsContainer = document.createElement('div');
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        if (i === currentPage) {
            pageButton.disabled = true;
        } else {
            pageButton.addEventListener('click', () => {
                filterData(filter, i);
            });
        }
        pageButtonsContainer.appendChild(pageButton);
    }

    document.querySelector("#pagination").innerHTML = "";
    document.querySelector("#pagination").appendChild(previousPageButton);
    document.querySelector("#pagination").appendChild(pageButtonsContainer);
    document.querySelector("#pagination").appendChild(nextPageButton);
};

// Call the loadData function to start loading the data
filterData("").then(r => console.log("opopo"));

const myInput = document.getElementById('my-input');
myInput.addEventListener('keyup', async function () {
    await filterData(this.value.toLowerCase());
});

window.addEventListener('load', async function () {
    const filter = myInput.value.toLowerCase();
    if (filter !== "") {
        await filterData(filter);
    }
});