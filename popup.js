document.getElementById('scrape').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['mainCode.js']
    }, (results) => {
        console.log(results);
        console.log("shit");
        if (chrome.runtime.lastError) {
            console.error(`Script injection failed: ${chrome.runtime.lastError.message}`);
        } else {
            console.log('Script injected successfully.', results);
        }
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === "FROM_PAGE") {
      console.log(message.payload);
      // You can now use this data to update your popup's DOM, for example:
    //   document.getElementById("productInfo").innerHTML = message.payload;

    let productsContainer = document.getElementById('body-container');
    message.payload.forEach(product => {
        console.log(product);
        const productCard = document.createElement('a');
        productCard.href = "#";
        productCard.innerHTML = `
            <div class="card-body">
                <div class="row align-items-start">
                    <div class="col-5 text-truncate">
                        <h6 class="card-title">${product[0]}</h6>
                    </div>
                    <div class="col">
                        <p class="card-text text-center">${product[1]}</p>
                    </div>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
  
      // Optionally, send a response back to the content script
    //   sendResponse({status: "Data received by popup"});
    }
    return true; // Indicates you intend to send a response asynchronously (important if sendResponse will be called after the listener returns).
});