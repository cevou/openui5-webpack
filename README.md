<div align="center">
  <a href="http://openui5.org">
    <img width="571" height="200"
      src="http://openui5.org/images/OpenUI5_new_big_side.png">
  </a>
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>OpenUI5 Webpack</h1>
  <p>This repository contains some projects to build OpenUI5/SAPUI5 applications with webpack.</p>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/openui5-webpack-plugin"><img src="https://img.shields.io/npm/v/openui5-webpack-plugin.svg?style=flat-square"></a>
  <a href="https://travis-ci.org/cevou/openui5-webpack-plugin"><img src="https://img.shields.io/travis/cevou/openui5-webpack/master.svg?style=flat-square"></a>
</p>

<h2 align="center">Projects</h2>

### openui5-webpack-plugin

This is the main plugin for webpack to build UI5 applications. It enables webpack to understand the UI5 module system.

[Documentation](packages/openui5-webpack-plugin/README.md)

### openui5-render-loader

By default UI5 controls don't have a dependency to their renderer. This loader scans UI5 controls and adds a dependency
to the control, so that the renderer is included in the build.

[Documentation](packages/openui5-renderer-loader/README.md)

### openui5-xml-loader

This loader parses XML views and adds all controls used in XML views as dependency.

[Documentation](packages/openui5-xml-loader/README.md)

### openui5-manifest-loader

The manifest loader preprocesses a `manifest.json` file and adds dependencies for the libraries and modules specified in it.

[Documentation](packages/openui5-manifest-loader/README.md)

<h2 align="center">Install</h2>

Please check the `README.md` files of the sub packages to find out more about how to install and configure the 
different plugins/loaders. 

<h2 align="center">Usage</h2>

Depending on your project setup you will need a different combination of plugin and loaders.

- `openui5-webpack-plugin` is always needed
- `openui5-renderer-loader` is always needed
- `openui5-xml-loader` is only needed if you use XML Views in your application
- `openui5-manifest-loader` is only needed if you have a component and a separate `manifest.json` file

Check out the modified [`openui5-sample-app`](https://github.com/cevou/openui5-sample-app) for a working example.
