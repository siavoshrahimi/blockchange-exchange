const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
    // The Webpack config to use when compiling your react app for development or production.
    webpack: function(config, env) {
        // ...add your webpack config

        config.plugins.push(new NodePolyfillPlugin({
            excludeAliases: ['console'],
        }));


        return config


    },

}