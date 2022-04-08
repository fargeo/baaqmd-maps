import * as ko from 'knockout';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as infoPanelTemplate from './info-panel.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';

ko.components.register('OverburdenedCommunitiesInfoPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
    },
    template: infoPanelTemplate
});

export default ko.components.register('OverburdenedCommunities', {
    viewModel: function(params) {
        this.layers = {
            district: {
                flag: ko.observable(true),
                names: [
                    'district-boundary'
                ]
            }
        };

        this.popupLayers = [
        ];

        this.getPopupData = (feature) => {
            return feature.properties;
        };

        this.popupTemplate = popupTemplate;

        this.setupMap = () => {
            // this.layers.counties.flag(false);
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
