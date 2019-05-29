import * as ko from 'knockout';

export default function fetchHTML(url, content) {
    if (!content) content = ko.observable();
    else content(undefined);
    fetch(url)
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'application/xml');
            return content(doc.querySelector('body').innerHTML);
        });
    return content;
}
