import * as ko from 'knockout';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';
import * as config from '../../config.json';
import * as historicalSiteInfoTemplate from './historical-site-info.html';
import fetchHTML from '../../utils/fetch-html'

const airDistrictStationData = fetchHTML(config.airDistrictStationDataURL);
const facilityGLMStationData = fetchHTML(config.facilityGLMStationDataURL);
const meteorologicalSiteData = fetchHTML(config.meteorologicalSiteDataURL);

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
            let siteType = '';
            let about = '';
            const attributeList = [
                ["Site ID", "StationID"],
                ["Site Name", "Name"],
                ["Start Date", "StartDate"],
                ["End Date", "EndDate"],
                ["Latitude", "Latitude"],
                ["Longitude", "Longitude"],
                ["Elevation", "Elevation"],
                ["UTM East", "utmEast"],
                ["UTM North", "utmNorth"],
                ["Location", "location"],
                ["Operator", "operator"],
                ["Wind Height", "windHeight"],
                ["County", "county"]
            ].map((attr) => {
                return {
                    name: attr[0],
                    value: feature.properties[attr[1]]
                };
            });

            switch (feature.layer.id) {
                case 'air-monitoring':
                    siteType = 'Air Monitoring';
                    about = airDistrictStationData;
                    break;
                case 'facility-glm-stations':
                    siteType = 'Facility GLM Stations';
                    about = facilityGLMStationData;
                    break;
                case 'meteorological-sites':
                    siteType = 'Meteorological Sites';
                    about = meteorologicalSiteData;
                    break;
            }

            return {
                name: feature.properties.Name,
                siteType: siteType,
                about: about,
                attributeList: attributeList,
                showHistoricalSiteInfo: () => {
                    let url = config.historicalAirMonitoringDataURL + feature.properties.StationID;
                    fetchHTML(url, historicalData);
                    this.showInfoPanel('HistoricalDataPanel');
                }
            };
        };

        this.popupTemplate = popupTemplate;

        this.setupMap = (map) => {
            this.layers.counties.flag(false);
            this.layers.facilityGLMStations.flag(false);
            this.layers.meteorologicalSites.flag(false);
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
