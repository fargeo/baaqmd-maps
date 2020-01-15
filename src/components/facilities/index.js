import * as ko from 'knockout';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';
import * as config from '../../config.json';
import fetchHTML from '../../utils/fetch-html';

const aboutFacilities = ko.observable();
let fetchData = (rootURL) => {
    fetchHTML(rootURL + config.aboutFacilitiesURL, aboutFacilities);
    fetchData = false;
};

export default ko.components.register('Facilities', {
    viewModel: function(params) {
        const rootUrl = params.rootURL || config.prodRoot;
        if (fetchData) fetchData(rootUrl);

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
                    ["Emission Points", "PointCount"],
                    ["Particulates", "Particulates"],
                    ["Organics", "Organics"],
                    ["Nitrogen Oxides", "NitrogenOxides"],
                    ["Sulphur Dioxide", "SulphurDioxide"],
                    ["Carbon Monoxide", "CarbonMonoxide"],
                    ["Greenhouse Gases", "GreenhouseGases"]
                ].map((attr) => {
                    return {
                        name: attr[0],
                        value: data[attr[1]]
                    };
                });
                return {
                    name: data.FacilityName,
                    attributeList: attributeList,
                    aboutFacilities: aboutFacilities
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
