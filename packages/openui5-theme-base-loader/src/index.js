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
  const modules = options.rootPaths;
  const ext = path.extname(this.resourcePath);
  const name = this.resourcePath.replace(ext, '');
  const info = name.match(/^(.*)[/\\]themes[/\\]([^/\\]*)[/\\](.*)$/);
  let library = info[1];
  const themeName = info[2];
  const controlName = info[3];

  modules.forEach((module) => {
    const index = library.indexOf(module);
    if (index > -1) {
      library = library.substr(index + module.length + 1);
    }
  });

  const files = [
    'sap/ui/core/themes/base/base.less',
    'sap/ui/core/themes/base/global.less',
    'sap/ui/core/themes/base/shared.less',
    `${library}/themes/base/${controlName}.less`,
    `sap/ui/core/themes/${themeName}/base.less`,
    `sap/ui/core/themes/${themeName}/global.less`,
    `sap/ui/core/themes/${themeName}/shared.less`,
  ];

  const resolvePromise = name => new Promise((resolve) => {
    this.resolve(this.context, name, (err) => {
      if (err) {
        resolve(false);
      }
      resolve(true);
    });
  });

  let output = '';
  Promise.all(files.map(file => resolvePromise(file))).then((result) => {
    result.forEach((exists, index) => {
      if (exists) output = `${output}\n@import "~${files[index]}";`;
    });

    output = `${output}\n${source}`;
    callback(null, output);
  });
};
