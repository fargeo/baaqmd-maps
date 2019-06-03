/* eslint-disable no-console */
const fs = require('fs');
const tippecanoe = require('tippecanoe');
const MapboxClient = require('mapbox');
const AWS = require('aws-sdk');
const config = JSON.parse(fs.readFileSync('./src/config.json'));

const tilesPath = './data/baaqmd.mbtiles';

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

    if (fs.existsSync(tilesPath)) fs.unlinkSync(tilesPath);

    console.log('building mbtiles file...');
    tippecanoe(['./data/*.geojson'], {
        output: tilesPath,
        maximumZoom: 15,
        dropDensestAsNeeded: true,
        noLineSimplification: true,
        detectSharedBorders: true,
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
                tileset: `${config.userName}.${config.tilesetId}`,
                url: cred.url
            }, (err) => {
                if (err) throw err;

                console.log('tileset update started (this may take a few ' +
                    'minutes to complete, see ' +
                    'https://studio.mapbox.com/tilesets/ for details)...');
            });
        });
    });
}
