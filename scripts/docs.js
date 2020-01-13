/* eslint-disable no-console */
const fs = require("fs");

let srcData = fs.readFileSync('./data/sites/docs_src.json');
let outData = JSON.parse(srcData).reduce(function(sites, doc) {
    const siteId = doc["site_id"];
    const year = doc["year"];
    const type = doc["file_type"];
    const name = doc["file_name"];
    if (!sites[siteId]) sites[siteId] = {};
    if (!sites[siteId][year]) sites[siteId][year] = {};
    sites[siteId][year][type] = name;
    return sites;
}, {});

fs.writeFile(
    './data/sites/docs.json',
    JSON.stringify(outData, null, "\t"),
    function(err) {
        if (err) throw err;

        console.log('./data/sites/docs.json updated...');
    }
);
