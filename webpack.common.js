const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'baaqmd-maps.js',
        library: 'baaqmdMaps',
        libraryTarget: 'umd'
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: 'babel-loader'
        }, {
            test: /\.html$/,
            exclude: /node_modules/,
            use: 'html-loader'
        }, {
            test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/'
                }
            }]
        },{
            test: /\.scss$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        }, {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader']
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'baaqmd-maps.css'
        })
    ]
};
