import * as ko from 'knockout';
import * as template from './template.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';

export default ko.components.register('OpenBurning', {
    viewModel: function(params) {
        this.setupMap = (map) => {
            // setup map here...
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
