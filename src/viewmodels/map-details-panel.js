import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as scrollForMoreTemplate from '../templates/scroll-for-more.html';

let popupComponents = [];
let popupData;
export default function MapDetailsPanel(params) {
    const popupComponent = params.mapType() + 'Popup';
    this.mapType = params.mapType;
    this.map = params.map;
    this.showInfoPanel = params.showInfoPanel;
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

            let click = (e) => {
                if (this.popupTemplate) {
                    this.popupTemplate += scrollForMoreTemplate;
                    const feature = e.features[0];
                    popupData = this.getPopupData(feature);
                    if (popupData) {
                        popupData.showInfoPanel = params.showInfoPanel;
                        var expandButton = `<button
                            class="mapboxgl-popup-expand-button"
                            type="button"
                            data-bind="click: function() {
                                showInfoPanel('${popupComponent}');
                            }">
                                <i class="fas fa-window-maximize"></i>
                        </button>`;
                        const p = new mapboxgl.Popup()
                            .setLngLat(e.lngLat)
                            .setHTML(expandButton + this.popupTemplate)
                            .addTo(map);
                        let popupBody = p._content.querySelector('.baaqmd-maps-popup');
                        popupData.scrolledToBottom = ko.observable(false);
                        if (popupBody) {
                            popupBody.onscroll = () => {
                                popupData.scrolledToBottom(
                                    popupBody.scrollTop + popupBody.offsetHeight === popupBody.scrollHeight
                                );
                            };
                        }
                        ko.applyBindingsToDescendants(popupData, p._content);
                    }
                }
            };
            let mouseenter = () => {
                map.getCanvas().style.cursor = 'pointer';
            };
            let mouseleave = () => {
                map.getCanvas().style.cursor = '';
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
