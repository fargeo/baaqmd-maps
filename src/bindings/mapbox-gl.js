import * as config from '../config.json';
import * as ko from 'knockout';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as mapboxgl from 'mapbox-gl';

ko.bindingHandlers.mapboxgl = {
    init: function(element, valueAccessor) {
        const options = Object.assign(ko.unwrap(valueAccessor()) || {}, {
            container: element
        });
        mapboxgl.accessToken = options.accessToken || config.accessToken;
        let map = new mapboxgl.Map(options);
        map.on('load', function() {
            if (typeof options.afterRender === 'function') {
                options.afterRender(map);
            }
        });
    }
};

export default ko.bindingHandlers.mapboxgl;