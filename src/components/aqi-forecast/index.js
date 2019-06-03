import * as ko from 'knockout';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as infoPanelTemplate from './info-panel.html';
import * as pollutantInfoPanelTemplate from './pollutant-info-panel.html';
import * as forecastPanelTemplate from './forecast-panel.html';
import * as config from '../../config.json';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';
import fetchHTML from '../../utils/fetch-html';

const aqiData = ko.observable();
const parser = new DOMParser();
let alertStatus;
fetch(config.spaRSSFeed, {cache: "no-store"})
    .then((response) => {
        return response.text();
    })
    .then((text) => {
        const xmlDoc = parser.parseFromString(text, 'application/xml');
        alertStatus = xmlDoc.querySelector('item description').innerHTML.toLowerCase() !== "no alert";
        return fetch(config.aqiRSSFeed, {cache: "no-store"});
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
                date: item.querySelector('date').innerHTML.slice(0, -3),
                zones: []
            };
            item.querySelectorAll('zone').forEach((zone) => {
                let measurement = zone.querySelector('measurement').innerHTML;
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
                    title: zone.querySelector('title').innerHTML,
                    measurement: measurement,
                    pollutant: zone.querySelector('pollutant').innerHTML,
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
            lastUpdated: new Date(xmlDoc.querySelector('lastUpdated').innerHTML)
        });
    });

const aqiInfo = fetchHTML(config.aqiInfoURL);
ko.components.register('AQIInfoPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.aqiInfo = aqiInfo;
    },
    template: infoPanelTemplate
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

const pollutantInfo = fetchHTML(config.pollutantInfoURL);
ko.components.register('PollutantInfoPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.pollutantInfo = pollutantInfo;
    },
    template: pollutantInfoPanelTemplate
});

const aboutForecast = fetchHTML(config.aboutForecastURL);
export default ko.components.register('AQIForecast', {
    viewModel: function(params) {
        const zones = [
            'Eastern Zone',
            'Coastal and Central Bay',
            'Northern Zone',
            'South Central Bay',
            'Santa Clara Valley'
        ];
        this.aqiData = aqiData;
        this.day = ko.observable();
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
            if (typeof day === 'number') {
                zones.forEach((zone, i) => {
                    const aqi = this.aqiData().dates[day].zones.find((z) => {
                        return z.title === zone;
                    });
                    this.map().setFeatureState({
                        id: i + 1,
                        source: 'composite',
                        sourceLayer: 'reportingzones'
                    }, {
                        forecast: aqi.forecast
                    });
                });
            }
        }, this);

        this.setupMap = (map) => {
            if (this.aqiData()) {
                this.day(0);
            } else {
                let updateOnFetch = this.aqiData.subscribe(() => {
                    this.day(0);
                    updateOnFetch.dispose();
                });
            }

            if (alertStatus) {
                map.setPaintProperty('aqi-forecast-sta-fill', 'fill-opacity', 1);
            }
            this.layers.counties.flag(false);
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
