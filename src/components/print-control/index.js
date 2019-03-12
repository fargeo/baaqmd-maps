import * as template from './template.html';

export default class PrintControl {
    onAdd(map){
        const parser = new DOMParser();
        const doc = parser.parseFromString(template, "text/html");
        const el = doc.body.removeChild(doc.body.firstChild);
        this.map = map;
        this.container = el;

        let leftControls = map._container.querySelector('.mapboxgl-ctrl-bottom-left');

        let printData;
        this.container.onclick = function() {
            const mywindow = window.open('', 'BAAQMD Maps', 'height=600,width=800');
            const img = new Image();
            if (!printData) {
                printData = map.getCanvas().toDataURL("image/jpeg");
            }
            img.src = printData;
            img.style.width = '100%';

            mywindow.document.write('<html><head><title>Print</title>');
            mywindow.document.write('</head><body >');
            mywindow.document.write(img.outerHTML);
            mywindow.document.write('</body></html>');

            mywindow.document.close();
            mywindow.focus();
            setTimeout(() => {
                mywindow.print();
                mywindow.close();
            }, 150);
        }
        map.on('moveend', () => {
            printData = map.getCanvas().toDataURL("image/jpeg");
        });
        return this.container;
    }
    onRemove(){
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}
