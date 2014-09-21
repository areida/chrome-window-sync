'use_strict';

exports.triggerOnClass = function(type, tagName, tagClass) {
    return (
        'var elements = document.getElementsByTagName(\'' + tagName + '\');' +
        'for(var i in elements) {' +
            'var className = elements[i].className;' +
            'if (className && className.match(/' + tagClass + '/)) {' +
                'elements[i].' + type + '();' +
                'break;' +
            '}' +
        '}'
    );
};

exports.triggerOnId = function(type, id) {
    return ('document.getElementById(\'' + id + '\').' + type + '();');
};

exports.triggerOnTagName = function(type, tagName) {
    return ('document.getElementsByTagName(\'' + tagName + '\')[0].' + type + '();');
};

exports.pushState = function(url) {
    return ('history.pushState({}, \'\', \'' + url + '\');');
};

exports.reload = function() {
    return ('parent.location.hash=\'!\';');
};
