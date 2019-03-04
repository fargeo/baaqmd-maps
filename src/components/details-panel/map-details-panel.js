export default function MapDetailsPanel(options) {
    if (this.setupMap) {
        if (options.map()) {
            this.setUpMap(option.map());
        }
        options.map.subscribe(setUpMap);
    }
};
