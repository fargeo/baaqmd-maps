import 'intl';
import 'whatwg-fetch';
import 'core-js';
import * as ko from 'knockout';
import './styles.scss';
import config from './config.json';
import * as content from './main.html';
import './components/aqi-forecast/';
import './components/bahhi-eligibility/';
import './components/facilities/';
import './components/impacted-communities/';
import './components/overburdened-communities/';
import './components/monitoring/';
import './components/open-burning/';
import './components/map/';
import './components/details-panel/';
import './components/scroll-hint/';

export function Map(opts) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    if (typeof opts.container === 'string') {
        opts.container = document.querySelector(`#${opts.container}`);
    }
    if (typeof opts.sidePanel !== 'boolean') opts.sidePanel = true;
    if (typeof opts.sidePanelExpanded !== 'boolean') opts.sidePanelExpanded = true;

    // private members
    this.accessToken = opts.accessToken;
    this.mobileMode = opts.mobile;
    this.detailsExpanded = ko.observable(opts.sidePanelExpanded);
    this.detailsActive = ko.observable(opts.sidePanel);
    this.alertActive = ko.observable(false);
    this.enableMapTypeSelector = opts.enableMapTypeSelector;
    this.fullscreenURL = opts.fullscreenURL || config.fullscreenURL;
    this.mobileFullscreen = opts.mobileFullscreen || false;
    let mapTypes = Object.keys(config.mapTypes);
    if (Array.isArray(opts.mapType) && opts.mapType.length > 0) {
        mapTypes = opts.mapType;
        opts.mapType = opts.mapType[0];
    }
    this.mapTypes = mapTypes;
    if (this.enableMapTypeSelector !== false) {
        const searchParams = new URLSearchParams(window.location.search);
        const mapType = searchParams.get('mapType');
        if (mapType) {
            opts.mapType = mapType;
        }
    }
    if (this.mapTypes.indexOf(opts.mapType) < 0) opts.mapType = this.mapTypes[0];
    this.mapType = ko.observable(opts.mapType);
    this.map = ko.observable();
    this.showInfoPanel = ko.observable(false);
    this.showInfoPopup = ko.observable(false);
    this.getScrollContent = function(e) {
        return e.closest('.baaqmd-maps-info-panel-content');
    };
    this.popup = ko.observable(false);
    this.closeInfoPanel = (closePopup) => {
        var popup = this.popup();
        if (closePopup && popup) popup.remove();
        this.popup(false);
        this.showInfoPanel(false);
    };
    this.rootURL = opts.rootURL;
    this.scrolling = ko.observable(false);
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        var scrollTimeout = null;
        parent.window.onscroll = () => {
            this.scrolling(true);
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => this.scrolling(false), 200);
        };
    }

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
}
