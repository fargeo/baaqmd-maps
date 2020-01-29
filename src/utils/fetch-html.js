import * as ko from 'knockout';

(function() {
    let proto = DOMParser.prototype;
    let nativeParse = proto.parseFromString;

    try {
        if ((new DOMParser()).parseFromString("", "text/html")) return;
    } /* eslint-disable */ catch (ex) {} /* eslint-enable */

    proto.parseFromString = function(markup, type) {
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            let doc = document.implementation.createHTMLDocument("");
            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
                doc.documentElement.innerHTML = markup;
            }
            else {
                doc.body.innerHTML = markup;
            }
            return doc;
        } else {
            return nativeParse.apply(this, arguments);
        }
    };
}());

export default function fetchHTML(url, content) {
    if (!content) content = ko.observable();
    else content(undefined);
    fetch(url)
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            return content(doc.querySelector('body').innerHTML);
        });
    return content;
}
