'use_strict';

var ICON_PATH_ACTIVE    = 'images/icon-128x128-inverse.png';
var ICON_PATH_INACTIVE  = 'images/icon-128x128.png';
var ICON_TITLE_ACTIVE   = 'Unsync windows';
var ICON_TITLE_INACTIVE = 'Sync windows';
var STATE_ACTIVE        = 'active';
var STATE_INACTIVE      = 'inactive';

exports.STATE_ACTIVE   = STATE_ACTIVE;
exports.STATE_INACTIVE = STATE_INACTIVE;

exports.setState = function(state) {
    switch (state) {
        case STATE_ACTIVE :
            chrome.browserAction.setIcon({path : ICON_PATH_ACTIVE});
            chrome.browserAction.setTitle({title : ICON_TITLE_ACTIVE});
            break;
        case STATE_INACTIVE :
        default :
            chrome.browserAction.setIcon({path : ICON_PATH_INACTIVE});
            chrome.browserAction.setTitle({title : ICON_TITLE_INACTIVE});
            break;
    }
};