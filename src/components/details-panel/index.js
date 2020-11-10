import * as ko from 'knockout';
import * as config from '../../config.json';
import * as template from './template.html';
import * as computedStyleToInlineStyle from 'computed-style-to-inline-style';
import detectIE from '../../utils/detect-ie';
import '../../bindings/choices';

export default ko.components.register('details-panel', {
    viewModel: function(params) {
        this.expanded = params.expanded || ko.observable(false);
        this.enableMapTypeSelector = params.enableMapTypeSelector;
        this.rootURL = params.rootURL;
        this.detailsActive = params.detailsActive;
        this.mapTypeSelector = ko.observable();
        this.mapTypeSelectorExpanded = ko.observable();
        this.toggleMapTypeSelector = () => {
            window.mapTypeSelector = this.mapTypeSelector();
            window.mapTypeSelector.showDropdown();
        };
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
        const getMapLink = () => {
            const searchParams = new URLSearchParams();
            if (this.map()) {
                const center = this.map().getCenter();
                searchParams.set('centerLat', center.lat);
                searchParams.set('centerLng', center.lng);
                searchParams.set('zoom', this.map().getZoom());
            }
            searchParams.set('mapType', params.mapType());
            return config.mainMapPage + `?${searchParams.toString()}`;
        };
        let printData;
        let mapboxLogo;
        this.print = function() {
            let map = this.map();
            if (map && !detectIE()) {
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
            }
        };
        this.map.subscribe(map => {
            if (map) {
                this.mapLink(getMapLink());
                map.on('moveend', () => {
                    this.mapLink(getMapLink());
                });
                mapboxLogo = map._container.querySelector('.mapboxgl-ctrl-logo');
                computedStyleToInlineStyle(
                    mapboxLogo,
                    { recursive: true }
                );
                map.on('moveend', () => {
                    printData = map.getCanvas().toDataURL("image/jpeg");
                });
                map.on('resize', () => {
                    printData = map.getCanvas().toDataURL("image/jpeg");
                });
            }
        });
        this.mapType.subscribe(() => {
            this.mapLink(getMapLink());
        });
        this.mapLink = ko.observable(getMapLink());
    },
    template: template
});
