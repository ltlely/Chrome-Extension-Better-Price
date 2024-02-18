// import puppeteer from "puppeteer";
// Example of extracting the product title
// Select all product elements in the search results
// Note: The class name ".s-result-item" is an example; Amazon's actual class names will differ and need to be updated based on the current page structure

// You can extend this script to extract more data as needed
//tester variables
// var myvariable = "Hello World !!!!!!";
// var arr = ["milk", "sugar", "water"];

var densities = new Map([
     //densities measured in g/mL
     ["milk", 1.03],
     ["sugar", 0.961],
     ["water", 1],
     ["vaseline", 0.8225],
     ["lotion", 0.9],
     ["rice", 1.286],
     ["flour", 0.66],
     ["petroleum_jelly", 0.8425]

 ]);

//this needs to be filled up via web scraping...
//material, whole price, unit price, unit price unit
var inputs = [];

//output text
var text = "";
//iterator for for loops
var i;
var outputMap = new Map();
var materials;
var prices;
var unitPrices;
var unitType = "mass";

function switchUnitType() {
    if (unitType.localeCompare("volume")) {
        unitType = "mass";
    }
    else if (unitType.localeCompare("mass")) {
        unitType = "volume";
    }
}

function removePunctuation(text) {
    return text.replace(/[^\w\s]|_/g, '');
}

function addNewMaterial(material, p, up, u) {
    inputs.push(new Array(material, p, up, u))
}

function getFromInput(inputType) {
    let outputArr = new Array();
    let index = 0;
    
    switch (inputType) {
        case "materials":
            index = 0;
            break;
        case "whole prices":
            index = 1;
            break;
        case "unit prices":
            index = 2;
            break;
        case "unit price units":
            index = 3;
            break;
    }
    
    for(i = 0; i < inputs.length; i++) {
        outputArr.push(inputs[i][index]);
    }
    return outputArr;
}

function getMaterialsFromInputs(inputs) {
    let outputArr = new Array();
    for(i = 0; i < inputs.length; i++) {
        outputArr.push(inputs[i][0]);
    }
    return outputArr;
}

function getUnitPricesFromInputs(inputs) {
    let outputArr = new Array();
    for(i = 0; i < inputs.length; i++) {
        outputArr.push(inputs[i][1]);
    }
    return outputArr;
}
function getPricesFromInputs(inputs) {
    let outputArr = new Array();
    for(i = 0; i < inputs.length; i++) {
        outputArr.push(inputs[i][2]);
    }
    return outputArr;
}

//old function, used for initial testing, useless now
function buildOutputString() {
    for (i = 0; i < arr.length; i++) {
        text += "the density of 20 oz of " + arr[i] + ": " + ozToFloz(20, densities.get(arr[i])).toString() + "<br>"
        //searchForDensity(arr[i])
    }
}

//conversion functions, (x1.0432 to convert g/mL to oz/fl oz)
function ozToFloz(mass, density) {
    return mass / (density * 1.0432);
}
function flozToOz(volume, density) {
    return volume * 1.0432 * density;
}

//get mass/volume function
function getInitUnit(wholePrice, unitPrice) {
    return wholePrice / unitPrice;
}

function calcUnitPrice(wholeCost, unit) {
    return wholeCost / unit;
}

function searchForDensity(material) {
    //Solution 1: search the web for densities
    //google what the density of a certain material is
    //window.open('https://www.google.com/search?q=' + "what is the density of " + material);

    //Solution 2: access map of common material densities
    //problem: inputs from amazon aren't gonna match up exactly to the keys in the densities map, so heavy string manipulation is required.
    
    let words = material.split(" ")

    let j = 0;
    for (j = 0; j < words.length; j++) {
        let word = removePunctuation(words[j]).toLowerCase();
        console.log(word);
        if (densities.has(word)) {
            return densities.get(word);
        }
    }
    return 10000000;
    //if no words in the search are in densities map, then return error value
}

/**
 * @param type specifies if the unit prices should be by volume or by weight
 * @param 
 * @return a Map containing (item : unit price)
 */
