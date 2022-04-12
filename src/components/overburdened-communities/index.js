import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as infoPanelTemplate from './info-panel.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';

ko.components.register('OverburdenedCommunitiesInfoPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
    },
    template: infoPanelTemplate
});

export default ko.components.register('OverburdenedCommunities', {
    viewModel: function(params) {
        this.markers = ko.observableArray();
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
            markers: {
                flag: ko.observable(true),
                names: [
                    'overburdened-communities-markers'
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
        ];

        this.getPopupData = (feature) => {
            return feature.properties;
        };

        this.popupTemplate = popupTemplate;

        this.addMarker = (coords, properties) => {
            this.markers.push({
                coords: coords,
                properties: properties
            });
        };

        this.addMarkerFromCoordinates = () => {
            if (this.xCoord() && this.yCoord()) {
                this.addMarker([this.xCoord(), this.yCoord()], {});
            }
        };

        this.addMarkerOnClick = ko.observable(false);

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
                layout: {
                    'icon-image': 'airport-15',
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true
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
                    features: markers.map((marker) => {
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
