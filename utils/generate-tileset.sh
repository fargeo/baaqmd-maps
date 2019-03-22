#!/bin/bash
cd ../data/
tippecanoe -o baaqmd.mbtiles -z15 --drop-densest-as-needed counties.geojson district-boundary.geojson impacted-communities-2009.geojson impacted-communities-2013.geojson jurisdictions.geojson ocean-bay.geojson open-burn-sections.geojson reporting-zones.geojson -ps -ab
