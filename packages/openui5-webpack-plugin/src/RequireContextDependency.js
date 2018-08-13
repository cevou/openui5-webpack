const ContextDependency = require('webpack/lib/dependencies/ContextDependency');
const ContextDependencyTemplateAsRequireCall = require('webpack/lib/dependencies/ContextDependencyTemplateAsRequireCall');

class RequireContextDependency extends ContextDependency {
  constructor(options, range, valueRange) {
    super(options);
    this.range = range;
    this.valueRange = valueRange;
  }

  get type() {
    return 'openui5 require context';
  }
}

RequireContextDependency.Template = ContextDependencyTemplateAsRequireCall;

module.exports = RequireContextDependency;
