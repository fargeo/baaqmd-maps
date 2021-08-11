import * as template from './template.html';

export default class FullscreenHelp {
    constructor(fullscreenControl) {
        this.fullscreenControl = fullscreenControl;
        this.dismissed = false;
    }
    onAdd(map) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(template, "text/html");
        const el = doc.body.removeChild(doc.body.firstChild);
        this.map = map;
        this.container = el;
        this.container.style.display = "none";

        window.document.addEventListener(this.fullscreenControl._fullscreenchange, () => {
            if (!this.fullscreenControl._fullscreen) this.dismiss();
            this.container.style.display = this.dismissed ? "none" : "inline-block";
        });

        this.container.querySelectorAll('a').forEach(element => {
            element.onclick = () => {
                this.dismiss();
            };
        });

        return this.container;
    }
    dismiss() {
        this.container.style.display = "none";
        this.dismissed = true;
    }
    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}
