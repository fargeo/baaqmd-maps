import 'mapbox-gl/dist/mapbox-gl.css';
import * as mapboxgl from 'mapbox-gl';
import './styles.css';
import * as configs from './config.json';

const env = process.env.NODE_ENV || 'development';
const config = Object.assign({}, configs.development, configs[env]);

export function map(opts) {
    const style = opts.style || 'mapbox://styles/mapbox/streets-v9';
    mapboxgl.accessToken = opts.accessToken || config.accessToken;
    
    let map = new mapboxgl.Map({
        container: opts.container,
        style: style
    });
}
