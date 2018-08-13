const ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');
const WebpackMissingModule = require('webpack/lib/dependencies/WebpackMissingModule');

class ViewDependency extends ModuleDependency {
  constructor(request, object, range) {
    super(request);
    this.range = range;
    this.object = object;
  }

  get type() {
    return 'openui5 view';
  }
}

ViewDependency.Template = class ViewDependencyTemplate {
  apply(dep, source, outputOptions, requestShortener) {
    if (!dep.range) return;
    const comment = outputOptions.pathinfo ? `/*! ${requestShortener.shorten(dep.request)} */ ` : '';
    let content;
    if (dep.module) {
      content = `new (__webpack_require__(${comment}${JSON.stringify(dep.module.id)}))(${dep.object})`;
    } else {
      content = WebpackMissingModule.module(dep.request);
    }
    source.replace(dep.range[0], dep.range[1] - 1, content);
  }
};

module.exports = ViewDependency;
