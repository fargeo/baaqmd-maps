import * as ko from 'knockout';
import * as template from './template.html';
import './aqi-forecast/';
import './facilities/';
import './impacted-communities/';
import './monitoring/';
import './open-burning/';

export default ko.components.register('details-panel', {
    viewModel: function(params) {
        this.expanded = params.expanded || ko.observable(false);
        this.expanderText = ko.pureComputed(() => {
            return this.expanded() ? '<<' : '>>';
        });
        this.toggleExpanded = () => {
            this.expanded(!this.expanded());
        };
        this.mapType = params.mapType;
        this.map = params.map;
    },
    template: template
});
