const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Setting folder structure after build, format `folderContain/fileName.js`
const pathPopup = 'popup/popup';
const pathNewTab = 'new-tab/new-tab';
const pathOptions = 'options/options';
const pathBackground = 'background/background';
const pathContentScripts = 'content-scripts/content-scripts';

module.exports = {
    entry: {
        [pathPopup]: path.resolve('src/features/popup/index.tsx'),
        [pathNewTab]: path.resolve('src/features/newTab/index.tsx'),
        [pathOptions]: path.resolve('src/features/options/index.tsx'),
        [pathBackground]: path.resolve('src/features/background/background.ts'),
        [pathContentScripts]: path.resolve('src/features/contentScripts/index.tsx'),
    },
    module: {
        rules: [
            {
                test: /\.(?:js|ts|jsx|tsx)$/,
                use: ['babel-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
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
                type: 'assets/resource',
                test: /\.(png|jpg|jpeg|gif|woff|woff2|tff|eot|svg)$/,
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false,
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve('src/styles/content-scripts.css'),
                    to: path.resolve('dist/content-scripts'),
                },
                {
                    from: path.resolve('src/assets'),
                    to: path.resolve('dist/assets'),
                },
                {
                    from: path.resolve('src/static/manifest.json'),
                    to: path.resolve('dist'),
                },
                // You have to differentiate between context and from.
                // context: is the root path for the source files, and will not be added to the target paths.
                // from: The paths determined by the from glob, however, will be added to the target paths.
                {
                    context: __dirname + '/src/static',
                    from: '*.png',
                    to: path.resolve('dist/icons'),
                },
            ],
        }),
        ...getHtmlWebpackPlugins([pathPopup, pathOptions, pathNewTab]),
    ],
    resolve: {
        alias: {
            '@styles': path.resolve(__dirname, 'src/styles'),
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist'),
    },
    // Don't use optimization, this cause content-scripts can not render React component
    // optimization: {
    //     splitChunks: {
    //         chunks: 'all',
    //     },
    // },
    performance: {
        hints: false,
    },
};

function getHtmlWebpackPlugins(chunks) {
    return chunks.map(
        (chunk) =>
            new HtmlWebpackPlugin({
                title: 'React Extension',
                filename: `${chunk}.html`,
                chunks: [chunk],
            })
    );
}
