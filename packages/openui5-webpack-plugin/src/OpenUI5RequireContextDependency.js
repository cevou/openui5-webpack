const ContextDependency = require('webpack/lib/dependencies/ContextDependency');
const ContextDependencyTemplateAsRequireCall = require('webpack/lib/dependencies/ContextDependencyTemplateAsRequireCall');

class OpenUI5RequireContextDependency extends ContextDependency {
  constructor(options, range, valueRange) {
    super(options);
    this.range = range;
    this.valueRange = valueRange;
  }

  get type() {
    return 'openui5 require context';
  }
}

OpenUI5RequireContextDependency.Template = ContextDependencyTemplateAsRequireCall;

module.exports = OpenUI5RequireContextDependency;
