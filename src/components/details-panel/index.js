import * as ko from 'knockout';
import * as config from '../../config.json';
import * as template from './template.html';
import '../../bindings/choices';

export default ko.components.register('details-panel', {
    viewModel: function(params) {
        this.expanded = params.expanded || ko.observable(false);
        this.enableMapTypeSelector = params.enableMapTypeSelector;
        this.showInfoPanel = params.showInfoPanel;
        if (typeof params.enableMapTypeSelector !== 'boolean') {
            this.enableMapTypeSelector = true;
        }
        this.expanderText = ko.pureComputed(() => {
            return this.expanded() ? '<<' : '>>';
        });
        this.toggleExpanded = () => {
            this.expanded(!this.expanded());
        };
        this.mapTypesObj = config.default.mapTypes;
        this.mapTypes = [];
        for (let key in this.mapTypesObj) {
            this.mapTypes.push({
                id: key,
                text: this.mapTypesObj[key].label
            });
        }
        this.mapType = params.mapType;
        this.map = params.map;
    },
    template: template
});
