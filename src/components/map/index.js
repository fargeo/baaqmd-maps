import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.min';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as template from './template.html';
import * as config from '../../config.json';
import '../../bindings/mapbox-gl';
import ZoomControl from '../zoom-control';
import HelpControl from '../help-control';
import FullscreenHelp from '../fullscreen-help';
let mapboxQuery = process.env.NODE_ENV === 'production' ? '' : '&fresh=true';

export default ko.components.register('map', {
    viewModel: function(params) {
        let duration;
        this.detailsExpanded = params.detailsExpanded || ko.observable(false);
        this.accessToken = params.accessToken || config.accessToken;
        mapboxQuery = '?access_token=' + this.accessToken + mapboxQuery;

        this.style = config.apiURI + config.mapTypes[params.mapType()].style + mapboxQuery;
        this.customAttribution = '<a href="http://www.baaqmd.gov" target="_blank">© BAAQMD</a>';
        this.isFullscreen = ko.observable(false);
        this.isFullscreen.subscribe((isFullscreen) => {
            if (this.map && this.fullscreenControl) {
                if (this.fullscreenControl._fullscreen !== isFullscreen) {
                    this.fullscreenControl._onClickFullscreen();
                }
            }
        });

        this.setupMap = (map) => {
            this.map = map;

            map.addControl(new MapboxGeocoder({
                bbox: config.bounds,
                accessToken: mapboxgl.accessToken,
                placeholder: "Enter address..."
            }));
            map.addControl(new ZoomControl());
            map.addControl(new mapboxgl.NavigationControl({showZoom: false}));
            map.addControl(new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            }));
            this.fullscreenControl = new mapboxgl.FullscreenControl({
                container: params.container
            });
            map.addControl(this.fullscreenControl);
            map.addControl(new mapboxgl.ScaleControl({
                unit: 'imperial'
            }));
            map.addControl(new HelpControl(params.showInfoPanel, params.rootURL));
            map.addControl(new FullscreenHelp(this.fullscreenControl));
            window.document.addEventListener(this.fullscreenControl._fullscreenchange, () => {
                this.isFullscreen(this.fullscreenControl._fullscreen);
            });
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
