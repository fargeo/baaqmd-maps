import * as ko from 'knockout';
import * as template from './template.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';

export default ko.components.register('Monitoring', {
    viewModel: function(params) {
        this.layers = {
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

        this.setupMap = (map) => {
            this.layers.counties.flag(false);
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