function createUnitPriceMap(type, materials, prices, unitPrices, unitPriceUnits) {
    var unitPrice;
    //outputMap is what we should be filling up and returning
    for (i = 0; i < materials.length; i++) {
        let wholePrice = removePunctuation(prices[i]) / 100;
        let initUnitPrice = removePunctuation(unitPrices[i]) / 100;
        let unitPriceUnit = removePunctuation(unitPriceUnits[i]);
        let initUnit = getInitUnit(wholePrice, initUnitPrice);
        let itemDensity = searchForDensity(materials[i]);
        if (type.localeCompare("mass") == 0) {
            //if unit price is already in terms of volume, don't change it
            if (removePunctuation(unitPriceUnits[i]).toLowerCase().localeCompare("fl oz")) {
                unitPrice = unitPrices[i];
            }
            else {
                unitPrice = calcUnitPrice(wholePrice, flozToOz(initUnit, itemDensity))
                unitPrice = Math.round(unitPrice * 100) / 100.0;
                unitPrice = "$" + unitPrice;
            }
        }
        else if (type.localeCompare("volume") == 0) {
            //if unit price is already in terms of mass, don't change it ???????
            if (removePunctuation(unitPriceUnits[i]).toLowerCase().localeCompare("ounce")) {
                unitPrice = unitPrices[i];
            }
            else {
                //unitPrice = calcUnitPrice(removePunctuation(prices[i]) / 100, ozToFloz(getInitUnit(removePunctuation(prices[i]), removePunctuation(unitPrices[i]))));
                unitPrice = calcUnitPrice(wholePrice, ozToFloz(initUnit, itemDensity))
                unitPrice = Math.round(unitPrice * 100) / 100.0
                unitPrice = "$" + unitPrice;
            }
        }
        
        //add it to the outputMap        
        
        if (unitPrice < 0) {
            unitPrice = "UNKNOWN";
        }

        if (type.localeCompare("volume") == 0) {
            outputMap.set(materials[i], unitPrice.toString() + "/Fl Oz");
        }
        else if (type.localeCompare("mass") == 0) {
            outputMap.set(materials[i], unitPrice.toString() + "/Ounce");
        }
                
    }
}

function mapToString(map, type) {
    let outputString = ""
    for (let [key, value] of map) {
        outputString += "The unit price of " + key + " is ";
        if (value < 0) {
            outputString += "UNKNOWN"
        }
        else {
            outputString += "$" + Math.round(value * 100) / 100; //lol using round() because idk how to do string formatting
            //outputString += "$" + (value).toFixed(2);
        }
        if (type.localeCompare("volume") == 0) {
            outputString += "/fl Oz";
        }
        else if (type.localeCompare("mass") == 0) {
            outputString += "/Ounce";
        }
        outputString += "<br>"
        
    }
    return outputString;
}

let productElements = document.querySelectorAll('.s-result-item');

// Iterate over each product element to extract information
productElements.forEach((productElement) => {
    // Extract the product title; adjust the selector as needed
    let productTitle = productElement.querySelector('.a-link-normal.a-text-normal')?.textContent.trim();

    let productLinkElement = productElement.querySelector('.a-link-normal.a-text-normal');
    
    let productLink = productLinkElement ? productLinkElement.href : null;

    let price = productElement.querySelector('.a-price .a-offscreen')?.textContent.trim();

    let unitPrice = productElement.querySelector('.a-size-base.a-color-secondary .a-text-price .a-offscreen')?.textContent.trim();

    let unitOfMeasurement = productElement.querySelectorAll('.a-size-base.a-color-secondary')[2]?.childNodes[2]?.data;

    if(unitOfMeasurement){
        unitOfMeasurement.replace("/", "");
    }

    if(productTitle && price && unitPrice && unitOfMeasurement){
        addNewMaterial(productTitle, price, unitPrice, unitOfMeasurement);
    }
});

// //creates output string
createUnitPriceMap(unitType, getFromInput("materials"), getFromInput("whole prices"), getFromInput("unit prices"), getFromInput("unit price units"));
console.log(outputMap);

const sortedOutputMap = new Map([...outputMap.entries()].sort((a, b) => (a[1]).toString().localeCompare(b[1])));
//const sortedOutputMap = outputMap;
const mapAsArray = Array.from(sortedOutputMap.entries());

console.log("hello world");

    // //outputs it into the website thingy
//document.getElementById("productInfo").innerHTML = mapToString(sortedOutputMap, unitType);

    /*
    for (let [key, value] of sortedOutputMap) {
    console.log(key, value);
    }
*/

const data = sortedOutputMap;

chrome.runtime.sendMessage({type: "FROM_PAGE", payload: mapAsArray}, function(response) {
  console.log("Response from popup:", response);
});