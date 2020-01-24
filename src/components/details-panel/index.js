import * as ko from 'knockout';
import * as config from '../../config.json';
import * as template from './template.html';
import '../../bindings/choices';

export default ko.components.register('details-panel', {
    viewModel: function(params) {
        this.expanded = params.expanded || ko.observable(false);
        this.enableMapTypeSelector = params.enableMapTypeSelector;
        this.rootURL = params.rootURL;
        this.detailsActive = params.detailsActive;
        this.showInfoPanel = params.showInfoPanel;
        if (typeof params.enableMapTypeSelector !== 'boolean') {
            this.enableMapTypeSelector = true;
        }
        this.expanderText = ko.pureComputed(() => {
            return this.expanded() ? '<<' : '>>';
        });
        this.toggleExpanded = () => {
            this.expanded(!this.expanded());
        };
        this.mapTypesObj = config.default.mapTypes;
        this.mapTypes = [];
        for (let key in this.mapTypesObj) {
            this.mapTypes.push({
                id: key,
                text: this.mapTypesObj[key].label
            });
        }
        this.mapType = params.mapType;
        this.map = params.map;
        const getMapLink = () => {
            const searchParams = new URLSearchParams();
            if (this.map()) {
                const center = this.map().getCenter();
                searchParams.set('centerLat', center.lat);
                searchParams.set('centerLng', center.lng);
                searchParams.set('zoom', this.map().getZoom());
            }
            searchParams.set('mapType', params.mapType());
            return config.mainMapPage + `?${searchParams.toString()}`;
        };
        this.map.subscribe(map => {
            if (map) {
                this.mapLink(getMapLink());
                map.on('moveend', () => {
                    this.mapLink(getMapLink());
                });
            }
        });
        this.mapType.subscribe(() => {
            this.mapLink(getMapLink());
        });
        this.mapLink = ko.observable(getMapLink());
    },
    template: template
});
