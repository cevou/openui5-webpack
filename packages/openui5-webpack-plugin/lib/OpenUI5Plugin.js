'use strict';

const NullFactory = require('webpack/lib/NullFactory');
const LocalModuleDependency = require("webpack/lib/dependencies/LocalModuleDependency");
const OpenUI5DefineDependency = require('./OpenUI5DefineDependency');
const OpenUI5DefineDependencyParserPlugin = require('./OpenUI5DefineDependencyParserPlugin');
const OpenUI5LazyInstanceDependency = require('./OpenUI5LazyInstanceDependency');
const OpenUI5RequireDependencyParserPlugin = require('./OpenUI5RequireDependencyParserPlugin');
const OpenUI5RequireItemDependency = require('./OpenUI5RequireItemDependency');
const OpenUI5RequireContextDependency = require('./OpenUI5RequireContextDependency');

class OpenUI5Plugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { options } = this;

    compiler.plugin('compilation', (compilation, params) => {
      const { normalModuleFactory, contextModuleFactory } = params;

      compilation.dependencyFactories.set(OpenUI5RequireItemDependency, normalModuleFactory);
      compilation.dependencyTemplates.set(OpenUI5RequireItemDependency, new OpenUI5RequireItemDependency.Template());

      compilation.dependencyFactories.set(OpenUI5RequireContextDependency, contextModuleFactory);
      compilation.dependencyTemplates.set(OpenUI5RequireContextDependency, new OpenUI5RequireContextDependency.Template());

      compilation.dependencyFactories.set(OpenUI5DefineDependency, new NullFactory());
      compilation.dependencyTemplates.set(OpenUI5DefineDependency, new OpenUI5DefineDependency.Template());

      compilation.dependencyFactories.set(OpenUI5LazyInstanceDependency, normalModuleFactory);
      compilation.dependencyTemplates.set(OpenUI5LazyInstanceDependency, new OpenUI5LazyInstanceDependency.Template());

      compilation.dependencyFactories.set(LocalModuleDependency, new NullFactory());
      compilation.dependencyTemplates.set(LocalModuleDependency, new LocalModuleDependency.Template());

      normalModuleFactory.plugin('parser', (parser) => {
        parser.apply(
          new OpenUI5RequireDependencyParserPlugin(options),
          new OpenUI5DefineDependencyParserPlugin(options),
        );
      });
    });
  }
}
module.exports = OpenUI5Plugin;
