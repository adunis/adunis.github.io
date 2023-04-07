import mustache from "https://cdn.skypack.dev/mustache@4.2.0";
import html2ca2nvas from "https://cdn.skypack.dev/html2canvas";
import $ from 'https://cdn.skypack.dev/jquery'

var data = await fetch("HoH_characters.json");
var jsonData = await data.json();

var dataItems = await fetch("HoH_items.json");
var jsonDataItems = await dataItems.json();

var dataFeatures = await fetch("HoH_features.json");
var jsonDataFeatures = await dataFeatures.json();

renderCards(jsonData);

function renderCards(jsonData){

    document.querySelector("#card-grid").innerHTML = "";
    document.querySelector("#previewImg").innerHTML = "";


    for (var card in jsonData) {

// Use an if statement to check the type value and render the appropriate card
  var cardTemplate = document.querySelector("#card-template").innerHTML;

// Use a template engine like Mustache.js to render the JSON data into the card template
        var renderedCard = mustache.render(cardTemplate, jsonData[card]);
        document.querySelector("#card-grid").innerHTML += renderedCard;
    }
}

document.getElementById("btn-Convert-Html2Image").addEventListener("click", function() {

var cards =  document.getElementsByClassName("card");
    document.getElementById("previewImg").innerHTML += "<p><h3>Generated JPGs:</h3></p>";
    document.getElementById("previewImg").innerHTML += "<p><button>Download All</button></p>";
    burgerMenu.classList.toggle("close");
    overlay.classList.toggle("overlay");

    for (var card in cards) {
        const name = document.getElementsByClassName("title")[0].innerHTML;
        html2canvas(
            cards[card], { allowTaint: true, logging:true, taintTest: false}).then(function (canvas) {
            var anchorTag = document.createElement("a");
            document.body.appendChild(anchorTag);
            document.getElementById("previewImg").appendChild(canvas);
            anchorTag.download = name + ".jpg";
            anchorTag.href = canvas.toDataURL();
            anchorTag.target = '_blank';
            anchorTag.click();
        });
    }
});


var burgerMenu = document.getElementById('burger-menu');
var overlay = document.getElementById('menu');
burgerMenu.addEventListener('click',function(){
    burgerMenu.classList.toggle("close");
    overlay.classList.toggle("overlay");
});
document.getElementById("load-features").addEventListener("click", async function () {
        var dataFeatures = await fetch("HoH_features.json");
        var jsonDataFeatures = await dataFeatures.json();
        renderCards(jsonDataFeatures);
        burgerMenu.classList.toggle("close");
        overlay.classList.toggle("overlay");
    });

document.getElementById("load-characters").addEventListener("click", async function () {
    var dataFeatures = await fetch("HoH_characters.json");
    var jsonDataFeatures = await dataFeatures.json();
    renderCards(jsonDataFeatures);
    burgerMenu.classList.toggle("close");
    overlay.classList.toggle("overlay");
});

document.getElementById("load-items").addEventListener("click", async function () {
    var dataFeatures = await fetch("HoH_items.json");
    var jsonDataFeatures = await dataFeatures.json();
    renderCards(jsonDataFeatures);
    burgerMenu.classList.toggle("close");
    overlay.classList.toggle("overlay");
});