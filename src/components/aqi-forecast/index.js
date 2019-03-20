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
                        forecast = 'Hazardous'
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

export default ko.components.register('AQIForecast', {
    viewModel: function(params) {
        const zones = [
            'Santa Clara Valley',
            'Northern Zone',
            'Coastal and Central Bay',
            'South Central Bay',
            'Eastern Zone'
        ];
        this.aqiData = aqiData;
        this.day = ko.observable();
        this.zone = ko.observable();

        this.day.subscribe((day) => {
            if (typeof day === 'number') {
                zones.forEach((zone, i) => {
                    const aqi = this.aqiData().dates[day].zones.find((z) => {
                        return z.title === zone;
                    });
                    this.map().setFeatureState({
                        id: i + 1,
                        source: 'composite',
                        sourceLayer: 'aqi-forecast-zones'
                    }, {
                        forecast: aqi.forecast
                    });
                })
            }
        }, this);

        this.setupMap = (map) => {
            let layerName = 'aqi-forecast-zones-fill';
            let click = (e) => {
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
            };
            let mouseenter = () => {
                map.getCanvas().style.cursor = 'pointer';
            };
            let mouseleave = () => {
                map.getCanvas().style.cursor = '';
            };

            if (this.aqiData()) {
                this.day(0);
            } else {
                let updateOnFetch = this.aqiData.subscribe(() => {
                    this.day(0);
                    updateOnFetch.dispose();
                });
            }

            map.on('click', layerName, click);
            map.on('mouseenter', layerName, mouseenter);
            map.on('mouseleave', layerName, mouseleave);

            let removeListeners = params.mapType.subscribe(() => {
                map.off('click', layerName, click);
                map.off('mouseenter', layerName, mouseenter);
                map.off('mouseleave', layerName, mouseleave);
                removeListeners.dispose();
            });
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
