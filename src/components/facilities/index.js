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
            var data = feature.properties;
            if (data.clustered) {
                let bounds = [data.X_MIN, data.Y_MIN, data.X_MAX, data.Y_MAX];
                this.map().fitBounds(bounds, {padding: 100});
            }
            else {
                const attributeList = [
                    ["Facility Number", "FacilityNumber"],
                    ["Status", "FacilityStatus"],
                    ["Type", "Subtype"],
                    ["Latitude", "Y"],
                    ["Longitude", "X"],
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
                        value: data[attr[1]]
                    };
                });

                return {
                    name: data.FacilityName,
                    attributeList: attributeList,
                };
            }
        };

        this.popupTemplate = popupTemplate;

        this.setupMap = () => {
            this.layers.counties.flag(false);
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
