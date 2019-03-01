import * as ko from 'knockout';
import * as template from './template.html';

export default ko.components.register('details-panel', {
    viewModel: function() {
        this.expanded = ko.observable(false);
        this.expanderText = ko.computed(() => {
            return this.expanded() ? '<<' : '>>';
        });
        this.toggleExpanded = () => {
            this.expanded(!this.expanded());
        };
    },
    template: template
});
