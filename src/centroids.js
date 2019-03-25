const fs = require("fs");
const turf = require("@turf/turf");

const layers = [
    'reportingzones',
    'counties'
];

layers.forEach((name) => {
    let fc = fs.readFileSync(`../data/${name}.geojson`);

    fc = JSON.parse(fc);
    fc.features.forEach((feature) => {
        feature.geometry = turf.centroid(feature).geometry;
    });

    fs.writeFile(
        `../data/${name}centroids.geojson`,
        JSON.stringify(fc, null, "\t"),
        function(err) {
            if (err) throw err;

            console.log(`${name}centroids.geojson added...`);
        }
    );
});
