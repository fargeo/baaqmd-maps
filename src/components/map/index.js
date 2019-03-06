import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.min';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as template from './template.html';
import * as config from '../../config.json';
import '../../bindings/mapbox-gl';


export default ko.components.register('map', {
    viewModel: function(params) {
        let duration;
        const mapSetup = {
            "AQIForecast": (map) => {
                return;
            },
            "Facilities": (map) => {
                return;
            },
            "ImpactedCommunities": (map) => {
                return;
            },
            "Monitoring": (map) => {
                return;
            },
            "OpenBurning": (map) => {
                return;
            }
        }
        this.detailsExpanded = params.detailsExpanded || ko.observable(false);

        this.style = config.mapTypes[params.mapType()].style || 'mapbox://styles/mapbox/streets-v9';

        this.setupMap = (map) => {
            this.map = map;
            map.addControl(new MapboxGeocoder({
                // bbox: [139.965, -38.030, 155.258, -27.839],
                accessToken: mapboxgl.accessToken
            }))
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
            params.map(map);

            params.mapType.subscribe((mapType) => {
                this.style = config.mapTypes[params.mapType()].style || 'mapbox://styles/mapbox/streets-v9';
                map.setStyle(this.style);
                map.on('load', function() {
                    mapSetup[params.mapType()](map);
                });
            });

            mapSetup[params.mapType()](map);
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
        });
    },
    template: template
});
