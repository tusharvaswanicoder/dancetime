const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    // webpack --config webpack.common.js --watch
    devServer: {
        static: {
            directory: path.join(__dirname, 'src'),
            watch: true
        },
        compress: true,
        port: 9000,
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
            progress: true,
        },
    },
})