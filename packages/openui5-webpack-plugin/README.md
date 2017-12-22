<div align="center">
  <a href="http://openui5.org">
    <img width="571" height="200"
      src="http://openui5.org/images/OpenUI5_new_big_side.png">
  </a>
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>OpenUI5 Plugin</h1>
  <p>Bundle OpenUI5/SAPUI5 applications with webpack.</p>
</div>


<h2 align="center">Install</h2>

```bash
npm install --save-dev openui5-webpack-plugin
```

<h2 align="center">Usage</h2>

```js
const OpenUI5Plugin = require("openui5-webpack-plugin");

module.exports = {
  plugins: [
    new OpenUI5Plugin({
      modulePath: 'my/resource/module/path',
      libs: ['sap.ui.core', 'sap.m'],
      translations: ['en', 'de']
    }),
  ]
}
```

This enables webpack to understand the OpenUI5 module syntax. Depending on where
you store the OpenUI5 sources you have to extend this configuration, so webpack
can resolve the module paths.

By default, OpenUI5 does not have a static dependency from controls to their renderer.
We need to add this dependency using the `openui5-renderer-loader` during the build.

Additionally OpenUI5 assumes that some modules (`jQuery`) are available in the global space.
Therefore you need to load them using the `script-loader`. Also some of the OpenUI5
modules do not export their module by default. We need to fix this using the `exports-loader`.

If you use the packages published via Bower this would look like this:

```js
const OpenUI5Plugin = require("openui5-webpack-plugin");

module.exports = {
  resolve: {
    "modules": [
      "bower_components/openui5-sap.ui.core/resources",
      "bower_components/openui5-sap.ui.core/resources/sap/ui/thirdparty",
      "bower_components/openui5-sap.m/resources",
      "node_modules"
    ]
  },
  module: {
    rules: [
      {
        test: /bower_components[/\\]openui5-sap.*\.js$/,
        use: 'openui5-renderer-loader'
      },
      {
        test: /sap[/\\]ui[/\\]thirdparty[/\\](?:jquery\.js|jquery-mobile-custom\.js)/,
        use: 'script-loader',
      },
      {
        test: /jquery\.sap\.global\.js$/,
        use: {
          loader: 'exports-loader',
          query: 'jQuery'
        },
      },
      {
        test: /sap[/\\]ui[/\\]Device.js$/,
        use: {
          loader: 'exports-loader',
          query: 'window.sap.ui.Device'
        },
      }
    ],
  },
  plugins: [
    new OpenUI5Plugin({
      modulePath: 'my/resource/module/path',
      libs: ['sap.ui.core', 'sap.m'],
      translations: ['en', 'de']
    }),
  ]
}
```
