'use_strict';

var Scripts = require('./scripts');

var STATUS_COMPLETE = 'complete';
var TYPE_CLICK      = 'click';

var Events = function(sync) {
    this.sync = sync;
};

Events.prototype.start = function() {
    var self = this;

    // Inject listeners into the master tab
    chrome.tabs.executeScript(this.sync.tab.id, {file : 'js/content.js'});

    // Listen for events from the master tab and dispatch them
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (sender.tab.id === self.sync.tab.id) {
            switch (request.eventType) {
                case TYPE_CLICK :
                    self.sync.click(request);
                    break;
            }
        }
    });

    // Listen to all tab url changes
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        var completed, fromMasterTab;

        completed     = (changeInfo.status && (changeInfo.status === STATUS_COMPLETE));
        fromMasterTab = (tabId === self.sync.tab.id);

        if (fromMasterTab && completed) {
            self.sync.history(tab.url);
        }
    });
};

Events.prototype.stop = function() {
    chrome.runtime.onMessage.removeListener();
    chrome.tabs.onUpdated.removeListener();
};

module.exports = Events;
