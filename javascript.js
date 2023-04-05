import mustache from "https://cdn.skypack.dev/mustache@4.2.0";


var data = await fetch("HoH_creatures.json");
var jsonData = await data.json();

for (var card in jsonData) {

// Use an if statement to check the type value and render the appropriate card
    if (jsonData[card].type === "character") {
        var cardTemplate = document.querySelector("#character-card-template").innerHTML;
    } else if (jsonData[card].type.includes("item")) {
        var cardTemplate = document.querySelector("#item-card-template").innerHTML;
    } else if (jsonData[card].type === "feature") {
        var cardTemplate = document.querySelector("#feature-card-template").innerHTML;
    } else if (jsonData[card].type === "npc") { //npc with unique names and personalities, it can be 'linked' to a unnamed_actor card.
        var cardTemplate = document.querySelector("#npc-card-template").innerHTML;
    } else if (jsonData[card].type.includes("creature")) { //generic monsters,enemies and animals  like 'bandit' or 'horse' or 'red dragon'
        var cardTemplate = document.querySelector("#creature-card-template").innerHTML;
    } else if (jsonData[card].type === "rule") {
        var cardTemplate = document.querySelector("#rule-card-template").innerHTML;
    }

// Use a template engine like Mustache.js to render the JSON data into the card template
    var renderedCard = mustache.render(cardTemplate, jsonData[card]);
    document.querySelector("#card-grid").innerHTML += renderedCard;
}
