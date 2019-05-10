import * as ko from 'knockout';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as infoPanelTemplate from './info-panel.html'
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';

ko.components.register('ImpactedCommunitiesInfoPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
    },
    template: infoPanelTemplate
});

export default ko.components.register('ImpactedCommunities', {
    viewModel: function(params) {
        this.layers = {
            impacted: {
                flag: ko.observable(true),
                names: [
                    'impacted-communities-2013'
                ]
            },
            pm25: {
                flag: ko.observable(true),
                names: [
                    'pm25-exceedance-areas'
                ]
            },
            ozone: {
                flag: ko.observable(true),
                names: [
                    'ozone-exceedance-areas'
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
            'impacted-communities-2013',
            'pm25-exceedance-areas',
            'ozone-exceedance-areas'
        ];

        this.getPopupData = (feature) => {
            let area = '';
            let description = '';
            switch (feature.layer.id) {
                case 'impacted-communities-2013':
                    area = '2013 Cumulative Impact';
                    description = 'Areas where toxic air contaminants, fine particulate matter, and ozone are estimated to have the greatest impacts on health.';
                    break;
                case 'pm25-exceedance-areas':
                    area = '24 Hour P2.5 Exceedance';
                    description = 'Areas where 24-hour fine particulate matter (PM2.5) levels exceeded the federal standard (35 mg/ m3) during three recent winters (2010-2012).';
                    break;
                case 'ozone-exceedance-areas':
                    area = '8 Hour Ozone Exceedance';
                    description = 'Areas where 8-hour ozone levels exceeded the federal standard (75 ppb) three or more times during three recent summers (2011-2013).';
                    break;
            }

            return {
                name: feature.properties.Name,
                area: area,
                description: description
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
