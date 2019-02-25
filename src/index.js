import 'mapbox-gl/dist/mapbox-gl.css';
import * as mapboxgl from 'mapbox-gl';
import './styles.css';
import * as configs from './config.json';

const env = process.env.NODE_ENV || 'development';
const config = Object.assign({}, configs.development, configs[env]);

export function map(opts) {
    mapboxgl.accessToken = opts.accessToken || config.accessToken;

    let map = new mapboxgl.Map({
        container: opts.container,
        style: opts.style || 'mapbox://styles/mapbox/streets-v9'
    });

    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));
    map.addControl(new mapboxgl.FullscreenControl());
}