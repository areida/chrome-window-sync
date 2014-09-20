var ACTIVE_IMAGE_PATH   = 'images/icon-128x128-inverse.png';
var INACTIVE_IMAGE_PATH = 'images/icon-128x128.png';

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

// Trigger other tabs to sync when the master tab updates
function tabUpdateListener(tabId, changeInfo, tab) {
    chrome.storage.local.get('tab', function(values) {
        if (
            values.tab &&
            tabId === values.tab.id &&
            changeInfo.status &&
            changeInfo.status === 'complete'
        ) {
            syncTabs(tab);
        }
    });
}

// Check initial state
chrome.storage.local.get({
    tab    : null,
    toggle : false
}, function(values) {

    // If the script is activated
    if (values.tab && values.toggle) {
        syncTabs(values.tab);
        chrome.tabs.onUpdated.addListener(tabUpdateListener)
        chrome.browserAction.setIcon({path : ACTIVE_IMAGE_PATH});
    }

    chrome.browserAction.onClicked.addListener(function(tab) {
        chrome.storage.local.get({
            toggle : values.toggle
        }, function(values) {
            // If the script is active, deactivate it
            if (values.toggle) {
                chrome.tabs.onUpdated.removeListener(tabUpdateListener);
                chrome.browserAction.setIcon({path : INACTIVE_IMAGE_PATH});
                chrome.storage.local.set({
                    tab    : null,
                    toggle : false
                });
            } else {
                syncTabs(tab);
                chrome.tabs.onUpdated.addListener(tabUpdateListener);
                chrome.browserAction.setIcon({path : ACTIVE_IMAGE_PATH});
                chrome.storage.local.set({
                    tab    : tab,
                    toggle : true
                });
            }
        });
    });
});
