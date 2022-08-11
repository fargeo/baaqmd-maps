import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as scrollForMoreTemplate from '../templates/scroll-for-more.html';

let popupComponents = [];
let popupData;
export default function MapDetailsPanel(params) {
    const popupComponent = params.mapType() + 'Popup';
    this.popup;
    this.mapType = params.mapType;
    this.map = params.map;
    this.showInfoPanel = params.showInfoPanel;
    this.mobileMode = params.mobileMode;
    this.mobileFullscreen = params.mobileFullscreen;
    this.alertActive = params.alertActive;
    this.mainExpanded = ko.observable(true);
    this.boundariesExpanded = ko.observable(true);
    this.showPopup = (feature, lngLat) => {
        let map = this.map();
        if (map && this.popupTemplate) {
            popupData = this.getPopupData(feature);
            if (popupData) {
                popupData.showInfoPanel = params.showInfoPanel;
                var expandButton = `<button
                    class="mapboxgl-popup-expand-button"
                    title="Expand"
                    type="button"
                    data-bind="click: function() {
                        showInfoPanel('${popupComponent}');
                    }">
                        <i class="icon-Expand"></i>
                </button>`;
                this.popup = new mapboxgl.Popup()
                    .setLngLat(lngLat)
                    .setHTML(expandButton + this.popupTemplate)
                    .addTo(map);
                this.showInfoPanel.subscribe((panelComponent) => {
                    if (panelComponent === popupComponent && this.popup) {
                        params.popup(this.popup);
                    }
                });
                let popupBody = this.popup._content.querySelector('.baaqmd-maps-popup');
                this.popup._content.querySelector('.mapboxgl-popup-close-button').setAttribute('title', 'Close');
                popupData.getScrollContent = () => {
                    return popupBody;
                };
                this.popup.on('close', () => { this.popup = undefined; });
                ko.applyBindingsToDescendants(popupData, this.popup._content);
            }
        }
    };
    var setupMap = (map) => {
        if (this.getPopupData && this.popupLayers) {
            if (this.popupTemplate && !popupComponents.includes(popupComponent)) {
                ko.components.register(popupComponent, {
                    viewModel: function() {
                        if (popupData) {
                            for (var key in popupData) {
                                this[key] = popupData[key];
                            }
                        }
                    },
                    template: this.popupTemplate
                });
                popupComponents.push(popupComponent);
            }
            if (this.popupTemplate) this.popupTemplate += scrollForMoreTemplate;
            let click = (e) => {
                this.showPopup(e.features[0], e.lngLat);
            };
            let cursor = '';
            let mouseenter = () => {
                cursor = map.getCanvas().style.cursor;
                map.getCanvas().style.cursor = 'pointer';
            };
            let mouseleave = () => {
                map.getCanvas().style.cursor = cursor;
            };

            this.popupLayers.forEach((layerName) => {
                map.on('click', layerName, click);
                map.on('mouseenter', layerName, mouseenter);
                map.on('mouseleave', layerName, mouseleave);
            });

            let removeListeners = params.mapType.subscribe(() => {
                this.popupLayers.forEach((layerName) => {
                    map.off('click', layerName, click);
                    map.off('mouseenter', layerName, mouseenter);
                    map.off('mouseleave', layerName, mouseleave);
                });
                removeListeners.dispose();
            });
        }

        if (this.layers) {
            for (let key in this.layers) {
                let layer = this.layers[key];
                layer.flag.subscribe((visible) => {
                    let visibility = visible ? 'visible' : 'none';
                    layer.names.forEach((name) => {
                        map.setLayoutProperty(name, 'visibility', visibility);
                    });
                });
            }
        }

        if (this.setupMap) {
            this.setupMap(map);
        }

        this.mapType.subscribe(() => {
            if (this.popup) this.popup.remove();
            this.popup = undefined;
        });
    };
    if (this.map()){
        setTimeout(() => {
            setupMap(this.map());
        }, 200);
    }
    this.map.subscribe(() => {
        setupMap(this.map());
    });
}
