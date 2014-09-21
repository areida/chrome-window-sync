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

function setBrowserActionActive() {
    chrome.browserAction.setIcon({path : ICON_PATH_ACTIVE});
    chrome.browserAction.setTitle({title : ICON_TITLE_ACTIVE});
}

function setBrowserActionInactive() {
    chrome.browserAction.setIcon({path : ICON_PATH_INACTIVE});
    chrome.browserAction.setTitle({title : ICON_TITLE_INACTIVE});
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

// Listener functions
function browserActionListener(masterTab, active) {
    chrome.storage.local.get({
        active : active
    }, function(values) {
        if (values.active) {
            chrome.storage.local.set({
                tab    : null,
                active : false
            }, function() {
                shutdownListeners(masterTab);
                setBrowserActionInactive();
                chrome.tabs.reload(masterTab.id);
            });
        } else {
            chrome.storage.local.set({
                active : true,
                tab    : masterTab
            }, function() {
                startListeners(masterTab);
                setBrowserActionActive();
                updateUrlFromTab(masterTab);
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

function shutdownListeners(masterTab) {
    chrome.runtime.onMessage.removeListener();
    chrome.tabs.onUpdated.removeListener();
}

function startListeners(masterTab) {
    chrome.tabs.executeScript(masterTab.id, {file: CONTENT_SCRIPT_PATH});
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (sender.tab.id === masterTab.id) {
            contentScriptListener(masterTab, request, sendResponse);
        }
    });

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, changeTab) {
        tabUrlListener(masterTab, tabId, changeInfo, changeTab);
    });
}
