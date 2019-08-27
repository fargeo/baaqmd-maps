/* eslint-disable no-console */
const fs = require("fs");
const proj4 = require("proj4");
const tippecanoe = require('tippecanoe');
const MapboxClient = require('mapbox');
const AWS = require('aws-sdk');

const config = JSON.parse(fs.readFileSync('./src/config.json'));
const tilesPath = './data/facilities/facilities.mbtiles';
const clusteredTilesPath = './data/facilities/facilities-clustered.mbtiles';

let facilities = fs.readFileSync("./data/facilities/facilities.json");
let fc = {
    "type": "FeatureCollection",
    "features": []
};
let mapboxKey = '';
try {
    mapboxKey = JSON.parse(
        fs.readFileSync('./secret.json')
    ).mapboxKey;
} catch (error) {
    fs.writeFileSync('./secret.json', JSON.stringify({
        mapboxKey: ''
    }));
}

if (!mapboxKey) {
    console.error('missing Mapbox secret key; add a key that has access to ' +
        'the Mapbox uploads API to "mapboxKey" in "./secret.json"');
} else {
    const mapbox = new MapboxClient(mapboxKey);
    proj4.defs("EPSG:3310","+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

    facilities = JSON.parse(facilities);
    facilities.forEach((facility) => {
        const coords = proj4("EPSG:3310", "EPSG:4326", [facility.X, facility.Y]);
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
        "./data/facilities/facilities.geojson",
        JSON.stringify(fc, null, "\t"),
        function(err) {
            if (err) throw err;

            console.log("data/facilities/facilities.geojson added...");

            if (fs.existsSync(clusteredTilesPath)) fs.unlinkSync(clusteredTilesPath);

            console.log('building clustered mbtiles file...');
            tippecanoe(['./data/facilities/facilities.geojson'], {
                output: clusteredTilesPath,
                maximumZoom: "g",
                clusterDistance: config.facilitiesClusterDistance,
                dropRate: 1,
                layer: "facilities-clustered"
            }, {
                echo: true
            });

            console.log('clustered mbtiles file ready... getting mapbox credentials...');
            mapbox.createUploadCredentials((err, cred) => {
                const s3 = new AWS.S3({
                    accessKeyId: cred.accessKeyId,
                    secretAccessKey: cred.secretAccessKey,
                    sessionToken: cred.sessionToken,
                    region: 'us-east-1'
                });

                console.log('mapbox credentials ready... uploading clustered mbtiles...');
                s3.putObject({
                    Bucket: cred.bucket,
                    Key: cred.key,
                    Body: fs.createReadStream(clusteredTilesPath)
                }, (err) => {
                    if (err) throw err;

                    console.log('clustered mbtiles upload complete... updating tileset...');
                    mapbox.createUpload({
                        tileset: `${config.userName}.${config.clusteredFacilityTilesetId}`,
                        url: cred.url
                    }, (err) => {
                        if (err) throw err;

                        if (fs.existsSync(tilesPath)) fs.unlinkSync(tilesPath);

                        console.log('building mbtiles file...');
                        tippecanoe(['./data/facilities/facilities.geojson'], {
                            output: tilesPath,
                            maximumZoom: "g",
                            dropRate: 1
                        }, {
                            echo: true
                        });

                        console.log('mbtiles file ready... getting mapbox credentials...');
                        mapbox.createUploadCredentials((err, cred) => {
                            const s3 = new AWS.S3({
                                accessKeyId: cred.accessKeyId,
                                secretAccessKey: cred.secretAccessKey,
                                sessionToken: cred.sessionToken,
                                region: 'us-east-1'
                            });

                            console.log('mapbox credentials ready... uploading mbtiles...');
                            s3.putObject({
                                Bucket: cred.bucket,
                                Key: cred.key,
                                Body: fs.createReadStream(tilesPath)
                            }, (err) => {
                                if (err) throw err;

                                console.log('mbtiles upload complete... updating tileset...');
                                mapbox.createUpload({
                                    tileset: `${config.userName}.${config.facilityTilesetId}`,
                                    url: cred.url
                                }, (err) => {
                                    if (err) throw err;

                                    console.log('tileset update started (this may take a few ' +
                                        'minutes to complete, see ' +
                                        'https://studio.mapbox.com/tilesets/ for details)...');
                                });
                            });
                        });
                    });
                });
            });
        }
    );
}
