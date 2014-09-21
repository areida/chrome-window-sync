'use_strict';

exports.clickByClass = function(tagName, tagClass) {
    return (
        'var elements = document.getElementsByTagName(\'' + tagName + '\');' +
        'for(var i in elements) {' +
            'var className = elements[i].className;' +
            'if (className && className.match(/' + tagClass + '/)) {' +
                'elements[i].click();' +
                'break;' +
            '}' +
        '}'
    );
};

exports.clickById = function(id) {
    return ('document.getElementById(\'' + id + '\').click();');
};

exports.clickByTagName = function(tagName) {
    return ('document.getElementsByTagName(\'' + tagName + '\')[0].click();');
};

exports.pushState = function(url) {
    return ('history.pushState({}, \'\', \'' + url + '\');');
};

exports.reload = function() {
    return ('parent.location.hash=\'!\';');
};
