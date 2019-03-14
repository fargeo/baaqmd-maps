import * as ko from 'knockout';
import * as template from './template.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';
const parser = new DOMParser();

export default ko.components.register('AQIForecast', {
    viewModel: function(params) {
        const zones = [
            "Eastern Zone",
            "Coastal and Central Bay",
            "South Central Bay",
            "Northern Zone",
            "Santa Clara Valley"
        ];
        this.setDate = (day) => {
            const dayData = this.aqiData[day-1];
            zones.forEach((zone, i) => {
                const forecastData = dayData.zones.find((zoneData) => {
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
        }

        this.setupMap = (map) => {
            fetch('http://www.baaqmd.gov/Files/Feeds/aqi_rss.xml')
                .then((response) => { return response.text(); })
                .then((text) => {
                    const xmlDoc = parser.parseFromString(text, "application/xml");
                    const data = [];
                    xmlDoc.querySelectorAll("item").forEach((item) => {
                        let itemData = {
                            date: item.querySelector('date').innerHTML,
                            zones: []
                        };
                        item.querySelectorAll('zone').forEach((zone) => {
                            let measurement = zone.querySelector('measurement').innerHTML;
                            let forecast;
                            if (!isNaN(parseFloat(measurement))) {
                                measurement = parseFloat(measurement);
                                switch (measurement) {
                                    case measurement <= 50:
                                        forecast = 'Good';
                                        break;
                                    case measurement >= 51 && measurement <= 100:
                                        forecast = 'Moderate';
                                        break;
                                    case measurement >= 101 && measurement <= 150:
                                        forecast = 'Unhealthy_Sensitive';
                                        break;
                                    case measurement >= 151 && measurement <= 200:
                                        forecast = 'Unhealthy';
                                        break;
                                    case measurement >= 201 && measurement <= 300:
                                        forecast = 'Very_Unhealthy';
                                        break;
                                    default:

                                }
                                forecast = 'Good';
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
                    this.aqiData = data;
                    this.setDate(1);
                });
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
