# Example Usage ([raw example](https://fargeo.github.io/baaqmd-maps/dist/))

<iframe src="https://fargeo.github.io/baaqmd-maps/dist/" width="100%" height="500px;" style="border: 1px solid grey;"></iframe>

```html
<script src="https://fargeo.github.io/baaqmd-maps/dist/baaqmd-maps.js" type="text/javascript"></script>

<style media="screen">
    main {
        display: block;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }

    #map {
        height: 100%;
    }
</style>

<body>
    <main>
        <div id="map"></div>
    </main>
    
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

-   `options.container` (HTMLElement OR string): The HTML element, or the element's string `id`, into which the map will render. This element must have no children.

### Instance Members

- `el`: the HTMLElement into which the `Map` was rendered

# For Developers...

## Getting Started

Install the following dependencies:

-   [Node.js](https://nodejs.org/)
-   [Yarn](https://yarnpkg.com/en/docs/install)

Now you can fork & clone this repository to start developing.

After cloning the repo, you'll need to install your package dependencies locally by running the following from the root directory of your cloned repository:

    yarn install

## Development Server

To run the app locally, run the following from the root directory of your cloned repository:

    yarn dev

The application should now be running at <http://localhost:3000/>

Changes that you make to javascript and CSS files will be automatically refreshed!

## Build

Before deploying, you must first build the library by running the following command from the root directory: 

    yarn build

## Deploy

To deploy the latest to library and examples to the web, simply build (as per above) then commit and push your local changes, and merge them into to the `master` branch in Github.
