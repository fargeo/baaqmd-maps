import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';

export default function MapDetailsPanel(params) {
    this.mapType = params.mapType;
    this.map = params.map;
    this.showInfoPanel = params.showInfoPanel;
    var setupMap = (map) => {
        if (this.getPopupData && this.popupLayers) {
            let click = (e) => {
                if (this.popupTemplate) {
                    const feature = e.features[0];
                    const p = new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(this.popupTemplate)
                        .addTo(map);
                    let popupData = this.getPopupData(feature)
                    let popupBody = p._content.querySelector('.baaqmd-maps-popup')
                    if (popupBody) {
                        popupData.scrolledToBottom = ko.observable(false);
                        popupBody.onscroll = function() {
                            let scrolledToBottom = popupBody.scrollTop >= (popupBody.scrollHeight - popupBody.offsetHeight);
                            popupData.scrolledToBottom(scrolledToBottom);
                        }
                    }
                    ko.applyBindingsToDescendants(popupData, p._content);
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
                })
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

    }
    if (this.map()){
        setTimeout(() => {
            setupMap(this.map());
        }, 200)
    }
    this.map.subscribe((mapType) => {
        setupMap(this.map());
    });
};
