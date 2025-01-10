const startButton = document.getElementById("start-button");
const settingsButton = document.getElementById("settings-button");
const allowURLButton = document.getElementById("allow-url-button");
const allowedURLsButton = document.getElementById("allowed-urls-button");
const backToMainButton = document.getElementById("back-to-main-button");
const mainPage = document.getElementById("main-page");
const settingsPage = document.getElementById("settings-page");
const hoursInput = document.getElementById("hours-input");
const minsInput = document.getElementById("mins-input");
const unblocksPerDayInput = document.getElementById("unblocks-per-day-input");
const hoursText = document.getElementById("hours-text");
const minsText = document.getElementById("minutes-text");
const secondsText = document.getElementById("seconds-text");
const remainingUnblocksText = document.getElementById("remaining-unblocks-text");
const totalUnblocksText = document.getElementById("total-unblocks-text");
const allowedURLsModal = document.getElementById("allowed-urls-modal");
const allowedURLsInput = document.getElementById("allowed-urls-input");
const blocklistButton = document.getElementById("blocklist-button");
const blocklistModal = document.getElementById("blocklist-modal");
const blocklistInput = document.getElementById("blocklist-input");
const saveButton = document.getElementById("save-button");
const closeBlocklistButton = document.getElementById("close-blocklist-button");
const closeAllowedURLsButton = document.getElementById("close-allowed-urls-button");
const endEarlyBtn = document.getElementById("end-early-button");
const form = document.querySelector("form");
const blockWebsiteBtn = document.getElementById("block-website-button");
const blockpageMessageBtn = document.getElementById("blockpage-message-button");
const blockpageMessageModal = document.getElementById("blockpage-message-modal");
const blockpageMessageInput = document.getElementById("blockpage-message-input");
const closeBlockpageMessageBtn = document.getElementById("close-blockpage-message-button");
const blockpageEmojiInput = document.getElementById("blockpage-emoji-input");
const currentDate = new Date();
let userData = { // default settings
    seconds: 0,
    minutes: 20,
    hours: 0,
    unblocksPerDay: 5,
    numUnblocksUsed: 0,
    allowedURLs: [],
    blocklist: [],
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    countdownIsRunning: false,
    lastDayOfWeekAccessed: 0,
    blockPageMessage: "Don't get too distracted now...",
    blockPageEmoji: "🤨"
};

chrome.storage.local.get(["userData"], (result) => {
    userData = result.userData ? result.userData : userData;
    updateTextValues();
    updateSelectedDaysOfWeekButtons();
    if(userData.countdownIsRunning){
        disableStartBtn();
        endEarlyBtn.classList.remove("hide");
    }
    else{
        enableStartBtn();
        endEarlyBtn.classList.add("hide");
    }
    checkRemainingUnblocks();
    checkDate();
    checkIfActiveDayOfWeek();
    console.log(userData);
})

chrome.tabs.query({active: true, currentWindow: true}, (tab) => {
    if(tab[0].url.includes("blocked.html")){
        blockWebsiteBtn.classList.add("hide");
        allowURLButton.classList.add("hide");
    }
})

console.log("current day of week", currentDate.getDay());

function disableStartBtn(){
    startButton.classList.remove("out-of-unblocks");
    startButton.classList.add("disabled");
    startButton.disabled = true;
    startButton.innerHTML = "<b>Unblocked</b>";
}

function enableStartBtn(){
    startButton.classList.remove("disabled");
    startButton.classList.remove("out-of-unblocks");
    startButton.classList.remove("inactive");
    startButton.disabled = false;
    startButton.innerHTML = "<b>Unblock</b>";
}

function saveData(){
    chrome.storage.local.set({
        userData: userData
    }, ()=>{
        updateTextValues()
        console.log(userData);
    })
}

function updateTextValues(){
    // Note: a leading zero is added if it's a single digit number
    hoursText.innerText = (userData.hours < 10 ? ('0' + userData.hours) : userData.hours) || '00';
    minsText.innerText = (userData.minutes < 10 ? ('0' + userData.minutes) : userData.minutes) || '00';
    secondsText.innerText = (userData.seconds < 10 ? ('0' + userData.seconds) : userData.seconds) || '00';
    remainingUnblocksText.innerText = userData.unblocksPerDay - userData.numUnblocksUsed < 1 ? 0 : userData.unblocksPerDay - userData.numUnblocksUsed;
    totalUnblocksText.innerText = userData.unblocksPerDay;
    hoursInput.value = userData.hours ? userData.hours : 0;
    minsInput.value = userData.minutes ? userData.minutes : 0;
    blocklistInput.value = userData.blocklist.join("\n");
    allowedURLsInput.value = userData.allowedURLs.join("\n");
    unblocksPerDayInput.value = userData.unblocksPerDay ? userData.unblocksPerDay : 1;
    blockpageMessageInput.value = userData.blockPageMessage ? userData.blockPageMessage : "";
    blockpageEmojiInput.value = userData.blockPageEmoji ? userData.blockPageEmoji : "";
}

