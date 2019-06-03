import * as ko from 'knockout';
import * as template from './template.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';

export default ko.components.register('Facilities', {
    viewModel: function(params) {
        this.setupMap = () => {
            // setup map here...
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
