const OpenUI5Plugin = require('../../../src/OpenUI5Plugin');

module.exports = {
  entry: {
    build: './index.js'
  },
  resolve: {
    "modules": [
      "."
    ]
  },
  plugins: [
    new OpenUI5Plugin()
  ],
  optimization: {
    minimize: false,
    runtimeChunk: 'single',
  },
  mode: 'production'
};
