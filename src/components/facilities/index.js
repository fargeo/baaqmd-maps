import * as ko from 'knockout';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';

export default ko.components.register('Facilities', {
    viewModel: function(params) {

        this.layers = {
            facilities: {
                flag: ko.observable(true),
                names: [
                    'facilities',
                    'facilities-clustered'
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
            'facilities',
            'facilities-clustered'
        ];

        this.getPopupData = (feature) => {
            let siteType = '';
            let about = '';
            if (feature.properties.clustered) {
                let bounds = [feature.properties.X_MIN, feature.properties.Y_MIN, feature.properties.X_MAX, feature.properties.Y_MAX];
                this.map().fitBounds(bounds, {padding: {top: 100, bottom: 100, left: 100, right: 100}});
            }
            else {
                const attributeList = [
                    ["Facility Name", "FacilityName"],
                    ["Facility Number", "FacilityNumber"],
                    ["Status", "FacilityStatus"],
                    ["Type", "Subtype"],
                    ["Latitude", "Latitude"],
                    ["Longitude", "Longitude"],
                    ["Permit Expires", "PermitExpirationDate"],
                    ["Site Number", "SiteNumber"],
                    ["Street Address", "Address"],
                    ["City", "City"],
                    ["Zip Code", "ZipCode"],
                    ["Sources", "SourceCount"],
                    ["Abatements", "AbatementCount"],
                    ["Emission Points", "PointCount"]
                ].map((attr) => {
                    return {
                        name: attr[0],
                        value: feature.properties[attr[1]]
                    };
                });

                switch (feature.layer.id) {
                case 'facilities':
                    siteType = 'Facility';
                    break;
                }

                return {
                    name: feature.properties.FacilityName,
                    siteType: siteType,
                    about: about,
                    attributeList: attributeList,
                };
            }
        };

        this.popupTemplate = popupTemplate;

        this.setupMap = () => {
            this.layers.facilities.flag(true);
            this.layers.counties.flag(false);
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
