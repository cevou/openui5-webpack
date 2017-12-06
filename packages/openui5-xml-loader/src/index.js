import { parseString } from 'xml2js';

module.exports = function (source) {
  const callback = this.async();
  const namespaces = {};
  const controls = {};

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
    Object.keys(controls).forEach((name) => {
      this.addDependency(name);
      requires += `"${name}.js": function(){require("${name}")},\n`;
    });

    const output = `
      jQuery.sap.registerPreloadedModules({
        version: "2.0",
        url: '.',
        modules: {
          ${requires}
        }
      });
      module.exports = ${JSON.stringify(source)}  
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
