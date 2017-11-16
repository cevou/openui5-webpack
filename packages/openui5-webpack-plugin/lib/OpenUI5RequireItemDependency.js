'use strict';

const ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');
const ModuleDependencyTemplateAsRequireId = require('./ModuleDependencyTemplateAsRequireId');

class OpenUI5RequireItemDependency extends ModuleDependency {
  constructor(request, range, brackets) {
    super(request);
    this.range = range;
    this.brackets = brackets;
  }

  get type() {
    return 'openui5 require';
  }
}

OpenUI5RequireItemDependency.Template = ModuleDependencyTemplateAsRequireId;

module.exports = OpenUI5RequireItemDependency;
