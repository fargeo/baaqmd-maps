import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as config from '../../config.json';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';

const aqiData = ko.observable();
fetch(config.aqiRSSFeed)
    .then((response) => {
        return response.text();
    })
    .then((text) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");
        const dates = [];
        const zones = {};
        xmlDoc.querySelectorAll("item").forEach((item) => {
            let itemData = {
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
                        forcast = 'Hazardous'
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

                itemData.zones.push(zoneData);
                if (!zones[zoneData.title]) {
                    zones[zoneData.title] = [];
                }
                zones[zoneData.title].push(Object.assign({
                    date: itemData.date
                }, zoneData));
            });
            dates.push(itemData);
        });
        console.log(dates);
        aqiData({
            dates: dates,
            zones: zones,
            lastUpdated: new Date(xmlDoc.querySelector('lastUpdated').innerHTML)
        });
    });

export default ko.components.register('AQIForecast', {
    viewModel: function(params) {
        const zones = [
            "Eastern Zone",
            "Coastal and Central Bay",
            "South Central Bay",
            "Northern Zone",
            "Santa Clara Valley"
        ];
        this.aqiData = aqiData;
        this.day = ko.observable(0);
        this.zone = ko.observable();
        this.dayData = ko.computed(() => {
            return this.aqiData().dates[this.day()];
        }, this);
        this.popup = ko.observable();

        this.updateDay = () => {
            const day = this.dayData();
            zones.forEach((zone, i) => {
                const forecastData = day.zones.find((zoneData) => {
                    return zoneData.title === zone;
                });
                this.map().setFeatureState({
                    id: i + 1,
                    source: "composite",
                    sourceLayer: "aqi-forecast-zones"
                }, {
                    forecast: forecastData.forecast
                });
            })
        };

        this.setupMap = (map) => {
            if (this.aqiData()) {
                this.updateDay();
            } else {
                this.aqiData.subscribe(() => {
                    this.updateDay();
                });
            }

            map.on('click', 'aqi-forecast-zones-fill', (e) => {
                const feature = e.features[0];
                const p = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(popupTemplate)
                    .addTo(map);

                this.zone(feature);
                ko.applyBindingsToDescendants({
                    name: feature.properties.Name,
                    aqiData: this.aqiData().zones[feature.properties.Name],
                    lastUpdated: this.aqiData().lastUpdated,
                    day: this.day
                }, p._content);
            });

            map.on('mouseenter', 'aqi-forecast-zones-fill', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'aqi-forecast-zones-fill', () => {
                map.getCanvas().style.cursor = '';
            });
        };

        this.day.subscribe(this.updateDay, this);

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
