import * as ko from 'knockout';
import * as template from './template.html';
import * as MapDetailsPanel from '../map-details-panel';

export default ko.components.register('ImpactedCommunities', {
    viewModel: function(params) {
        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
