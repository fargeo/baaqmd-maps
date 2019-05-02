import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.min';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as template from './template.html';
import * as config from '../../config.json';
import '../../bindings/mapbox-gl';
import PrintControl from '../print-control';
import HelpControl from '../help-control';
let mapboxQuery = '?access_token=' + config.accessToken;
mapboxQuery += process.env.NODE_ENV === 'production' ? '' : '&fresh=true';

export default ko.components.register('map', {
    viewModel: function(params) {
        let duration;
        this.detailsExpanded = params.detailsExpanded || ko.observable(false);

        this.style = config.apiURI + config.mapTypes[params.mapType()].style + mapboxQuery;

        this.setupMap = (map) => {
            // District bounds:
            let x1 = -123.02428294899994;
            let y1 = 36.89298098100005;
            let x2 = -121.20819094099994;
            let y2 = 38.86425008600003;

            let cameraOpts = {padding: 80};

            this.map = map;

            map.jumpTo(map.cameraForBounds([[x1, y1], [x2, y2]], cameraOpts));
            map.addControl(new MapboxGeocoder({
                bbox: [x1, y1, x2, y2],
                accessToken: mapboxgl.accessToken,
                placeholder: "Enter address..."
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
            map.addControl(new mapboxgl.ScaleControl({
                unit: 'imperial'
            }));
            map.addControl(new PrintControl());
            map.addControl(new HelpControl(params.showInfoPanel));
            params.map(map);

            params.mapType.subscribe((mapType) => {
                map.setStyle(config.mapTypes[mapType].style);
                map.jumpTo(map.cameraForBounds([[x1, y1], [x2, y2]], cameraOpts));
            });
            config.mapTypes[params.mapType()].style = map.getStyle();

            for (let mapType in config.mapTypes) {
                if (mapType !== params.mapType()) {
                    fetch(config.apiURI + config.mapTypes[mapType].style + mapboxQuery)
                        .then((response) => { return response.json(); })
                        .then((json) => {
                            config.mapTypes[mapType].style = json;
                        });
                }
            }
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
