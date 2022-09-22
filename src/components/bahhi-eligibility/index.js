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
const aboutBAHHIEligibility = ko.observable();
let fetchData = (rootURL) => {
    fetchHTML(rootURL + config.aboutBAHHIEligibilityURL, aboutBAHHIEligibility);
    fetchHTML(rootURL + config.bahhiPinLocationsHelpURL, pinLocationsHelp);
    fetchData = false;
};

ko.components.register('BAHHIEligibilityInfoPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.aboutBAHHIEligibility = aboutBAHHIEligibility;
    },
    template: infoPanelTemplate
});

ko.components.register('BAHHIPinLocationsHelpPanel', {
    viewModel: function(params) {
        this.showInfoPanel = params.showInfoPanel;
        this.pinLocationsHelp = pinLocationsHelp;
    },
    template: helpPanelTemplate
});

export default ko.components.register('BAHHIEligibility', {
    viewModel: function(params) {
        const rootUrl = params.rootURL || config.prodRoot;
        if (fetchData) fetchData(rootUrl);
        this.geocoder = ko.observable();
        this.pinsExpanded = ko.observable(true);
        this.pins = ko.observableArray();
        this.eligiblePinsCount = ko.computed(() => {
            return this.pins().filter((pin) => {
                return pin.properties.eligible;
            }).length;
        });
        this.notEligiblePinsCount = ko.computed(() => {
            return this.pins().filter((pin) => {
                return !pin.properties.eligible;
            }).length;
        });
        this.xCoord = ko.observable();
        this.yCoord = ko.observable();
        this.layers = {
            bahhiEligibility: {
                flag: ko.observable(true),
                names: [
                    'bahhi-eligibility'
                ]
            },
            bahhiCounties: {
                flag: ko.observable(true),
                names: [
                    'bahhi-counties'
                ]
            },
            eligiblePins: {
                flag: ko.observable(true),
                names: [
                    'eligible-pins'
                ]
            },
            notEligiblePins: {
                flag: ko.observable(true),
                names: [
                    'not-eligible-pins'
                ]
            },
            district: {
                flag: ko.observable(true),
                names: [
                    'districtboundary'
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
            'eligible-pins',
            'not-eligible-pins'
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

        this.assignPinName = (properties, coords) => {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}`;
            if (properties["place_name"]) {
                properties.name = properties.place_name;
                this.pins.push({
                    coords: coords,
                    properties: properties
                });
            } else fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then((data) => {
                    if (data.features.length > 0) {
                        properties.name = data.features[0]["place_name"];
                    } else {
                        properties.name = "User selected location";
                    }
                    this.pins.push({
                        coords: coords,
                        properties: properties
                    });
                });
        };

        this.addPin = (coords, properties) => {
            const url = `${mapboxgl.baseApiUrl}/v4/baaqmd-publicmaps.cl84tuv710bbi28myv7qn6741-7qn9u/tilequery/${coords[0]},${coords[1]}.json?limit=1&access_token=${mapboxgl.accessToken}`;
            fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then((data) => {
                    properties.eligible = data.features.length > 0;
                    this.assignPinName(properties, coords);
                });
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
            map.addSource('eligible-pins', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            map.addLayer({
                id: 'eligible-pins',
                type: 'symbol',
                source: 'eligible-pins',
                filter: ['==', ['get', 'eligible'], true],
                layout: {
                    'icon-image': 'LocationOverburdened',
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true,
                    'icon-anchor': 'bottom',
                    'icon-size': 0.1
                }
            });

            map.addLayer({
                id: 'not-eligible-pins',
                type: 'symbol',
                source: 'eligible-pins',
                filter: ['==', ['get', 'eligible'], false],
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
                map.getSource('eligible-pins').setData({
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
