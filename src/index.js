import * as ko from 'knockout';
import './styles.scss';
import * as content from './index.html';
import './components/map/';
import './components/details-panel/';

export function Map(opts) {
    if (typeof opts.container === 'string') {
        opts.container = document.querySelector(`#${opts.container}`);
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    this.el = doc.body.removeChild(doc.body.firstChild);
    opts.container.appendChild(this.el);
    ko.applyBindings(this, this.el);
};
