import * as ko from 'knockout';
import * as template from './template.html';
import * as MapDetailsPanel from '../map-details-panel';

export default ko.components.register('OpenBurning', {
    viewModel: function(params) {
        this.setUpMap = (map) => {
            // map specific logic can go here
        };
        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
