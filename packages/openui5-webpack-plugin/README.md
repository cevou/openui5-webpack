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
      translations: ['en', 'de'],
      theme: ['sap_belize'],
      rootPaths: [],
      requireSync: [],
    }),
  ]
}
```

This enables webpack to understand the OpenUI5 module syntax. Depending on where
you store the OpenUI5 sources you have to extend this configuration, so webpack
can resolve the module paths.

### modulePath

This is the module path you use for the UI5 application.

### libs

An array of UI5 libs the application uses. This information is also used to build the correct theme.

### translations

Specify which translations the app uses/specifies.

### theme

A string or an array of strings which themes should be included in the application. This plugin uses
the `less-openui5` package to build the UI5 themes with webpack.

### rootPaths

This array specifies all root paths which webpack should use to find UI5 resources. If you use the OpenUI5
modules from npm you would have to specify a list of all included packages.

Example:
```json
[
  "node_modules/@openui5/sap.m/src",
  "node_modules/@openui5/sap.ui.core/src",
  "node_modules/@openui5/sap.ui.core/src/sap/ui/thirdparty",
  "node_modules/@openui5/themelib_sap_belize/src",
  "node_modules"
]
```

### requireSync

UI5 uses dynamic `sap.ui.requireSync` calls within it's code. This means that the information which module
should be loaded is only available at runtime. However, webpack does a static code analysis and cannot detect
the modules used by the `sap.ui.requireSync` calls.

This plugin replaces the calls with a static lookup module to resolve dependencies. For this to work the user 
has to specify which modules are needed at any time in the application. It will create weak dependencies to the 
specified files.

A common use case in the validation of controls used in XML views. Therefore all controls used in XMLViews need
to be included in this array among others.

Example:
```json
[
  "sap/m/App",
  "sap/m/Button"
]
```
