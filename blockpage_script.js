const blockedURL = document.getElementById("blocked-url")

chrome.history.search({maxResults: 2, text: ""}, (historyItem) => {
    blockedURL.innerText = "Blocked " + historyItem[1].url;
})