// save button
form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveButtonClicked = true;
    userData.seconds = 0;
    userData.minutes = Number(minsInput.value);
    userData.hours = Number(hoursInput.value);
    userData.unblocksPerDay = Number(unblocksPerDayInput.value);
    userData.blocklist = blocklistInput.value.split('\n');
    userData.blockPageMessage = blockpageMessageInput.value;
    userData.blockPageEmoji = blockpageEmojiInput.value;
    for(let i = 0; i < userData.blocklist.length; i++){
        userData.blocklist[i] = userData.blocklist[i].replace(/^https?:\/\//, '')
    }
    userData.allowedURLs = allowedURLsInput.value.split('\n');
    saveData();
    checkIfActiveDayOfWeek();
    checkRemainingUnblocks();
    saveButton.innerText = "Saved!"

    if(userData.countdownIsRunning === false){
        chrome.tabs.query({active: true, currentWindow: true}, (tab) => {
            if(tab[0].url){
                const URLobj = new URL(tab[0].url);
                let parsedURL = URLobj.hostname;
                parsedURL = parsedURL.replace(/^www\./, '')

                if(userData.allowedURLs.includes(tab[0].url)){
                    return;
                }
                else if(userData.blocklist.includes(parsedURL)){
                    chrome.tabs.update(tab[0].id, {url: "blocked.html"});
                }
            }
        })
    }
})

startButton.addEventListener('click', () => {
    startButton.classList.add("disabled");
    startButton.disabled = true;
    startButton.innerHTML = "<b>Unblocked</b>";
    userData.numUnblocksUsed++;
    userData.countdownIsRunning = true;
    saveData();
    endEarlyBtn.classList.remove("hide");
    chrome.runtime.sendMessage({type: 'startCountdown'});
});

chrome.runtime.onMessage.addListener((message) => {
    if(message.type === "update-popup-text"){
        hoursText.innerText = (message.hours < 10 ? ('0' + message.hours) : message.hours) || '00';
        minsText.innerText = (message.minutes < 10 ? ('0' + message.minutes) : message.minutes) || '00';
        secondsText.innerText = (message.seconds < 10 ? ('0' + message.seconds) : message.seconds) || '00';
    }
    else if(message.type === "countdown-ended"){
        enableStartBtn();
        userData.countdownIsRunning = false;
        checkRemainingUnblocks();
        saveData();
        endEarlyBtn.classList.add("hide");
    }
})

function checkRemainingUnblocks() {
    if(userData.countdownIsRunning === false){
        if((userData.unblocksPerDay - userData.numUnblocksUsed) < 1){
            startButton.classList.remove("disabled");
            startButton.classList.add("out-of-unblocks");
            startButton.disabled = true;
            startButton.innerHTML = "<b>Out Of Unblocks!</b>";
        }
    }
}

function checkDate(){
    if(currentDate.getDay() !== userData.lastDayOfWeekAccessed){
        console.log("next day occured");
        chrome.runtime.sendMessage({type: "end-early"}, () => {
            userData.numUnblocksUsed = 0;
            userData.lastDayOfWeekAccessed = currentDate.getDay();
            saveData();
        });
    }
}

function checkIfActiveDayOfWeek(){
    if(userData.daysOfWeek.includes(currentDate.getDay()) === false){
        console.log("inactive on this day");
        startButton.classList.add("inactive");
        startButton.innerHTML = "<b>Inactive today</b>";
    }
}

allowURLButton.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tab) => {
        if(userData.allowedURLs.includes(tab[0].url) === false){
            userData.allowedURLs.push(tab[0].url);
            saveData();
            allowURLButton.innerText = "Current URL now allowed";
            return;
        }
    })
    allowURLButton.innerText = "URL already allowed";
})

blockWebsiteBtn.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tab) => {
        if(userData.blocklist.includes(tab[0].url) === false){
            const URLobj = new URL(tab[0].url);
            let parsedURL = URLobj.hostname;
            parsedURL = parsedURL.replace(/^www\./, '')
            userData.blocklist.push(parsedURL);
            blockWebsiteBtn.innerText = "Website blocked";

            if(userData.countdownIsRunning === false){
                chrome.tabs.update(tab[0].id, {url: "blocked.html"});
                blockWebsiteBtn.classList.add("hide");
                allowURLButton.classList.add("hide");
            }
            saveData();
            return;
        }
    })
    blockWebsiteBtn.innerText = "Website already blocked!";
})

