import * as ko from 'knockout';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as infoPanelTemplate from './info-panel.html';
import * as summerModalTemplate from './summer-modal.html';
import * as winterModalTemplate from './winter-modal.html';
import * as pollutantInfoPanelTemplate from './pollutant-info-panel.html';
import * as forecastPanelTemplate from './forecast-panel.html';
import * as boundariesPopupTemplate from './boundaries-popup.html';
import * as staPopupTemplate from './sta-popup.html';
import * as dailyForecastPopupTemplate from './daily-forecast-popup.html';
import * as mobileMenuTemplate from './mobile-menu.html';
import * as aqiFooterTemplate from './aqi-footer.html';
import config from '../../config.json';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';
import fetchHTML from '../../utils/fetch-html';

const aqiData = ko.observable();
const day = ko.observable();
const parser = new DOMParser();
const aqiInfo = ko.observable();
const pollutantInfo = ko.observable();
const aboutForecast = ko.observable();
const summerModal = ko.observable();
const winterModal = ko.observable();
const alertMode = ko.observable('none');
const alertStatus = ko.observable();
const alertIcon = ko.observable();
const alertLabel = ko.observable();
const alertTitle = ko.observable();
const alertDescription = ko.observable();

let fetchData = (rootURL) => {
    fetch(rootURL + config.spaRSSFeed, {cache: "no-store"})
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            const xmlDoc = parser.parseFromString(text, 'application/xml');
            xmlDoc.querySelectorAll('item').forEach((item) => {
                if (item.querySelector('title').textContent === 'Alert Mode') {
                    var mode;
                    switch (item.querySelector('description').textContent) {
                    case 'Winter Season in Effect':
                        mode = 'winter';
                        break;
                    case 'Summer Season in Effect':
                        mode = 'summer';
                        break;
                    default:
                        mode = 'none';
                    }
                    alertMode(mode);
                }
            });
            alertStatus(xmlDoc.querySelector('item isAlert').textContent.toLowerCase() !== "false");
            alertIcon(xmlDoc.querySelector('item alertIconCssClass').textContent);
            alertLabel(xmlDoc.querySelector('item alertLabel').textContent);
            alertTitle(xmlDoc.querySelector('item alertTitle').textContent);
            alertDescription(xmlDoc.querySelector('item alertDescription').textContent);
            return fetch(rootURL + config.aqiRSSFeed, {cache: "no-store"});
        })
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            const xmlDoc = parser.parseFromString(text, 'application/xml');
            const dates = [];
            const zones = {};
            xmlDoc.querySelectorAll('item').forEach((item) => {
                let day = {
                    date: item.querySelector('date').textContent.slice(0, -3),
                    fullDate: new Date(item.querySelector('date').textContent)
                        .toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}),
                    zones: []
                };
                item.querySelectorAll('zone').forEach((zone) => {
                    let measurement = zone.querySelector('measurement').textContent;
                    let forecast;
                    if (!isNaN(parseFloat(measurement))) {
                        measurement = parseFloat(measurement);
                        if (measurement <= 50) {
                            forecast = 'Good';
                        } else if (measurement >= 51 && measurement <= 100) {
                            forecast = 'Moderate';
                        } else if (measurement >= 101 && measurement <= 150) {
                            forecast = 'Unhealthy for Sensitive Groups';
                        } else if (measurement >= 151 && measurement <= 200) {
                            forecast = 'Unhealthy';
                        } else if (measurement >= 201 && measurement <= 300) {
                            forecast = 'Very Unhealthy';
                        } else if (measurement >= 301 && measurement <= 500) {
                            forecast = 'Hazardous';
                        }
                    } else {
                        forecast = measurement;
                        measurement = null;
                    }
                    let zoneData = {
                        title: zone.querySelector('title').textContent,
                        measurement: measurement,
                        pollutant: zone.querySelector('pollutant').textContent,
                        forecast: forecast
                    };
                    day.zones.push(zoneData);

                    zones[zoneData.title] = zones[zoneData.title] || [];
                    zones[zoneData.title].push(Object.assign({
                        date: day.date
                    }, zoneData));
                });
                dates.push(day);
            });

            aqiData({
                dates: dates,
                zones: zones,
                lastUpdated: new Date(xmlDoc.querySelector('lastUpdated').textContent)
            });
        });
    fetchHTML(rootURL + config.aqiInfoURL, aqiInfo);
    fetchHTML(rootURL + config.pollutantInfoURL, pollutantInfo);
    fetchHTML(rootURL + config.aboutForecastURL, aboutForecast);
    fetchHTML(rootURL + config.summerModalURL, summerModal);
    fetchHTML(rootURL + config.winterModalURL, winterModal);
    fetchData = false;
};

ko.components.register('AQIInfoPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.aqiInfo = aqiInfo;
    },
    template: infoPanelTemplate
});

ko.components.register('SummerModal', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.summerModal = summerModal;
    },
    template: summerModalTemplate
});

ko.components.register('WinterModal', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.winterModal = winterModal;
    },
    template: winterModalTemplate
});

var layers;
ko.components.register('BoundariesPopup', {
    viewModel: function(params) {
        this.showInfoPopup = params.showInfoPopup;
        this.layers = layers;
    },
    template: boundariesPopupTemplate
});

ko.components.register('DailyForecastPopup', {
    viewModel: function(params) {
        this.showInfoPopup = params.showInfoPopup;
        this.showInfoPanel = params.showInfoPanel;
        this.aqiData = aqiData;
        this.day = day;
    },
    template: dailyForecastPopupTemplate
});

