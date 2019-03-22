# Example Usage ([raw example](http://baaqmd.fargeo-dev.com/dist/))

<iframe src="http://baaqmd.fargeo-dev.com/dist/" width="100%" height="500px;" style="border: 1px solid grey;"></iframe>

```html
<link rel="stylesheet" href="http://baaqmd.fargeo-dev.com/dist/baaqmd-maps.css">
<script src="http://baaqmd.fargeo-dev.com/dist/baaqmd-maps.js" type="text/javascript"></script>

<style>
    body {
        margin: 0;
    }

    #map {
        position: absolute;
        height: 100%;
        right: 0;
        left: 0;
    }
</style>

<body>
    <div id="map"></div>
    
    <script type="text/javascript">
        new baaqmdMaps.Map({
            container: "map"
        });
    </script>
</body>
```

# API

## `Map`

`Map` allows you to create a new `baaqmdMaps` map by specifying options for how it should render and behave.

```js
new Map(options: Object)
```

### Parameters

#### `options` (Object)

-   `options.container` ([`HTMLElement`](https://developer.mozilla.org/docs/Web/HTML/Element) OR [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)): The HTML element, or the element's string `id`, into which the map will render. This element must have no children.
-   `options.sidePanel`([`boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean), default `true`): If `true`, the side panel with layer controls and details will be included with the map.
-   `options.mapType`([`string`](), default `'AQIForecast'`): the name of the map type that should be rendered.  Should be one of the following: `'AQIForecast'`, `'Facilities'`, `'ImpactedCommunities'`, `'Monitoring'`, `'OpenBurning'`
-   `options.enableMapTypeSelector`([`boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean), default `true`): If `true`, the title in the side panel will allow the user to select between map types

### Instance Members

-   `el`: the HTMLElement into which the `Map` was rendered
-   `expandSidePanel()`: Expands the side panel (if it is being shown). Returns [`boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean), expanded state of side panel
-   `collapseSidePanel()`: Collapses the side panel (if it is being shown). Returns [`boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean), expanded state of side panel
-   `showSidePanel()`:  Shows the side panel and related controls. Returns [`boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean), shown state of side panel
-   `hideSidePanel()`: Hides the side panel and related controls. Returns [`boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean), shown state of side panel

# Development

## Getting Started

Install the following dependencies:

-   [Node.js](https://nodejs.org/)
-   [Yarn](https://yarnpkg.com/en/docs/install)

Now you can fork & clone this repository to start developing.

After cloning the repo, you'll need to install your package dependencies locally by running the following from the root directory of your cloned repository:

```sh
yarn install
```

## Development Server

To run the app locally, run the following from the root directory of your cloned repository:

```sh
yarn dev
```

The application should now be running at <http://localhost:3000/>

Changes that you make to javascript and CSS files will be automatically refreshed!

## Building

Before deploying, you must first build the library by running the following command from the root directory: 

```sh
yarn build
```

## Deployment

To deploy the latest to library and examples to the web, simply build (as per above) then commit and push your local changes, and merge them into to the `master` branch in Github.

## Tile Generation

Requires [tippecanoe](https://github.com/mapbox/tippecanoe) to be installed locally.  To generate tiles from the latest local data (stored in `data/`), run the following command from the root directory: 

```sh
yarn tiles
```

This will create an `.mbtiles` file (`data/baaqmd.mbtiles`) containing all layers, which is ready for upload to [Mapbox](https://studio.mapbox.com/tilesets/).
