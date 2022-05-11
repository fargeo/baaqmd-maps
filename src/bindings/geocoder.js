import config from '../config.json';
import * as ko from 'knockout';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.min';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as mapboxgl from 'mapbox-gl';

ko.bindingHandlers.geocoder = {
    map: null,
    init: function(element, valueAccessor) {
        const value = valueAccessor();
        let map = ko.unwrap(value.map);
        let geocoder;
        function setup(element) {
            geocoder = new MapboxGeocoder({
                bbox: config.districtBounds,
                accessToken: mapboxgl.accessToken,
                placeholder: "Enter address to add pin...",
                mapboxgl: mapboxgl
            });
            value.geocoder(geocoder);

            element.appendChild(geocoder.onAdd(map));
        }
        if (map) {
            setup(element);
        } else {
            value.map.subscribe((newValue) => {
                map = newValue;
                setup(element);
            });
        }
    }
};

export default ko.bindingHandlers.geocoder;
