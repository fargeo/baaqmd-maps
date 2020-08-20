import * as ko from 'knockout';
import * as template from './template.html';
import * as helpTemplate from './help.html';
import * as config from '../../config.json';
import fetchHTML from '../../utils/fetch-html';

const helpContent = ko.observable();

ko.components.register('MapHelpPanel', {
    viewModel: function(params) {
        this.helpContent = helpContent;
        this.showInfoPanel = params.showInfoPanel;
    },
    template: helpTemplate
});


export default class HelpControl {
    constructor(showInfoPanel, rootURL) {
        rootURL = rootURL || config.prodRoot;
        this.showInfoPanel = showInfoPanel;
        fetchHTML(rootURL + config.helpContentURL, helpContent);
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
        };

        return this.container;
    }
    onRemove(){
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}
