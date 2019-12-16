import * as ko from 'knockout';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';
import * as config from '../../config.json';
import * as historicalSiteInfoTemplate from './historical-site-info.html';
import fetchHTML from '../../utils/fetch-html';

const airDistrictStationData = ko.observable();
const facilityGLMStationData = ko.observable();
const meteorologicalSiteData = ko.observable();
let fetchData = (rootURL) => {
    fetchHTML(rootURL + config.airDistrictStationDataURL, airDistrictStationData);
    fetchHTML(rootURL + config.facilityGLMStationDataURL, facilityGLMStationData);
    fetchHTML(rootURL + config.meteorologicalSiteDataURL, meteorologicalSiteData);
    fetchData = false;
};

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
        const rootUrl = params.rootURL || config.prodRoot;
        if (fetchData) fetchData(rootUrl);
        this.layers = {
            airMonitoring: {
                flag: ko.observable(true),
                names: [
                    'air-monitoring'
                ]
            },
            airMonitoringHistorical: {
                flag: ko.observable(true),
                names: [
                    'air-monitoring-historical'
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
            'air-monitoring-historical',
            'facility-glm-stations',
            'meteorological-sites'
        ];

        this.getPopupData = (feature) => {
            let siteType = '';
            let about = '';

            switch (feature.layer.id) {
            case 'air-monitoring':
            case 'air-monitoring-historical':
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
                properties: feature.properties,
                siteType: siteType,
                about: about,
                showHistoricalSiteInfo: () => {
                    let url = config.historicalAirMonitoringDataURL + feature.properties.StationID;
                    fetchHTML(url, historicalData);
                    this.showInfoPanel('HistoricalDataPanel');
                }
            };
        };

        this.popupTemplate = popupTemplate;

        this.setupMap = () => {
            this.layers.counties.flag(false);
            this.layers.facilityGLMStations.flag(false);
            this.layers.meteorologicalSites.flag(false);
            this.layers.airMonitoringHistorical.flag(false);
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
