let userData = {};
let countdownInterval;

chrome.runtime.onMessage.addListener((message) => {
    if(chrome.runtime.lastError){
        console.log("Error retrieving chrome storage data");
    }

    if(message.type === 'startCountdown'){
        chrome.storage.local.get(["userData"], (result) => {
            userData = result.userData;

            const totalSecondsCombined = (userData.hours*3600) + (userData.minutes*60);
            const endTime = new Date().setSeconds(new Date().getSeconds() + totalSecondsCombined);
            
            countdownInterval = setInterval( () => { updateCountdown(endTime) }, 1000);
        })
    }
    if(message.type === 'end-early'){
        stopCountdown();
    }
})

function updateCountdown(endTime){
    const remainingSeconds = (endTime - Date.now()) / 1000;

    if(remainingSeconds < 1){
        stopCountdown();
        return; //return so that the code below is not executed after clearing interval
    }

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds / 60) % 60)
    const seconds = Math.floor(remainingSeconds % 60);

    chrome.runtime.sendMessage({type: "update-popup-text", hours: hours, minutes: minutes, seconds: seconds});
}

function stopCountdown(){
    clearInterval(countdownInterval);
    chrome.storage.local.get(["userData"], (result) => {
        result.userData.countdownIsRunning = false;
        chrome.storage.local.set({userData: result.userData}, () => {
            chrome.runtime.sendMessage({type: "countdown-ended"});
            chrome.tabs.query({active: true, currentWindow: true}, (tab) => {
                if(tab[0].url){
                    const URLobj = new URL(tab[0].url);
                    let parsedURL = URLobj.hostname;
                    parsedURL = parsedURL.replace(/^www\./, '')
    
                    if(result.userData.allowedURLs.includes(tab[0].url)){
                        return;
                    }
                    else if(result.userData.blocklist.includes(parsedURL)){
                        chrome.tabs.update(tab[0].id, {url: "blocked.html"});
                    }
                }
            })
        })
    })
}

chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
    if(tab.url && changeInfo.status === 'complete'){
        chrome.storage.local.get(["userData"], (result) => {
            const currentDate = new Date();
            if(result.userData.daysOfWeek.includes(currentDate.getDay())){
                const URLobj = new URL(tab.url);
                let parsedURL = URLobj.hostname;
                parsedURL = parsedURL.replace(/^www\./, '')

                if(result.userData.countdownIsRunning === false && result.userData.allowedURLs.includes(tab.url)){
                    return;
                }
                else if(result.userData.countdownIsRunning === false && result.userData.blocklist.includes(parsedURL)){
                    chrome.tabs.update(_, {url: "blocked.html"});
                }
            }
        })
    }
})

chrome.tabs.onActivated.addListener(() => {
    chrome.tabs.query({active: true, currentWindow: true}, (tab) => {
        chrome.storage.local.get(["userData"], (result) => {
            const currentDate = new Date();
            if(result.userData.daysOfWeek.includes(currentDate.getDay())){
                if(tab[0].url){
                    const URLobj = new URL(tab[0].url);
                    let parsedURL = URLobj.hostname;
                    parsedURL = parsedURL.replace(/^www\./, '')

                    if(result.userData.countdownIsRunning === false && result.userData.allowedURLs.includes(tab[0].url)){
                        return;
                    }
                    else if(result.userData.countdownIsRunning === false && result.userData.blocklist.includes(parsedURL)){
                        chrome.tabs.update(tab[0].id, {url: "blocked.html"});
                    }
                }
            }
        })
    })
})