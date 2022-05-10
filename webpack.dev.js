const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devServer: {
        port: 3000,
        static: {
            directory: path.resolve(__dirname, "src"),
        },
        hot: true,
        allowedHosts: 'all'
    },
    devtool: 'inline-source-map',
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
    },
    output: {
        pathinfo: false
    },
    module: {
        rules: [{
            test: /\.(c|sa|sc)ss/,
            use: ['style-loader', 'css-loader', 'sass-loader']
        }]
    }
});
