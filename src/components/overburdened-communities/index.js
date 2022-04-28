import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as config from '../../config.json';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as infoPanelTemplate from './info-panel.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';
import fetchHTML from '../../utils/fetch-html';

const aboutOverburdenedCommunities = ko.observable();
let fetchData = (rootURL) => {
    fetchHTML(rootURL + config.aboutOverburdenedCommunitiesURL, aboutOverburdenedCommunities);
    fetchData = false;
};

ko.components.register('OverburdenedCommunitiesInfoPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.aboutOverburdenedCommunities = aboutOverburdenedCommunities;
    },
    template: infoPanelTemplate
});

export default ko.components.register('OverburdenedCommunities', {
    viewModel: function(params) {
        const rootUrl = params.rootURL || config.prodRoot;
        if (fetchData) fetchData(rootUrl);
        this.markersExpanded = ko.observable(true);
        this.markers = ko.observableArray();
        this.overburdenedMarkersCount = ko.computed(() => {
            return this.markers().filter((marker) => {
                return marker.properties.overburdened;
            }).length;
        });
        this.notOverburdenedMarkersCount = ko.computed(() => {
            return this.markers().filter((marker) => {
                return !marker.properties.overburdened;
            }).length;
        });
        this.xCoord = ko.observable();
        this.yCoord = ko.observable();
        this.layers = {
            overburdened: {
                flag: ko.observable(true),
                names: [
                    'overburdened-communities',
                    'overburdened-communities-outline'
                ]
            },
            overburdenedMarkers: {
                flag: ko.observable(true),
                names: [
                    'overburdened-communities-markers'
                ]
            },
            notOverburdenedMarkers: {
                flag: ko.observable(true),
                names: [
                    'not-overburdened-communities-markers'
                ]
            },
            buffer: {
                flag: ko.observable(true),
                names: [
                    'overburdened-communities-1000-ft'
                ]
            },
            district: {
                flag: ko.observable(true),
                names: [
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

        this.popupLayers = [
            'overburdened-communities-markers',
            'not-overburdened-communities-markers'
        ];

        this.getPopupData = (feature) => {
            return {
                removeMarker: () => {
                    this.popup.remove();
                    this.markers.splice(feature.properties.index, 1);
                },
                ...feature.properties
            };
        };

        this.popupTemplate = popupTemplate;

        this.addMarker = (coords, properties) => {
            const url = `${mapboxgl.baseApiUrl}/v4/baaqmd-publicmaps.cl005bu79383k28tfhgqz6cm2-9y5k2,baaqmd-publicmaps.cl005jo3b5xsw20n5km6mdn7a-29w8w/tilequery/${coords[0]},${coords[1]}.json?limit=1&access_token=${mapboxgl.accessToken}`;
            fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then((data) => {
                    properties.overburdened = data.features.length > 0;
                    properties.name = properties.text || `${Math.round(coords[0] * 1000) / 1000}, ${Math.round(coords[1] * 1000) / 1000}`;
                    this.markers.push({
                        coords: coords,
                        properties: properties
                    });
                });
        };

        this.addMarkerFromCoordinates = () => {
            if (this.xCoord() && this.yCoord()) {
                this.addMarker([this.xCoord(), this.yCoord()], {});
            }
        };

        this.addMarkerOnClick = ko.observable(false);
        this.addMarkerOnClick.subscribe((addMarkerOnClick) => {
            if (addMarkerOnClick) {
                this.map().getCanvas().style.cursor = 'crosshair';
            } else {
                this.map().getCanvas().style.cursor = '';
            }
        });

        this.setupMap = (map) => {
            map.addSource('overburdened-communities-markers', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            map.addLayer({
                id: 'overburdened-communities-markers',
                type: 'symbol',
                source: 'overburdened-communities-markers',
                filter: ['==', ['get', 'overburdened'], true],
                layout: {
                    'icon-image': 'LocationOverburdened',
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true,
                    'icon-anchor': 'bottom',
                    'icon-size': 0.1
                }
            });

            map.addLayer({
                id: 'not-overburdened-communities-markers',
                type: 'symbol',
                source: 'overburdened-communities-markers',
                filter: ['==', ['get', 'overburdened'], false],
                layout: {
                    'icon-image': 'LocationNotOverburdened',
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true,
                    'icon-anchor': 'bottom',
                    'icon-size': 0.1
                }
            });

            this.layers.counties.flag(false);

            const onClick = (e) => {
                if (this.addMarkerOnClick()) {
                    this.addMarker([e.lngLat.lng, e.lngLat.lat], {});
                    this.addMarkerOnClick(false);
                }
            };

            map.on('click', onClick);

            const addResultMarker = (e) => {
                this.addMarker(e.result.center, e.result);
            };

            const geocoderControl = map._controls.find((control) => {
                const container = control.container || control._container;
                return container.classList.contains('mapboxgl-ctrl-geocoder');
            });
            geocoderControl.on('result', addResultMarker);

            var teardown = this.mapType.subscribe(() => {
                map.off('click', onClick);
                geocoderControl.off('result', addResultMarker);
                teardown.dispose();
            });

            this.markers.subscribe((markers) => {
                map.getSource('overburdened-communities-markers').setData({
                    type: 'FeatureCollection',
                    features: markers.map((marker, index) => {
                        marker.properties.index = index;
                        return {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: marker.coords
                            },
                            properties: marker.properties
                        };
                    })
                });
            });
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
