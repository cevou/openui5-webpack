const ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');
const ModuleDependencyTemplateAsRequireId = require('./ModuleDependencyTemplateAsRequireId');

class JQueryItemDependency extends ModuleDependency {
  constructor(request, range, brackets) {
    super(request);
    this.range = range;
    this.brackets = brackets;
  }

  get type() {
    return 'openui5 jquery require item';
  }
}

JQueryItemDependency.Template = ModuleDependencyTemplateAsRequireId;

module.exports = JQueryItemDependency;
