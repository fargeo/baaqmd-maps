import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as template from './template.html';
import '../../bindings/mapbox-gl';
    
export default ko.components.register('map', {
    viewModel: function(params) {
        this.style = params.style || 'mapbox://styles/mapbox/streets-v9';
        this.setupMap = function(map) {
            map.addControl(new mapboxgl.NavigationControl());
            map.addControl(new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            }));
            map.addControl(new mapboxgl.FullscreenControl({
                container: params.container
            }));
        }
    },
    template: template
});
