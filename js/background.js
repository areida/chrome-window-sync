var masterTab;

function syncTabs(tab) {
    chrome.tabs.query({active : true}, function(tabs) {
        var changeUrl, reload;

        for (var i in tabs) {
            if (tabs[i].id !== tab.id) {
                changeUrl = 'history.pushState({}, \'\', \''+tab.url+'\');';
                reload    = 'parent.location.hash=\'!\';';

                chrome.tabs.executeScript(tabs[i].id, {code : changeUrl});
                chrome.tabs.executeScript(tabs[i].id, {code : reload});
            }
        }
    });
}

function masterTabListener(tabId, changeInfo, tab) {
    if (
        tabId === masterTab.id &&
        changeInfo.status &&
        changeInfo.status === 'complete'
    ) {
        syncTabs(tab);
    }
}

chrome.browserAction.onClicked.addListener(function(tab) {
    masterTab = tab;

    chrome.storage.local.get({toggle : false}, function(values) {
        if (! values.toggle) {
            chrome.storage.local.set({toggle : true}, function() {
                chrome.tabs.onUpdated.addListener(masterTabListener)

                syncTabs(masterTab);

                chrome.browserAction.setIcon({
                    path : 'images/icon-128x128-inverse.png'
                });
            });
        } else {
            chrome.storage.local.set({toggle : false}, function() {
                chrome.tabs.onUpdated.removeListener(masterTabListener);

                chrome.browserAction.setIcon({
                    path : 'images/icon-128x128.png'
                });
            });
        }
    });
});
