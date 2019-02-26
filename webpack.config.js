module.exports = {
    output: {
        path: __dirname + '/dist',
        filename: 'baaqmd-maps.js',
        library: 'baaqmdMaps',
        libraryTarget: 'umd'
    },
    devServer: {
        port: 3000,
        contentBase: __dirname + '/dist',
        inline: true
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader'
        }, {
            test: /\.scss$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader'
            }, {
                loader: 'sass-loader'
            }]
        }, {
            test: /\.css$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader'
            }]
        }, {
            test: /\.html$/,
            exclude: /node_modules/,
            loader: 'html-loader'
        }]
    }
};
