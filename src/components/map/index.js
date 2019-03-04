import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as template from './template.html';
import '../../bindings/mapbox-gl';
    
export default ko.components.register('map', {
    viewModel: function(params) {
        let duration;
        this.detailsExpanded = params.detailsExpanded || ko.observable(false);
        this.style = params.style || 'mapbox://styles/mapbox/streets-v9';
        this.setupMap = (map) => {
            this.map = map;
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
        };
        const resize = () => {
            this.map.resize();
            duration -= 1;
            if (duration >= 0) {
                setTimeout(resize, 1);
            }
        };
        this.detailsExpanded.subscribe(() => {
            if (this.map) {
                duration = 320;
                resize();
            }
        })
    },
    template: template
});
