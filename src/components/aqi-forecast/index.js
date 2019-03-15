import * as ko from 'knockout';
import * as template from './template.html';
import * as config from '../../config.json';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';

const aqiData = ko.observable();
fetch(config.aqiRSSFeed)
    .then((response) => { return response.text(); })
    .then((text) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");
        const data = [];
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
                    if (measurement <= 50){
                        forecast = 'Good';
                    } else if (measurement >= 51 && measurement <= 100) {
                        forecast = 'Moderate';
                    } else if (measurement >= 101 && measurement <= 150) {
                        forecast = 'Unhealthy for Sensitive Groups';
                    } else if (measurement >= 151 && measurement <= 200) {
                        forecast = 'Unhealthy';
                    } else if (measurement >= 201 && measurement <= 300) {
                        forecast = 'Very Unhealthy';
                    } else if (measurement >= 301 && measurement <= 500){
                        forcast = 'Hazardous'
                    }
                } else {
                    forecast = measurement;
                    measurement = null;
                }

                itemData.zones.push({
                    title: zone.querySelector('title').innerHTML,
                    measurement: measurement,
                    pollutant: zone.querySelector('pollutant').innerHTML,
                    forecast: forecast
                })
            });
            data.push(itemData);
        });
        aqiData(data);
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

        this.updateDay = () => {
            const day = this.aqiData()[this.day()];
            zones.forEach((zone, i) => {
                const forecastData = day.zones.find((zoneData) => {
                    return zoneData.title === zone;
                });
                this.map().setFeatureState({
                    id: i+1,
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
        };

        this.day.subscribe(this.updateDay, this);

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