setInterval(checkDate, 1000); // in case the popup is opened as it turns midnight

allowedURLsButton.addEventListener('click', () => {
    allowedURLsModal.showModal();
})

blocklistButton.addEventListener('click', () => {
    blocklistModal.showModal();
})

closeBlocklistButton.addEventListener('click', () => {
    blocklistModal.close();
})

closeAllowedURLsButton.addEventListener('click', () => {
    allowedURLsModal.close();
})

blockpageMessageBtn.addEventListener('click', () => {
    blockpageMessageModal.showModal();
})

closeBlockpageMessageBtn.addEventListener('click', () => {
    blockpageMessageModal.close();
})

let saveButtonClicked = true;

blockpageMessageInput.addEventListener('input', () => {
    saveButton.innerText = "Save";
    saveButtonClicked = false;
})

blockpageEmojiInput.addEventListener('input', () => {
    saveButton.innerText = "Save";
    saveButtonClicked = false;
})

blocklistInput.addEventListener('input', () => {
    saveButton.innerText = "Save";
    saveButtonClicked = false;
})

allowedURLsInput.addEventListener('input', () => {
    saveButton.innerText = "Save";
    saveButtonClicked = false;
})

hoursInput.addEventListener('input', () => {
    saveButton.innerText = "Save";
    saveButtonClicked = false;
})

minsInput.addEventListener('input', () => {
    saveButton.innerText = "Save";
    saveButtonClicked = false;
})

unblocksPerDayInput.addEventListener('input', () => {
    saveButton.innerText = "Save";
    saveButtonClicked = false;
})

settingsButton.addEventListener('click', () => {
    mainPage.classList.toggle("hide");
    settingsPage.classList.toggle("hide");
})

backToMainButton.addEventListener('click', () => {
    if(saveButtonClicked === false){
        if(!confirm("Your changes have not been saved. Continue?")){
            return;
        }
    }
    saveButtonClicked = true;
    mainPage.classList.toggle("hide");
    settingsPage.classList.toggle("hide");
    saveButton.innerText = "Save";
    updateTextValues();
    updateSelectedDaysOfWeekButtons();
})

endEarlyBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({type: "end-early"});
    checkIfActiveDayOfWeek();
})

const sundayBtn = document.getElementById("sunday");
const mondayBtn = document.getElementById("monday");
const tuesdayBtn = document.getElementById("tuesday");
const wednesdayBtn = document.getElementById("wednesday");
const thursdayBtn = document.getElementById("thursday");
const fridayBtn = document.getElementById("friday");
const saturdayBtn = document.getElementById("saturday");

function updateSelectedDaysOfWeekButtons(){
    for(const day of userData.daysOfWeek){
        switch(day){
            case 0:
                sundayBtn.classList.add("selected");
                break;
            case 1:
                mondayBtn.classList.add("selected");
                break;
            case 2:
                tuesdayBtn.classList.add("selected");
                break;
            case 3:
                wednesdayBtn.classList.add("selected");
                break;
            case 4:
                thursdayBtn.classList.add("selected");
                break;
            case 5:
                fridayBtn.classList.add("selected");
                break;
            default:
                saturdayBtn.classList.add("selected");
        }
    }
}

function updateDaysOfWeek(dayOfWeek, btnName){
    saveButtonClicked = false;
    if(userData.daysOfWeek.includes(dayOfWeek) === false){
        userData.daysOfWeek.push(dayOfWeek);
        btnName.classList.add("selected");
    }
    else{
        userData.daysOfWeek.splice(userData.daysOfWeek.indexOf(dayOfWeek), 1);
        btnName.classList.remove("selected");
    }
}

sundayBtn.addEventListener('click', () => {
    updateDaysOfWeek(0, sundayBtn);
})

mondayBtn.addEventListener('click', () => {
    updateDaysOfWeek(1, mondayBtn);
})

tuesdayBtn.addEventListener('click', () => {
    updateDaysOfWeek(2, tuesdayBtn);
})

wednesdayBtn.addEventListener('click', () => {
    updateDaysOfWeek(3, wednesdayBtn);
})

thursdayBtn.addEventListener('click', () => {
    updateDaysOfWeek(4, thursdayBtn);
})

fridayBtn.addEventListener('click', () => {
    updateDaysOfWeek(5, fridayBtn);
})

saturdayBtn.addEventListener('click', () => {
    updateDaysOfWeek(6, saturdayBtn);
})