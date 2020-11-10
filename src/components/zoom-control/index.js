import * as template from './template.html';

export default class ZoomControl {
    onAdd(map){
        const parser = new DOMParser();
        const doc = parser.parseFromString(template, "text/html");
        const el = doc.body.removeChild(doc.body.firstChild);
        this.map = map;
        this.container = el;

        this.container.querySelector('.zoom-hover .mapboxgl-ctrl-zoom-out').onclick = function() {
            map.zoomOut();
        };

        this.container.querySelector('.zoom-hover .mapboxgl-ctrl-zoom-in').onclick = function() {
            map.zoomIn();
        };
        return this.container;
    }
    onRemove(){
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}
