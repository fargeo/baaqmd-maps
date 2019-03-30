export default function MapDetailsPanel(params) {
    this.mapType = params.mapType;
    this.map = params.map;
    this.showInfoPanel = params.showInfoPanel;
    if (this.setupMap) {
        if (this.map()){
            setTimeout(() => {
                this.setupMap(this.map());
            }, 200)
        }
        this.map.subscribe((mapType) => {
            this.setupMap(this.map());
        });
    }
};
