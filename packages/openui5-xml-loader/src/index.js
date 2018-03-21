import path from 'path';
import { parseString } from 'xml2js';
import loaderUtils from 'loader-utils';

module.exports = function (source) {
  const defaultOptions = {
    modulePaths: [],
  };

  const options = Object.assign(
    {},
    defaultOptions,
    loaderUtils.getOptions(this),
  );

  const callback = this.async();
  const namespaces = {};
  const controls = {};
  const modulePaths = {};

  Object.keys(options.modulePaths).map((key) => {
    let relative = path.relative(this.context, options.modulePaths[key]);
    if (relative.substr(0, 1) !== '.') {
      relative = `./${relative}`;
    }

    modulePaths[key.replace(/\./g, '/')] = relative;

    return null;
  });

  const replaceModulePaths = (p) => {
    Object.keys(modulePaths).forEach((modulePath) => {
      p = p.replace(modulePath, modulePaths[modulePath]);
    });
    return p;
  };

  parseString(source, (err, result) => {
    if (err) {
      callback(err);
      return;
    }
    let view = result['mvc:View'];
    if (!view) {
      view = result['core:FragmentDefinition'];
    }
    const viewAttributes = view.$;
    Object.keys(viewAttributes).forEach((key) => {
      if (key.substr(0, 5) === 'xmlns') {
        namespaces[key.substr(6)] = viewAttributes[key].replace(/\./g, '/');
      }
    });
    processNodes(view);
    let requires = '';
    let objects = '';
    Object.keys(controls).forEach((name) => {
      const path = replaceModulePaths(name);
      this.addDependency(path);
      requires += `"${name}.js": function(){require("${path}")},\n`;
      objects += `jQuery.sap.setObject("${name.replace(/\//g, '.')}", require("${path}"));\n`;
    });

    const output = `
      var jQuery = require('jquery.sap.global');
      jQuery.sap.registerPreloadedModules({
        version: "2.0",
        url: '.',
        modules: {
          ${requires}
        }
      });
      ${objects}
      var parser = new DOMParser();
      var xml = parser.parseFromString(${JSON.stringify(source)}, "text/xml");
      module.exports = xml;
    `;

    callback(null, output);
  });

  function processNodes(node) {
    Object.keys(node).forEach((key) => {
      if (key === '$') {
        return;
      }
      const identifier = key.split(':');
      if (identifier.length === 1) {
        addControl('', identifier[0]);
      } else {
        addControl(identifier[0], identifier[1]);
      }
      node[key].forEach(processNodes);
    });
  }

  function addControl(ns, name) {
    const start = name.charAt(0);
    // Only process controls no aggregations
    if (start === start.toUpperCase()) {
      const moduleName = `${namespaces[ns]}/${name}`;
      controls[moduleName] = true;
    }
  }
};
