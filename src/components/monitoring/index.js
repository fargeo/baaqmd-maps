import * as ko from 'knockout';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';
import config from '../../config.json';
import * as siteDocs from '../../../data/sites/docs.json';
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
        this.historicalDocRootURL = config.historicalDocRootURL;
        this.docTypes = ['ascii', '300', '600'];
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
            meteorologicalSitesHistorical: {
                flag: ko.observable(true),
                names: [
                    'meteorological-sites-historical'
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
            'meteorological-sites',
            'meteorological-sites-historical'
        ];

        this.getPopupData = (feature) => {
            const docData = siteDocs.default[feature.properties.Site_ID+''];
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
            case 'meteorological-sites-historical':
                siteType = 'Meteorological Sites';
                about = meteorologicalSiteData;
                break;
            }

            return {
                properties: feature.properties,
                siteType: siteType,
                about: about,
                historicalData: docData,
                showHistoricalSiteInfo: () => {
                    historicalData(
                        Object.keys(docData).map((year) => {
                            docData[year].year = year;
                            return docData[year];
                        })
                    );
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
            this.layers.meteorologicalSitesHistorical.flag(false);
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
