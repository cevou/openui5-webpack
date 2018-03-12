const NullFactory = require('webpack/lib/NullFactory');
const LocalModuleDependency = require('webpack/lib/dependencies/LocalModuleDependency');
const ConstDependency = require('webpack/lib/dependencies/ConstDependency');
const ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');
const OpenUI5DefineDependency = require('./OpenUI5DefineDependency');
const OpenUI5DefineDependencyParserPlugin = require('./OpenUI5DefineDependencyParserPlugin');
const OpenUI5LazyInstanceDependency = require('./OpenUI5LazyInstanceDependency');
const OpenUI5RequireDependencyParserPlugin = require('./OpenUI5RequireDependencyParserPlugin');
const OpenUI5RequireItemDependency = require('./OpenUI5RequireItemDependency');
const OpenUI5RequireContextDependency = require('./OpenUI5RequireContextDependency');
const OpenUI5ResourceDependencyParserPlugin = require('./OpenUI5ResourceDependencyParserPlugin');
const OpenUI5ResourceDependency = require('./OpenUI5ResourceDependency');
const OpenUI5ResourceModuleFactory = require('./OpenUI5ResourceModuleFactory');

class OpenUI5Plugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { options } = this;

    const resourceModuleFactory = new OpenUI5ResourceModuleFactory(compiler.resolverFactory);

    compiler.hooks.compilation.tap('OpenUI5Plugin', (compilation, { normalModuleFactory, contextModuleFactory }) => {
      compilation.dependencyFactories.set(OpenUI5RequireItemDependency, normalModuleFactory);
      compilation.dependencyTemplates.set(OpenUI5RequireItemDependency, new OpenUI5RequireItemDependency.Template());

      compilation.dependencyFactories.set(OpenUI5RequireContextDependency, contextModuleFactory);
      compilation.dependencyTemplates.set(OpenUI5RequireContextDependency, new OpenUI5RequireContextDependency.Template());

      compilation.dependencyFactories.set(OpenUI5DefineDependency, new NullFactory());
      compilation.dependencyTemplates.set(OpenUI5DefineDependency, new OpenUI5DefineDependency.Template());

      compilation.dependencyFactories.set(OpenUI5LazyInstanceDependency, normalModuleFactory);
      compilation.dependencyTemplates.set(OpenUI5LazyInstanceDependency, new OpenUI5LazyInstanceDependency.Template());

      compilation.dependencyFactories.set(OpenUI5ResourceDependency, resourceModuleFactory);
      compilation.dependencyTemplates.set(OpenUI5ResourceDependency, new OpenUI5ResourceDependency.Template());

      compilation.dependencyFactories.set(LocalModuleDependency, new NullFactory());
      compilation.dependencyTemplates.set(LocalModuleDependency, new LocalModuleDependency.Template());

      compilation.dependencyFactories.set(ConstDependency, new NullFactory());
      compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());

      compilation.dependencyFactories.set(ContextElementDependency, normalModuleFactory);
      compilation.dependencyFactories.set(ContextElementDependency, normalModuleFactory);

      normalModuleFactory.hooks.parser.for('javascript/auto').tap('OpenUI5Plugin', (parser) => {
        new OpenUI5RequireDependencyParserPlugin(options).apply(parser);
        new OpenUI5DefineDependencyParserPlugin(options).apply(parser);
        new OpenUI5ResourceDependencyParserPlugin(options).apply(parser);
      });
    });
  }
}
module.exports = OpenUI5Plugin;
