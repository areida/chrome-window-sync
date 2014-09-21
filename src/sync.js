'use_strict';

var BrowserAction = require('./browser-action');
var Events        = require('./events');
var Scripts       = require('./scripts');

var Sync = function(tab) {
    this.tab    = tab;
    this.events = new Events(this);
};

Sync.prototype.onEachActiveTab = function(callback) {
    var self = this;

    chrome.tabs.query({active : true}, function(tabs) {
        for (var i in tabs) {
            if (tabs[i].id !== self.tab.id) {
                callback(tabs[i]);
            }
        }
    });
};

Sync.prototype.click = function(request) {
    var code;

    if (request.targetId) {
        code = Scripts.clickById(request.targetId);
    } else if (request.targetClass) {
        code = Scripts.clickByClass(
            request.tagName,
            request.targetClass.replace(' ', '.*')
        );
    } else {
        code = Scripts.clickByTagName(request.tagName);
    }

    this.onEachActiveTab(function(tab) {
        chrome.tabs.executeScript(tab.id, {code : code});
    });
};

Sync.prototype.history = function(url) {
    this.onEachActiveTab(function(tab) {
        chrome.tabs.executeScript(tab.id, {code : Scripts.pushState(url)});
        chrome.tabs.executeScript(tab.id, {code : Scripts.reload()});
    });
};

Sync.prototype.start = function() {
    var self = this;

    BrowserAction.setState(BrowserAction.STATE_ACTIVE);

    this.events.start();

    // Force every other open tab to this tab's url with page load
    this.onEachActiveTab(function(tab) {
        chrome.tabs.update(tab.id, {url : self.tab.url});
    });
}

Sync.prototype.stop = function() {
    BrowserAction.setState(BrowserAction.STATE_INACTIVE);

    this.events.stop();

    // Reload this tab to clear content scripts
    chrome.tabs.reload(this.tab.id);
};

module.exports = Sync;
