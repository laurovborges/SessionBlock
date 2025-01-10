const blockedURL = document.getElementById("blocked-url");
const blockpageMessageText = document.getElementById("blockpage-message-text");
const blockpageEmojiText = document.getElementById("blockpage-emoji-text");
const blockMessageContainer = document.getElementById("block-message-container");

chrome.storage.local.get(["userData"], (result) => {
    if(result.userData.blockPageMessage === "" && result.userData.blockPageEmoji === ""){
        blockMessageContainer.classList.add("hide");
        return;
    }
    blockpageMessageText.innerText = result.userData.blockPageMessage;
    blockpageEmojiText.innerText = result.userData.blockPageEmoji;
})

chrome.history.search({maxResults: 2, text: ""}, (historyItem) => {
    blockedURL.innerText = "Blocked " + historyItem[1].url;
})