import * as ko from 'knockout';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';
import * as config from '../../config.json';
import * as historicalSiteInfoTemplate from './historical-site-info.html'

const parser = new DOMParser();

const fetchSiteData = (url, data) => {
    if (!data) data = ko.observable();
    fetch(url)
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            const doc = parser.parseFromString(text, 'application/xml');
            return data(doc.querySelector('body').innerHTML);
        });
    return data;
}

const airDistrictStationData = fetchSiteData(config.airDistrictStationDataURL);
const facilityGLMStationData = fetchSiteData(config.facilityGLMStationDataURL);
const meteorologicalSiteData = fetchSiteData(config.meteorologicalSiteDataURL);

let historicalData = ko.observable();
ko.components.register('HistoricalDataPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.historicalData = historicalData;
    },
    template: historicalSiteInfoTemplate
});

export default ko.components.register('Monitoring', {
    viewModel: function(params) {
        this.layers = {
            airMonitoring: {
                flag: ko.observable(true),
                names: [
                    'air-monitoring'
                ]
            },
            facilityGLMStations: {
                flag: ko.observable(true),
                names: [
                    'facility-glm-stations'
                ]
            },
            meteorologicalSites: {
                flag: ko.observable(true),
                names: [
                    'meteorological-sites'
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

        this.popupLayers = [
            'air-monitoring',
            'facility-glm-stations',
            'meteorological-sites'
        ];

        this.getPopupData = (feature) => {
            let area = '';
            let description = '';
            let feedData = '';
            const attributeList = [{
                    name: "Site ID",
                    value: feature.properties.StationID
                },
                {
                    name: "Site Name",
                    value: feature.properties.Name
                },
                {
                    name: "Start Date",
                    value: feature.properties.StartDate
                },
                {
                    name: "End Date",
                    value: feature.properties.EndDate
                },
                {
                    name: "Latitude",
                    value: feature.properties.Latitude
                },
                {
                    name: "Longitude",
                    value: feature.properties.Longitude
                },
                {
                    name: "Elevation",
                    value: feature.properties.Elevation
                },
                {
                    name: "UTM East",
                    value: feature.properties.utmEast
                },
                {
                    name: "UTM North",
                    value: feature.properties.utmNorth
                },
                {
                    name: "Location",
                    value: feature.properties.location
                },
                {
                    name: "Operator",
                    value: feature.properties.operator
                },
                {
                    name: "Wind Height",
                    value: feature.properties.windHeight
                },
                {
                    name: "County",
                    value: feature.properties.county
                }
            ];

            this.showHistoricalSiteInfo = (id) => {
                historicalData(undefined);
                fetchSiteData(config.historicalAirMonitoringDataURL + feature.properties.StationID, historicalData);
                this.showInfoPanel('HistoricalDataPanel');
            }

            switch (feature.layer.id) {
                case 'air-monitoring':
                    area = 'Air Monitoring';
                    feedData = airDistrictStationData;
                    break;
                case 'facility-glm-stations':
                    area = 'Facility GLM Stations';
                    feedData = facilityGLMStationData;
                    break;
                case 'meteorological-sites':
                    area = 'Meteorological Sites';
                    feedData = meteorologicalSiteData;
                    break;
            }

            return {
                name: feature.properties.Name,
                area: area,
                description: description,
                feedData: feedData,
                attributeList: attributeList,
                showInfoPanel: params.showInfoPanel,
                id: feature.properties.id,
                showHistoricalSiteInfo: this.showHistoricalSiteInfo
            };
        };

        this.popupTemplate = popupTemplate;


        this.setupMap = (map) => {
            this.layers.counties.flag(false);
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
