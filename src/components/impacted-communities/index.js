import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';

export default ko.components.register('ImpactedCommunities', {
    viewModel: function(params) {
        this.layers = {
            impacted: {
                flag: ko.observable(true),
                names: [
                    'impacted-communities-2013'
                ]
            },
            pm25: {
                flag: ko.observable(true),
                names: [
                    'pm25-exceedance-areas'
                ]
            },
            ozone: {
                flag: ko.observable(true),
                names: [
                    'ozone-exceedance-areas'
                ]
            },
            district: {
                flag: ko.observable(true),
                names: [
                    'aqi-forecast-sta-fill',
                    'district-boundary'
                ]
            },
            counties: {
                flag: ko.observable(true),
                names: [
                    'counties',
                    'counties-labels'
                ]
            }
        };

        this.setupMap = (map) => {
            let layerNames = [
                'impacted-communities-2013',
                'pm25-exceedance-areas',
                'ozone-exceedance-areas'
            ];

            let click = (e) => {
                const feature = e.features[0];
                const p = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(popupTemplate)
                    .addTo(map);

                let area = '';
                let description = '';
                switch (feature.layer.id) {
                    case 'impacted-communities-2013':
                        area = '2013 Cumulative Impact';
                        description = 'Areas where toxic air contaminants, fine particulate matter, and ozone are estimated to have the greatest impacts on health.';
                        break;
                    case 'pm25-exceedance-areas':
                        area = '24 Hour P2.5 Exceedance';
                        description = 'Areas where 24-hour fine particulate matter (PM2.5) levels exceeded the federal standard (35 mg/ m3) during three recent winters (2010-2012).';
                        break;
                    case 'ozone-exceedance-areas':
                        area = '8 Hour Ozone Exceedance';
                        description = 'Areas where 8-hour ozone levels exceeded the federal standard (75 ppb) three or more times during three recent summers (2011-2013).';
                        break;
                }

                ko.applyBindingsToDescendants({
                    name: feature.properties.Name,
                    area: area,
                    description: description
                }, p._content);
            };
            let mouseenter = () => {
                map.getCanvas().style.cursor = 'pointer';
            };
            let mouseleave = () => {
                map.getCanvas().style.cursor = '';
            };

            layerNames.forEach((layerName) => {
                map.on('click', layerName, click);
                map.on('mouseenter', layerName, mouseenter);
                map.on('mouseleave', layerName, mouseleave);
            });

            let removeListeners = params.mapType.subscribe(() => {
                layerNames.forEach((layerName) => {
                    map.off('click', layerName, click);
                    map.off('mouseenter', layerName, mouseenter);
                    map.off('mouseleave', layerName, mouseleave);
                })
                removeListeners.dispose();
            });

            for (let key in this.layers) {
                let layer = this.layers[key];
                layer.flag.subscribe((visible) => {
                    let visibility = visible ? 'visible' : 'none';
                    layer.names.forEach((name) => {
                        map.setLayoutProperty(name, 'visibility', visibility);
                    });
                });
            }
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
