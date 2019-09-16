import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as scrollForMoreTemplate from '../templates/scroll-for-more.html';

export default function MapDetailsPanel(params) {
    this.mapType = params.mapType;
    this.map = params.map;
    this.showInfoPanel = params.showInfoPanel;
    var setupMap = (map) => {
        if (this.getPopupData && this.popupLayers) {
            let click = (e) => {
                if (this.popupTemplate) {
                    this.popupTemplate += scrollForMoreTemplate;
                    const feature = e.features[0];
                    let popupData = this.getPopupData(feature);
                    if (popupData) {
                        const p = new mapboxgl.Popup()
                            .setLngLat(e.lngLat)
                            .setHTML(this.popupTemplate)
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
