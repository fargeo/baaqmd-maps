import * as template from './template.html';

export default class MobileFullscreenControl {
    constructor() {}
    onAdd(map){
        const parser = new DOMParser();
        const doc = parser.parseFromString(template, "text/html");
        const el = doc.body.removeChild(doc.body.firstChild);
        this.map = map;
        this.container = el;
        this.container.onclick = function() {
            history.back();
        };

        return this.container;
    }
    onRemove(){
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}
