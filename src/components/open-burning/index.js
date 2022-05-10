import * as ko from 'knockout';
import config from '../../config.json';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as infoPanelTemplate from './info-panel.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';
import fetchHTML from '../../utils/fetch-html';

ko.components.register('OpenBurnInfoPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
    },
    template: infoPanelTemplate
});

const parser = new DOMParser();
const openBurnData = ko.observable();
const openBurnStatusInfo = ko.observable();
const sectionNames = {
    'South': 'South Section',
    'Coast': 'Coastal Section',
    'North': 'North Section'
};
let fetchData = (rootURL) => {
    fetch(rootURL + config.openBurnRSSFeed, {cache: "no-store"})
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            const xmlDoc = parser.parseFromString(text, 'application/xml');
            const dates = [];
            const sections = {};
            xmlDoc.querySelectorAll('item').forEach((item) => {
                const date = new Date(item.querySelector('date').textContent);
                if (date >= new Date().setHours(0, 0, 0, 0)) {
                    const zones = item.querySelectorAll('zone');
                    const statuses = item.querySelectorAll('status');
                    const dateStatus = [];
                    zones.forEach(function(zone, i) {
                        const name = sectionNames[zone.textContent];
                        const status = statuses[i].textContent === "Burn Allowed" ? "yes" : "no";
                        const statusLabel = status === "yes" ? "Allowed" : "Prohibited";
                        if (!sections[name]) sections[name] = [];
                        sections[name].push({
                            date: date,
                            status: status,
                            statusLabel: statusLabel
                        });
                        dateStatus.push({
                            name: name,
                            status: status,
                            statusLabel: statusLabel
                        });
                    });
                    dates.push({
                        date: date,
                        status: dateStatus
                    });
                }
            });
            openBurnData({
                dates: dates,
                sections: sections,
                lastUpdated: new Date(xmlDoc.querySelector('lastUpdated').textContent)
            });
        });
    fetchHTML(rootURL + config.openBurnStatusInfoURL, openBurnStatusInfo);
    fetchData = false;
};

export default ko.components.register('OpenBurning', {
    viewModel: function(params) {
        const sections = [
            'South Section',
            'Coastal Section',
            'North Section'
        ];
        const rootUrl = params.rootURL || config.prodRoot;
        if (fetchData) fetchData(rootUrl);
        this.openBurnData = openBurnData;
        this.day = ko.observable();
        this.layers = {
            district: {
                flag: ko.observable(true),
                names: [
                    'district-boundary'
                ]
            },
            counties: {
                flag: ko.observable(true),
                names: [
                    'counties',
                    'counties-labels'
                ]
            }
        };

        this.popupLayers = ['open-burn-sections-fill'];
        this.getPopupData = (feature) => {
            const openBurnData = this.openBurnData();
            return {
                name: feature.properties.section,
                lastUpdated: openBurnData.lastUpdated,
                openBurnData: openBurnData.sections[feature.properties.section],
                day: this.day,
                openBurnStatusInfo: openBurnStatusInfo
            };
        };
        this.popupTemplate = popupTemplate;

        this.day.subscribe((day) => {
            if (typeof day === 'number') {
                sections.forEach((section, i) => {
                    const status = this.openBurnData().dates[day].status.find((s) => {
                        return s.name === section;
                    });
                    this.map().setFeatureState({
                        id: i + 1,
                        source: 'composite',
                        sourceLayer: 'openburnsections'
                    }, {
                        status: status.status
                    });
                });
            }
        }, this);

        var getTodaysDay = () => {
            let openBurnData = this.openBurnData();
            let today = new Date();
            let day = 0;
            today = today.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
            openBurnData.dates.forEach((date, i) => {
                let dateString = date.date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
                if (today === dateString) day = i;
            });
            return day;
        };

        this.setupMap = () => {
            if (this.openBurnData()) {
                this.day(getTodaysDay());
            } else {
                let updateOnFetch = this.openBurnData.subscribe(() => {
                    this.day(getTodaysDay());
                    updateOnFetch.dispose();
                });
            }

            this.layers.counties.flag(false);
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
