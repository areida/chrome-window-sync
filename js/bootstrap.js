// Initialize extension
chrome.storage.local.get({
    active : false,
    tab    : null
}, function(values) {
    if (values.active && values.tab) {
        startListeners(values.tab);
        setBrowserActionActive();
        updateUrlFromTab(values.tab);
    }

    // Listen for user clicks on browser action icon
    chrome.browserAction.onClicked.addListener(function(tab) {
        browserActionListener(tab, values.active)
    });
});
