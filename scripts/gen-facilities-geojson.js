/* eslint-disable no-console */
const fs = require("fs");
const proj4 = require("proj4");
let facilities = fs.readFileSync(`./data/facilities.json`);

proj4.defs("EPSG:3310","+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

var fc = {
    'type': 'FeatureCollection',
    'features': []
};

facilities = JSON.parse(facilities);
facilities.forEach((facility) => {
    const coords = proj4('EPSG:3310', 'EPSG:4326', [facility.X, facility.Y]);
    delete facility.X;
    delete facility.Y;
    fc.features.push({
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": coords
        },
        "properties": facility
    });
});

fs.writeFile(
    `./data/facilities.geojson`,
    JSON.stringify(fc, null, "\t"),
    function(err) {
        if (err) throw err;

        console.log(`data/facilities.geojson added...`);
    }
);
