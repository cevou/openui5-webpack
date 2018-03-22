import loaderUtils from 'loader-utils';

module.exports = function (source) {
  const defaultOptions = {
    filterRegEx: /[/\\]resources[/\\](.*)\.js$/,
  };

  const options = Object.assign(
    {},
    defaultOptions,
    loaderUtils.getOptions(this),
  );

  const path = this.resourcePath;
  const control = path.match(options.filterRegEx);

  let output = source;

  if (control) {
    const callback = this.async();
    const name = control[1].replace(/\\/g, '/');
    const rendererName = `${name}Renderer`;
    this.resolve(this.context, rendererName, (err) => {
      if (!err) {
        this.addDependency(rendererName);
        output = `${source}
sap.ui.define(['jquery.sap.global'], function(jQuery) {
jQuery.sap.setObject("${rendererName.replace(/\//g, '.')}", require("${rendererName}"));
});`;
      }
      callback(null, output);
    });
  } else {
    return output;
  }
  return '';
};
