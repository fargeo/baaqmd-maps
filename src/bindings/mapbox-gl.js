import config from '../config.json';
import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';

ko.bindingHandlers.mapboxgl = {
    init: function(element, valueAccessor) {
        const options = Object.assign(
            {},
            config,
            ko.unwrap(valueAccessor()) || {},
            {
                container: element,
                preserveDrawingBuffer: true
            }
        );
        mapboxgl.accessToken = options.accessToken || config.accessToken;
        let map = new mapboxgl.Map(options);
        let fsEvents = [
            'webkitfullscreenchange',
            'fullscreenchange',
            'mozfullscreenchange',
            'MSFullscreenChange'
        ];
        fsEvents.forEach((event) => {
            document.addEventListener(event, () => map.resize());
        });
        map.on('load', function() {
            if (typeof options.afterRender === 'function') {
                options.afterRender(map);
            }
        });
    }
};

export default ko.bindingHandlers.mapboxgl;
