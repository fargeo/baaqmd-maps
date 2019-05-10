import * as ko from 'knockout';
import * as template from './template.html';
import * as helpTemplate from './help.html'

ko.components.register('MapHelpPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
    },
    template: helpTemplate
});


export default class HelpControl {
    constructor(showInfoPanel) {
        this.showInfoPanel = showInfoPanel;
    }
    onAdd(map){
        const self = this;
        const parser = new DOMParser();
        const doc = parser.parseFromString(template, "text/html");
        const el = doc.body.removeChild(doc.body.firstChild);
        this.map = map;
        this.container = el;
        this.container.onclick = function() {
            self.showInfoPanel('MapHelpPanel');
        }

        return this.container;
    }
    onRemove(){
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}
