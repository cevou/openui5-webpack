const path = require('path');
const loaderUtils = require('loader-utils');

module.exports = function (source) {
  const defaultOptions = {
    theme: 'sap_belize',
    rootPaths: ['node_modules'],
  };

  const options = Object.assign(
    {},
    defaultOptions,
    loaderUtils.getOptions(this),
  );

  const callback = this.async();
  const theme = options.theme;
  const modules = options.rootPaths;
  const ext = path.extname(this.resourcePath);
  let name = this.resourcePath.replace(ext, '');

  modules.forEach((module) => {
    const index = name.indexOf(module);
    if (index > -1) {
      name = name.substr(index + module.length + 1);
    }
  });

  const parts = name.split('/');
  const controlName = parts.pop();
  const library = parts.join('/');
  const styleName = `${library}/themes/${theme}/${controlName}.less`;
  const baseStyleName = `${library}/themes/base/${controlName}.less`;

  const resolvePromise = name => new Promise((resolve) => {
    this.resolve(this.context, name, (err) => {
      if (err) {
        resolve(false);
      }
      resolve(name);
    });
  });

  // check if style file exists
  resolvePromise(styleName).then((name) => {
    if (!name) {
      // fallback to base
      return resolvePromise(baseStyleName);
    }
    return name;
  }).then((name) => {
    // only if style was found
    if (name) {
      this.addDependency(name);
      source = `require("${name}");
${source}
`;
    }
    callback(null, source);
  });
};
