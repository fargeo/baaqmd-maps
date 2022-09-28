const merge = require('webpack-merge');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin({})],
    },
    module: {
        rules: [{
            test: /\.(c|sa|sc)ss/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'baaqmd-maps.css'
        })
    ]
});
