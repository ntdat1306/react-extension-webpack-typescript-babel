const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');

module.exports = merge(common, {
    mode: 'production',
    // optimization: {
    //     minimize: false, // Disable code obfuscation
    // },
});
