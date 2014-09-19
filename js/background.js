function syncTabs(newTab, masterTab) {
    masterTab = masterTab || newTab;

    chrome.tabs.query({active : true}, function(tabs) {
        for (var i in tabs) {
            if (tabs[i].id !== masterTab.id) {
                chrome.tabs.update(tabs[i].id, {url: newTab.url});
            }
        }
    });
}

chrome.browserAction.onClicked.addListener(function(masterTab) {
    syncTabs(masterTab);

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, newTab) {
        if (tabId === masterTab.id && changeInfo.status && changeInfo.status === 'complete') {
            syncTabs(newTab, masterTab);
        }
    });
});
