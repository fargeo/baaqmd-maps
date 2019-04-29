const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
    const devMode = argv.mode !== 'production';
    return {
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
                use: 'babel-loader'
            }, {
                test: /\.scss$/,
                use: [devMode ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            }, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
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
            }]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'baaqmd-maps.css'
            })
        ]
    };
}
