'use_strict';

var Sync          = require('./sync');
var BrowserAction = require('./browser-action');

var sync;

chrome.storage.local.set({
    active : false
}, function() {
    BrowserAction.setState(BrowserAction.STATE_INACTIVE);

    chrome.browserAction.onClicked.addListener(function(tab) {
        chrome.storage.local.get({
            active : false
        }, function(values) {
            if (values.active && sync) {
                chrome.storage.local.set({
                    active : false
                }, function() {
                    sync.stop();
                });
            } else {
                sync = new Sync(tab);

                chrome.storage.local.set({
                    active : true
                }, function() {
                    sync.start();
                });
            }
        });
    });
});
