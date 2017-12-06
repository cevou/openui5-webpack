const ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');
const WebpackMissingModule = require('webpack/lib/dependencies/WebpackMissingModule');

class OpenUI5LazyInstanceDependency extends ModuleDependency {
  constructor(request, instance, range) {
    super(request);
    this.range = range;
    this.instance = instance;
  }

  get type() {
    return 'openui5 lazy';
  }
}

OpenUI5LazyInstanceDependency.Template = class OpenUI5LazyInstanceDependencyTemplate {
  apply(dep, source, outputOptions, requestShortener) {
    if (!dep.range) return;
    const comment = outputOptions.pathinfo ? `/*! ${requestShortener.shorten(dep.request)} */ ` : '';
    let content;
    if (dep.module) {
      content = `(${dep.instance} instanceof __webpack_require__(${comment}${JSON.stringify(dep.module.id)}))`;
    } else {
      content = WebpackMissingModule.module(dep.request);
    }
    source.replace(dep.range[0], dep.range[1] - 1, content);
  }
};

module.exports = OpenUI5LazyInstanceDependency;
