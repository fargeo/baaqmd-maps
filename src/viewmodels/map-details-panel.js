export default function MapDetailsPanel(params) {
    this.map = params.map;
    if (this.setupMap) {
        if (this.map()){
            this.setupMap(this.map());
        }
        this.map.subscribe(this.setupMap);
    }
};
