const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/js/index.js',
    devtool: 'inline-source-map',
    target: 'web',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [[
                            '@babel/preset-env', {
                                targets: {
                                    esmodules: true
                                }
                            }],
                            '@babel/preset-react']
                    }
                }
            },
            {
                test: [/\.s[ac]ss$/i, /\.css$/i],
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            },
            {
                test: [/\.svg$/],
                use: {
                    loader: 'svg-url-loader',
                    options: {
                        limit: 10000
                    }
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: {
                    loader: 'null-loader'
                }
            }
        ]
    },
    plugins: [
        // Use CopyWebpackPlugin to copy all public assets to the public folder
        new CopyWebpackPlugin({
            patterns: [
                { from: './src/assets', to: './assets' },
                { from: './src/index.html', to: './index.html' }
            ]
        }),
    ],
    resolve: {
        extensions: ['.js'],
    },
    output: {
        filename: 'build/app.js',
        path: path.resolve(__dirname, 'public'),
        publicPath: path.resolve(__dirname, 'public'),
    },
};