var ACTIVE_IMAGE_PATH   = 'images/icon-128x128-inverse.png';
var INACTIVE_IMAGE_PATH = 'images/icon-128x128.png';

// Performs a callback on each active tab that isn't the master tab
function eachActiveTab(masterTab, callback) {
    chrome.tabs.query({active : true}, function(tabs) {
        for (var i in tabs) {
            if (tabs[i].id !== masterTab.id) {
                callback(tabs[i]);
            }
        }
    });
}

// Update functions
function updateHistoryFromTab(masterTab) {
    var changeUrl, reload;

    changeUrl = 'history.pushState({}, \'\', \'' + masterTab.url + '\');';
    reload    = 'parent.location.hash=\'!\';';

    eachActiveTab(masterTab, function(tab) {
        chrome.tabs.executeScript(tab.id, {code : changeUrl});
        chrome.tabs.executeScript(tab.id, {code : reload});
    });
}

function updateUrlFromTab(masterTab) {
    eachActiveTab(masterTab, function(tab) {
        chrome.tabs.update(tab.id, {url : masterTab.url});
    });
}

function simulateClick(masterTab, request) {
    var regex, click;

    regex = request.targetClass.replace(' ', '.*');
    click = (
        'var elements = document.getElementsByTagName(\'' + request.tagName + '\');' +
        'for(var i in elements) {' +
            'if (elements[i].className.match(/' + regex + '/)) {' +
                'elements[i].click();' +
                'break;' +
            '}' +
        '}'
    );

    eachActiveTab(masterTab, function(tab) {
        chrome.tabs.executeScript(tab.id, {code : click});
    });
}

// Listener functions
function browserActionListener(masterTab, toggle) {
    chrome.storage.local.get({
        toggle : toggle
    }, function(values) {
        // If the script is active, deactivate it
        if (values.toggle) {
            chrome.browserAction.setIcon({path : INACTIVE_IMAGE_PATH});
            chrome.browserAction.setTitle({title : 'Sync windows'});
            chrome.tabs.reload(masterTab.id);
            chrome.runtime.onMessage.removeListener();
            chrome.tabs.onUpdated.removeListener();
            chrome.storage.local.set({
                tab    : null,
                toggle : false
            });
        } else {
            startListeners(masterTab);

            chrome.storage.local.set({
                tab    : masterTab,
                toggle : true
            });
        }
    });
}

function contentScriptListener(masterTab, request, sendResponse) {
    if (request.eventType === 'click') {
        simulateClick(masterTab, request)
    }
}

function tabUrlListener(masterTab, tabId, changeInfo, changeTab) {
    if (
        tabId === masterTab.id &&
        changeInfo.status &&
        changeInfo.status === 'complete'
    ) {
        updateHistoryFromTab(changeTab);
    }
}

// Start listeners on the master tab
function startListeners(masterTab) {
    updateUrlFromTab(masterTab);

    chrome.browserAction.setIcon({path : ACTIVE_IMAGE_PATH});
    chrome.browserAction.setTitle({title : 'Unsync windows'});
    chrome.tabs.executeScript(masterTab.id, {file: 'js/content.js'});
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (sender.tab.id === masterTab.id) {
            contentScriptListener(masterTab, request, sendResponse);
        }
    });

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, changeTab) {
        tabUrlListener(masterTab, tabId, changeInfo, changeTab);
    });
}

// Initialize extension
chrome.storage.local.get({
    tab    : null,
    toggle : false
}, function(values) {
    var browserActionClickListenerProxy;

    // If the script is active restart the listeners
    if (values.tab && values.toggle) {
        startListeners(values.tab);
    }

    // Listen for user clicks on browser action icon
    chrome.browserAction.onClicked.addListener(function(tab) {
        browserActionListener(tab, values.toggle)
    });
});
