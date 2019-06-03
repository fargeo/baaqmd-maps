import * as ko from 'knockout';
import * as config from '../../config.json';
import * as template from './template.html';
import * as popupTemplate from './popup.html';
import * as MapDetailsPanel from '../../viewmodels/map-details-panel';

const parser = new DOMParser();
const openBurnData = ko.observable();
fetch(config.openBurnRSSFeed, {cache: "no-store"})
    .then((response) => {
        return response.text();
    })
    .then((text) => {
        const xmlDoc = parser.parseFromString(text, 'application/xml');
        const dates = [];
        const sections = {};
        xmlDoc.querySelectorAll('item').forEach((item) => {
            const date = new Date(item.querySelector('title').textContent);
            const status = item.querySelector('description').textContent
                .split('\n')
                .reduce((statusList, item) => {
                    if (item) statusList.push(item.split(": "));
                    return statusList;
                }, [])
                .map((item) => {
                    const name = item[0].replace('ern', '');
                    const status = item[1] === 'Burn' ? "yes" : "no";

                    if (!sections[name]) sections[name] = [];
                    sections[name].push({
                        date: date,
                        status: status
                    });
                    return {
                        name: name,
                        status: status
                    };
                });
            dates.push({
                date: date,
                status: status
            });
        });
        openBurnData({
            dates: dates,
            sections: sections,
            lastUpdated: new Date(xmlDoc.querySelector('lastBuildDate').textContent)
        });
    });

export default ko.components.register('OpenBurning', {
    viewModel: function(params) {
        const sections = [
            'South Section',
            'Coastal Section',
            'North Section'
        ];
        this.openBurnData = openBurnData;
        this.day = ko.observable();
        this.layers = {
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

        this.popupLayers = ['open-burn-sections-fill'];
        this.getPopupData = (feature) => {
            const openBurnData = this.openBurnData();
            return {
                name: feature.properties.section,
                lastUpdated: openBurnData.lastUpdated,
                openBurnData: openBurnData.sections[feature.properties.section]
            };
        };
        this.popupTemplate = popupTemplate;

        this.day.subscribe((day) => {
            if (typeof day === 'number') {
                sections.forEach((section, i) => {
                    const status = this.openBurnData().dates[day].status.find((s) => {
                        return s.name === section;
                    });
                    this.map().setFeatureState({
                        id: i + 1,
                        source: 'composite',
                        sourceLayer: 'openburnsections'
                    }, {
                        status: status.status
                    });
                });
            }
        }, this);

        this.setupMap = () => {
            if (this.openBurnData()) {
                this.day(0);
            } else {
                let updateOnFetch = this.openBurnData.subscribe(() => {
                    this.day(0);
                    updateOnFetch.dispose();
                });
            }

            this.layers.counties.flag(false);
        };

        MapDetailsPanel.default.apply(this, [params]);
    },
    template: template
});
