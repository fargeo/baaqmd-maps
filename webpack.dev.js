const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devServer: {
        port: 3000,
        contentBase: './src',
        disableHostCheck: true,
        hot: true,
        host: '0.0.0.0',
        useLocalIp: true
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
