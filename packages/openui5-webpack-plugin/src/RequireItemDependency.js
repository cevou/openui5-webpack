const ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');
const ModuleDependencyTemplateAsRequireId = require('./ModuleDependencyTemplateAsRequireId');

class RequireItemDependency extends ModuleDependency {
  constructor(request, range, brackets) {
    super(request);
    this.range = range;
    this.brackets = brackets;
  }

  get type() {
    return 'openui5 require item';
  }
}

RequireItemDependency.Template = ModuleDependencyTemplateAsRequireId;

module.exports = RequireItemDependency;
