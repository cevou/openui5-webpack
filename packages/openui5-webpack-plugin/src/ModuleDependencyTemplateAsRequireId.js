const WebpackMissingModule = require('webpack/lib/dependencies/WebpackMissingModule');

class ModuleDependencyTemplateAsRequireId {
  apply(dep, source, outputOptions, requestShortener) {
    if (!dep.range) return;
    const comment = outputOptions.pathinfo ? `/*! ${requestShortener.shorten(dep.request)} */ ` : '';
    let content;
    if (dep.module) { content = `__webpack_require__(${comment}${JSON.stringify(dep.module.id)})`; } else { content = WebpackMissingModule.module(dep.request); }
    if (dep.brackets) {
      content = `(${content})`;
    }
    source.replace(dep.range[0], dep.range[1] - 1, content);
  }
}
module.exports = ModuleDependencyTemplateAsRequireId;
