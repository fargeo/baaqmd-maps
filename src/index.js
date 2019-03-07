import * as ko from 'knockout';
import './styles.scss';
import * as config from './config.json';
import * as content from './index.html';
import './components/aqi-forecast/';
import './components/facilities/';
import './components/impacted-communities/';
import './components/monitoring/';
import './components/open-burning/';
import './components/map/';
import './components/details-panel/';

export function Map(opts) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    if (typeof opts.container === 'string') {
        opts.container = document.querySelector(`#${opts.container}`);
    }
    if (typeof opts.sidePanel !== 'boolean') opts.sidePanel = true;

    // private members
    this.detailsExpanded = ko.observable(false);
    this.detailsActive = ko.observable(opts.sidePanel);
    this.enableMapTypeSelector = opts.enableMapTypeSelector;
    this.mapTypes = Object.keys(config.mapTypes);
    if (this.mapTypes.indexOf(opts.mapType) < 0) opts.mapType = this.mapTypes[0];
    this.mapType = ko.observable(opts.mapType);
    this.map = ko.observable();

    // public members
    this.el = doc.body.removeChild(doc.body.firstChild);
    this.expandSidePanel = () => {
        this.detailsExpanded(true);
        return true;
    };
    this.collapseSidePanel = () => {
        this.detailsExpanded(false);
        return false;
    };
    this.showSidePanel = () => {
        this.detailsActive(true);
        return true;
    };
    this.hideSidePanel = () => {
        this.detailsActive(false);
        return false;
    };

    opts.container.appendChild(this.el);
    ko.applyBindings(this, this.el);
};
