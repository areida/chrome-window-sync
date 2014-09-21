document.addEventListener('click', function(event) {
    var attributes = event.target.attributes;

    for (var i in attributes) {
        if (
            (attributes[i].localName === 'href') &&
            attributes[i].value &&
            (attributes[i].value !== 'javascript:;')
        ) {
            return;
        }
    }

    chrome.runtime.sendMessage({
        eventType   : 'click',
        id          : event.target.id,
        tagName     : event.target.tagName,
        targetClass : event.target.className
    });
}, true);
