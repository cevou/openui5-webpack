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

<h2 align="center">What it does</h2>

The `openui5-webpack-plugin` adds support for the OpenUI5 module syntax (`sap.ui.require`, `sap.ui.define`, etc.) to 
webpack. Additionally it enables webpack to understand specific concepts within OpenUI5 like loading resources
(`jQuery.sap.loadResource`, `LoaderExtensions.loadResource`) as well as creating views.

This plugin only optimizes the JavaScript part of OpenUI5 applications. Support to create theme css files is available,
but it will use the standard `less-openui5` library to do that.

<h2 align="center">Usage</h2>

Add the OpenUI5 plugin to your webpack configuration. For webpack to be able to resolve the paths used in OpenUI5 
dependencies, all libraries have to be added in the modules section of the webpack configuration. 

As webpack is also processing the sources of third party libraries which are stored in the `thirdparty` folder the 
thirdparty folder needs to be added as well.

Depending on the theme that you are using it might be necessary to make some SAP fonts available. This fonts can be
copied to the target directory using the `copy-webpack-plugin`. The example below shows the setup if you are using the
`themelib_sap_belize`.

```js
const OpenUI5Plugin = require("openui5-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  resolve: {
    modules: [
      "node_modules/@openui5/sap.m/src",
      "node_modules/@openui5/sap.ui.core/src",
      "node_modules/@openui5/sap.ui.core/src/sap/ui/thirdparty",
      "node_modules/@openui5/themelib_sap_belize/src",
      "node_modules"
    ],
  },
  plugins: [
    new OpenUI5Plugin({
      modulePath: 'my/resource/module/path',
      libs: ['sap.ui.core', 'sap.m'],
      translations: ['en', 'de'],
      theme: ['sap_belize'],
      requireSync: [],
      manifest: "./manifest.json"
    }),
    new CopyWebpackPlugin([
      {
        context: path.resolve(__dirname, "node_modules/@openui5/sap.ui.core/src"),
        from: {
          glob: "sap/ui/core/themes/base/fonts/**",
        },
      },
      {
        context: path.resolve(__dirname, "node_modules/@openui5/themelib_sap_belize/src"),
        from: {
          glob: "sap/ui/core/themes/sap_belize_plus/fonts/**",
        },
      }
    ]),
  ]
}
```

<h2 align="center">Options</h2>

### modulePath

This is the module path you use for the UI5 application. If you application uses the path `sap.ui.demo.todo.Component`
then you you specify `sap/ui/demo/todo` as the module path.

### libs

An array of UI5 libs the application uses. This information is used to automatically include the different library files 
in the bundle as well as to build the themes for the application.

### translations

Specify which translations the app uses. This will include the correct `properties` files in in the resource module.

### theme

A string or an array of strings which themes should be included in the application. This plugin uses
the `less-openui5` package to build the UI5 themes with webpack.

### requireSync

UI5 uses dynamic `sap.ui.requireSync` calls within it's code. This means that the information which module
should be loaded is only available at runtime. However, webpack does a static code analysis and cannot detect
the modules used by the `sap.ui.requireSync` calls.

This plugin replaces the calls with a static lookup module to resolve dependencies. For this to work the user 
has to specify which modules are needed at any time in the application. It will create weak dependencies to the 
specified files.

### manifest

The path pointing to the manifest file (if needed for the application). This will add the manifest file to the resource 
module, so that webpack is able to resolve it.
