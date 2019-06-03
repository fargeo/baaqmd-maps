import * as template from './template.html';
import * as computedStyleToInlineStyle from 'computed-style-to-inline-style';

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
            const printWindow = window.open('', 'BAAQMD Maps', 'height=600,width=800');
            const img = new Image();
            const logo = new Image();
            logo.src = mapboxLogo.style.backgroundImage.slice(
                5,
                mapboxLogo.style.backgroundImage.length - 2
            );
            if (!printData) {
                printData = map.getCanvas().toDataURL("image/jpeg");
            }
            img.src = printData;
            img.style.width = '100%';
            logo.style.width = '100px';

            printWindow.document.write('<html><head><title>BAAQMD Maps</title>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(img.outerHTML);
            printWindow.document.write(
                '<div style="position:absolute;bottom:10px;left:15px;z-index:200">' + logo.outerHTML + '</div>' +
                '<div style="float:right;font-family:sans-serif;position:absolute;bottom:0;right:0;z-index:200;background-color:white;padding:10px;">' +
                    '<span>© Mapbox</span>&nbsp;<span>© OpenStreetMap</span>' +
                '</div>'
            );
            printWindow.document.write('</body></html>');

            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 150);
        };
        map.on('moveend', () => {
            printData = map.getCanvas().toDataURL("image/jpeg");
        });
        map.on('resize', () => {
            printData = map.getCanvas().toDataURL("image/jpeg");
        });
        return this.container;
    }
    onRemove(){
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}
