import * as ko from 'knockout';
import * as mapboxgl from 'mapbox-gl';
import config from '../../config.json';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as infoPanelTemplate from './info-panel.html';
import * as helpPanelTemplate from './help-panel.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';
import '../../bindings/geocoder';
import fetchHTML from '../../utils/fetch-html';

const pinLocationsHelp = ko.observable();
const aboutOverburdenedCommunities = ko.observable();
let fetchData = (rootURL) => {
    fetchHTML(rootURL + config.aboutOverburdenedCommunitiesURL, aboutOverburdenedCommunities);
    fetchHTML(rootURL + config.pinLocationsHelpURL, pinLocationsHelp);
    fetchData = false;
};

ko.components.register('OverburdenedCommunitiesInfoPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.aboutOverburdenedCommunities = aboutOverburdenedCommunities;
    },
    template: infoPanelTemplate
});

ko.components.register('PinLocationsHelpPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.pinLocationsHelp = pinLocationsHelp;
    },
    template: helpPanelTemplate
});

export default ko.components.register('OverburdenedCommunities', {
    viewModel: function(params) {
        const rootUrl = params.rootURL || config.prodRoot;
        if (fetchData) fetchData(rootUrl);
        this.geocoder = ko.observable();
        this.pinsExpanded = ko.observable(true);
        this.pins = ko.observableArray();
        this.overburdenedPinsCount = ko.computed(() => {
            return this.pins().filter((pin) => {
                return pin.properties.overburdened;
            }).length;
        });
        this.notOverburdenedPinsCount = ko.computed(() => {
            return this.pins().filter((pin) => {
                return !pin.properties.overburdened;
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
            overburdenedPins: {
                flag: ko.observable(true),
                names: [
                    'overburdened-communities-pins'
                ]
            },
            notOverburdenedPins: {
                flag: ko.observable(true),
                names: [
                    'not-overburdened-communities-pins'
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
            'overburdened-communities-pins',
            'not-overburdened-communities-pins'
        ];

        this.getPopupData = (feature) => {
            return {
                removePin: () => {
                    this.popup.remove();
                    this.pins.splice(feature.properties.index, 1);
                },
                ...feature.properties
            };
        };

        this.popupTemplate = popupTemplate;

        this.addPin = (coords, properties) => {
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
                    properties.name = properties.place_name || `Latitude: ${Math.round(coords[1] * 1000) / 1000}
                        <br/>
                        Longitude: ${Math.round(coords[0] * 1000) / 1000}`;
                    this.pins.push({
                        coords: coords,
                        properties: properties
                    });
                });
        };

        this.coordsEnterKey = (data, event) => {
            if (event.keyCode === 13) this.addPinFromCoordinates();
            return true;
        };

        this.addPinFromCoordinates = () => {
            if (this.xCoord() && this.yCoord()) {
                const coords = [this.xCoord(), this.yCoord()];
                this.addPin(coords, {});
                this.map().flyTo({center: coords, zoom: 16});
            }
        };

        this.addPinOnClick = ko.observable(false);
        this.addPinOnClick.subscribe((addPinOnClick) => {
            if (addPinOnClick) {
                this.map().getCanvas().style.cursor = 'crosshair';
            } else {
                this.map().getCanvas().style.cursor = '';
            }
        });

        let geocoderResult;
        this.geocoder.subscribe((geocoder) => {
            geocoder.on('loading', (e) => {
                geocoderResult = undefined;
            });
            geocoder.on('result', (e) => {
                geocoderResult = e.result;
                this.addPin(geocoderResult.center, geocoderResult);
            });
        });

        this.addPinFromAddress = () => {
            if (geocoderResult) {
                this.addPin(geocoderResult.center, geocoderResult);
            }
        };

        this.setupMap = (map) => {
            map.addSource('overburdened-communities-pins', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            map.addLayer({
                id: 'overburdened-communities-pins',
                type: 'symbol',
                source: 'overburdened-communities-pins',
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
                id: 'not-overburdened-communities-pins',
                type: 'symbol',
                source: 'overburdened-communities-pins',
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
                if (this.addPinOnClick()) {
                    this.addPin([e.lngLat.lng, e.lngLat.lat], {});
                    this.addPinOnClick(false);
                }
            };

            map.on('click', onClick);

            var teardown = this.mapType.subscribe(() => {
                map.off('click', onClick);
                teardown.dispose();
            });

            this.pins.subscribe((pins) => {
                map.getSource('overburdened-communities-pins').setData({
                    type: 'FeatureCollection',
                    features: pins.map((pin, index) => {
                        pin.properties.index = index;
                        return {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: pin.coords
                            },
                            properties: pin.properties
                        };
                    })
                });
            });
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
