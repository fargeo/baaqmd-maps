const fs = require('fs');
const fetch = require('node-fetch');
const tippecanoe = require('tippecanoe');
const MapboxClient = require('mapbox');
const AWS = require('aws-sdk');

const mapboxKey = JSON.parse(
    fs.readFileSync(`./secret.json`)
).mapboxKey;
const mapbox = new MapboxClient(mapboxKey);
const tilesPath = './data/baaqmd.mbtiles';
const userName = 'baaqmd-publicmaps';
const tilesetId = 'c3867v6s';

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
    var AWS = require('aws-sdk');
    var s3 = new AWS.S3({
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
    }, (err, response) => {
        if (err) throw err

        console.log('mbtiles upload complete... updating tileset...');
        mapbox.createUpload({
            tileset: `${userName}.${tilesetId}`,
            url: cred.url
        }, (err, response) => {
            if (err) throw err

            console.log('tileset update started (may take a few minutes to complete)...');
        });
    });
});
