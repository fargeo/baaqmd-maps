import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.min';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as template from './template.html';
import * as config from '../../config.json';
import '../../bindings/mapbox-gl';
import PrintControl from '../print-control';
import HelpControl from '../help-control';
import detectIE from '../../utils/detect-ie';
let mapboxQuery = process.env.NODE_ENV === 'production' ? '' : '&fresh=true';

export default ko.components.register('map', {
    viewModel: function(params) {
        let duration;
        this.detailsExpanded = params.detailsExpanded || ko.observable(false);
        this.accessToken = params.accessToken || config.accessToken;
        mapboxQuery = '?access_token=' + this.accessToken + mapboxQuery;

        this.style = config.apiURI + config.mapTypes[params.mapType()].style + mapboxQuery;
        this.customAttribution = '<a href="http://www.baaqmd.gov" target="_blank">© BAAQMD</a>';

        this.setupMap = (map) => {
            this.map = map;

            map.addControl(new MapboxGeocoder({
                bbox: config.bounds,
                accessToken: mapboxgl.accessToken,
                placeholder: "Enter address..."
            }));
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
            if (!detectIE()) map.addControl(new PrintControl());
            map.addControl(new HelpControl(params.showInfoPanel));
            params.map(map);

            params.mapType.subscribe((mapType) => {
                map.setStyle(config.mapTypes[mapType].style);
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

            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                this.map.dragPan.disable();

                this.map.on('touchstart', (e) => {
                    const oe = e.originalEvent;
                    if (oe && 'touches' in oe && oe.touches.length >= 2)
                        this.map.dragPan.enable();
                });
                this.map.on('dragend', () => this.map.dragPan.disable());
            }
        };

        this.mapConfig = {
            accessToken: this.accessToken,
            style: this.style,
            customAttribution: this.customAttribution,
            afterRender: this.setupMap
        };

        const searchParams = new URLSearchParams(window.location.search);
        const centerLat = searchParams.get('centerLat');
        const centerLng = searchParams.get('centerLng');
        const zoom = searchParams.get('zoom');
        if (centerLat & centerLng & zoom) {
            this.mapConfig.center = {
                lat: centerLat,
                lng: centerLng
            };
            this.mapConfig.zoom = zoom;
        } else {
            this.mapConfig.bounds = [
                [config.bounds[0], config.bounds[1]],
                [config.bounds[2], config.bounds[3]]
            ];
            this.mapConfig.fitBoundsOptions = {
                padding: config.boundsPadding
            };
        }

        const length = 40;
        const resize = () => {
            this.map.resize();
            duration -= length;
            if (duration >= 0) {
                setTimeout(resize, length);
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
