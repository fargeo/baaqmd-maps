import * as template from './template.html';
import * as computedStyleToInlineStyle from 'computed-style-to-inline-style';

console.log(computedStyleToInlineStyle)

export default class PrintControl {
    onAdd(map){
        const parser = new DOMParser();
        const doc = parser.parseFromString(template, "text/html");
        const el = doc.body.removeChild(doc.body.firstChild);
        this.map = map;
        this.container = el;

        let mapboxLogo = map._container.querySelector('.mapboxgl-ctrl-logo');
        computedStyleToInlineStyle(
            mapboxLogo,
            { recursive: true }
        );

        let printData;
        this.container.onclick = function() {
            const mywindow = window.open('', 'BAAQMD Maps', 'height=600,width=800');
            const img = new Image();
            const logo = new Image();
            logo.src = mapboxLogo.style.backgroundImage.slice(
                5,
                mapboxLogo.style.backgroundImage.length - 2
            )
            console.log(logo.src);
            if (!printData) {
                printData = map.getCanvas().toDataURL("image/jpeg");
            }
            img.src = printData;
            img.style.width = '100%';
            logo.style.width = '100px';

            mywindow.document.write('<html><head><title>BAAQMD Maps</title>');
            mywindow.document.write('</head><body>');
            mywindow.document.write(img.outerHTML);
            mywindow.document.write(
                '<div style="position:absolute;bottom:20px;left:20px;z-index:200">' + logo.outerHTML + '</div>' +
                '<div style="float:right;font-family:sans-serif;position:absolute;bottom:20px;right:20px;z-index:200">' +
                    '<span>© Mapbox</span>&nbsp;<span>© OpenStreetMap</span>' +
                '</div>'
            );
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
