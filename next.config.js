const withImages = require('next-images');
const withPlugins = require('next-compose-plugins');

module.exports = withPlugins([
    withImages,
], {
    webpack(webpackConfig) {
        const originalEntry = webpackConfig.entry;
        webpackConfig.entry = async() => {
            const entries = await originalEntry();
            if (entries['main.js'] && !entries['main.js'].includes('./util/polyfills.js')) {
                entries['main.js'].unshift('./util/polyfills.js');
            }

            return entries;
        };


        return webpackConfig;
    },
});
