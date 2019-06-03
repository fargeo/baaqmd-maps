/* eslint-disable no-console */
const fs = require("fs");
const turf = require("@turf/turf");

const layers = [
    // add names (w/o extension) of geojson files
];

layers.forEach((name) => {
    let fc = fs.readFileSync(`./data/${name}.geojson`);

    fc = JSON.parse(fc);
    fc.features.forEach((feature) => {
        feature.geometry = turf.centroid(feature).geometry;
    });

    fs.writeFile(
        `./data/${name}points.geojson`,
        JSON.stringify(fc, null, "\t"),
        function(err) {
            if (err) throw err;

            console.log(`data/${name}points.geojson added...`);
        }
    );
});
