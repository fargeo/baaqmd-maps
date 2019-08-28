/* eslint-disable no-console */
const fs = require("fs");
const proj4 = require("proj4");
const tippecanoe = require('tippecanoe');
const MapboxClient = require('mapbox');
const AWS = require('aws-sdk');
const config = JSON.parse(fs.readFileSync('./src/config.json'));
let mapboxKey;

function updateTileset(jsonPath, featureCollection, tilePath, tileConfig, tilesetId, callback) {
    const mapbox = new MapboxClient(mapboxKey);
    fs.writeFile(
        jsonPath,
        JSON.stringify(featureCollection, null, "\t"),
        function(err) {
            if (err) throw err;

            console.log(`${jsonPath} added...`);

            if (fs.existsSync(tilePath)) fs.unlinkSync(tilePath);

            console.log('building mbtiles file...');
            tippecanoe([jsonPath], tileConfig, {
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
                    Body: fs.createReadStream(tilePath)
                }, (err) => {
                    if (err) throw err;

                    console.log('mbtiles upload complete... updating tileset...');
                    mapbox.createUpload({
                        tileset: `${config.userName}.${tilesetId}`,
                        url: cred.url
                    }, (err) => {
                        if (err) throw err;

                        console.log(
                            'tileset update started (this may take a few ' +
                            'minutes to complete, see ' +
                            'https://studio.mapbox.com/tilesets/ for details)...'
                        );

                        if (callback) callback();
                    });
                });
            });
        }
    );
}

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
    let facilities = fs.readFileSync(config.facilitiesJSONPath);
    let fc = {
        "type": "FeatureCollection",
        "features": []
    };

    proj4.defs("EPSG:3310","+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

    facilities = JSON.parse(facilities);
    facilities.forEach((facility) => {
        const coords = proj4("EPSG:3310", "EPSG:4326", [facility.X, facility.Y]);
        delete facility.X;
        delete facility.Y;
        facility.X_MIN = coords[0];
        facility.X_MAX = coords[0];
        facility.Y_MIN = coords[1];
        facility.Y_MAX = coords[1];
        fc.features.push({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": coords
            },
            "properties": facility
        });
    });

    updateTileset(
        "./data/facilities/facilities-clustered.geojson",
        fc,
        './data/facilities/facilities-clustered.mbtiles',
        {
            output: './data/facilities/facilities-clustered.mbtiles',
            maximumZoom: 20,
            clusterDistance: config.facilitiesClusterDistance,
            accumulateAttribute: JSON.stringify({
                "X_MAX":"max",
                "X_MIN":"min",
                "Y_MAX":"max",
                "Y_MIN":"min"
            }),
            dropRate: 1,
            layer: "facilities-clustered"
        },
        config.clusteredFacilityTilesetId,
        () => {
            fc.features.forEach((feature) => {
                delete feature.properties.X_MIN;
                delete feature.properties.X_MAX;
                delete feature.properties.Y_MIN;
                delete feature.properties.Y_MAX;
            });
            updateTileset(
                "./data/facilities/facilities.geojson",
                fc,
                './data/facilities/facilities.mbtiles',
                {
                    output: './data/facilities/facilities.mbtiles',
                    maximumZoom: 20,
                    dropRate: 1
                },
                config.facilityTilesetId
            );
        }
    );
}