ko.components.register('STAPopup', {
    viewModel: function(params) {
        const today = new Date();
        this.dateString = today.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
        this.dayString = today.toLocaleDateString('en-US', { weekday: 'long' });
        this.showInfoPopup = params.showInfoPopup;
        this.showInfoPanel = params.showInfoPanel;
        this.alertIcon = alertIcon;
        this.alertStatus = alertStatus;
        this.alertMode = alertMode;
        this.alertLabel = alertLabel;
        this.alertTitle = alertTitle;
        this.alertDescription = alertDescription;
    },
    template: staPopupTemplate
});

ko.components.register('AQIForecastPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.aqiData = aqiData;
        this.zones = ko.computed(() => {
            if (aqiData()) {
                let zones = [];
                for (var name in aqiData().zones) {
                    zones.push({
                        name: name.replace('Coastal', 'Coast'),
                        dates: aqiData().zones[name]
                    });
                }
                return zones;
            }
        });
    },
    template: forecastPanelTemplate
});

ko.components.register('PollutantInfoPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.pollutantInfo = pollutantInfo;
    },
    template: pollutantInfoPanelTemplate
});


class AQIMobileMenu {
    constructor(parent, params) {
        this.print = params.print;
        this.mapLink = params.mapLink;
        this.showInfoPopup = parent.showInfoPopup;
        this.showSocialButtons = ko.observable(false);
        this.alertIcon = alertIcon;
        this.alertStatus = alertStatus;
        this.alertMode = alertMode;
    }
    onAdd(map) {
        const doc = parser.parseFromString(mobileMenuTemplate, "text/html");
        const el = doc.body.removeChild(doc.body.firstChild);
        this.map = map;
        this.container = el;

        ko.applyBindingsToDescendants(this, this.container);

        return this.container;
    }
    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}

export default ko.components.register('AQIForecast', {
    viewModel: function(params) {
        const rootUrl = params.rootURL || config.prodRoot;
        if (fetchData) fetchData(rootUrl);
        const zones = [
            'Eastern Zone',
            'Coastal and Central Bay',
            'Northern Zone',
            'South Central Bay',
            'Santa Clara Valley'
        ];
        this.showInfoPopup = params.showInfoPopup;
        this.aqiData = aqiData;
        this.alertMode = alertMode;
        this.alertStatus = alertStatus;
        params.alertActive(alertStatus());
        alertStatus.subscribe((status) => {
            params.alertActive(status);
        });
        this.alertIcon = alertIcon;
        this.day = day;
        this.layers = {
            aqi: {
                flag: ko.observable(true),
                names: [
                    'aqi-forecast-zones-fill',
                    'aqi-forecast-zones',
                    // 'aqi-forecast-zones-outline',
                    'aqi-forecast-zones-labels'
                ]
            },
            district: {
                flag: ko.observable(true),
                names: [
                    'aqi-forecast-sta-fill',
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
        layers = this.layers;

        this.popupLayers = ['aqi-forecast-zones-fill'];
        this.getPopupData = (feature) => {
            return {
                name: feature.properties.zone.replace('Coastal', 'Coast'),
                aqiData: this.aqiData().zones[feature.properties.zone],
                lastUpdated: this.aqiData().lastUpdated,
                day: this.day,
                showInfoPanel: params.showInfoPanel,
                aboutForecast: aboutForecast
            };
        };
        this.popupTemplate = popupTemplate;

        this.day.subscribe((day) => {
            const map = this.map();
            const alertOpacity = alertStatus() ? 1 : 0;
            if (typeof day === 'number') {
                zones.forEach((zone, i) => {
                    const aqi = this.aqiData().dates[day].zones.find((z) => {
                        return z.title === zone;
                    });
                    map.setFeatureState({
                        id: i + 1,
                        source: 'composite',
                        sourceLayer: 'reportingzones'
                    }, {
                        forecast: aqi.forecast
                    });
                });
            }

            map.setPaintProperty('aqi-forecast-sta-fill', 'fill-opacity', alertOpacity);
        }, this);

        const aqiFooterPositions = [
            'aqi-default-pos',
            'aqi-mid-pos',
            'aqi-full-pos'
        ];
        this.aqiFooterPosition = ko.observable(0);
        this.aqiFooterClass = ko.computed(() => {
            return aqiFooterPositions[this.aqiFooterPosition()];
        });
        this.expandAQIFooter = () => {
            this.aqiFooterPosition(this.aqiFooterPosition() + 1);
        };
        this.collapseAQIFooter = () => {
            this.aqiFooterPosition(this.aqiFooterPosition() - 1);
        };
        var getTodaysDay = () => {
            let aqiData = this.aqiData();
            let today = new Date();
            let day = 0;
            today = today.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
            aqiData.dates.forEach((date, i) => {
                if (today === date.date) day = i;
            });
            return day;
        };
        this.setupMap = () => {
            if (this.aqiData()) {
                this.day(getTodaysDay());
            } else {
                let updateOnFetch = this.aqiData.subscribe(() => {
                    this.day(getTodaysDay());
                    updateOnFetch.dispose();
                });
            }
            this.layers.counties.flag(false);
        };

        const updateForMobile = this.day.subscribe(() => {
            if (this.mobileMode) {
                const map = this.map();
                map.addControl(new AQIMobileMenu(this, params), 'top-left');
                if (this.mobileFullscreen) {
                    const doc = parser.parseFromString(aqiFooterTemplate, "text/html");
                    const el = doc.body.removeChild(doc.body.firstChild);

                    map.getContainer().appendChild(el);

                    ko.applyBindingsToDescendants(this, el);
                }
            }

            updateForMobile.dispose();
        });

        this.showSTAModal = () => {
            const alertMode = this.alertMode();
            if (alertMode !== 'none') {
                params.showInfoPanel(alertMode === 'winter' ? 'WinterModal' : 'SummerModal');
            }
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
