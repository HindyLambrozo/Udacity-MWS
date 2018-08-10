// Inside of webpack.config.js:
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
    plugins: [
    // Other plugins...

    new WorkboxPlugin.InjectManifest({
      swSrc: './src/sw.js',
    })
  ]
  
  "globDirectory": ".",
  "globPatterns": [
    "**/*.{html,css,js}",
    "manifest.json",
  ],
  "globIgnores": [
    "sw.src.js",
    "workbox-config.js",
    "node_modules/**/*",
    "test/**/*",
  ],
  "swSrc": "src/sw.js",
  "swDest": "sw.js",
};
