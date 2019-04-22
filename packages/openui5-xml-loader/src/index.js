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
      callback(new Error(`Invalid XML: ${err.toString()}`));
      return;
    }
    const key = Object.keys(result)[0];
    const view = result[key];

    const viewAttributes = view.$;
    let controllerName;
    Object.keys(viewAttributes).forEach((key) => {
      if (key.substr(0, 5) === 'xmlns') {
        namespaces[key.substr(6)] = viewAttributes[key].replace(/\./g, '/');
      } else if (key === "controllerName") {
        controllerName = `${viewAttributes["controllerName"].replace(/\./g, '/')}.controller`;
      }
    });
    processNodes(view);
    let requires = '';
    Object.keys(controls).forEach((name) => {
      const path = replaceModulePaths(name);
      this.addDependency(path);
      requires += `sap.ui.requireSync("${path}");\n`;
    });
    if (controllerName) {
      const path = replaceModulePaths(controllerName);
      this.addDependency(path);
      requires += `sap.ui.requireSync("${path}");\n`;
    }

    const output = `
      ${requires}
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
