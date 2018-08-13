const cssnano = require('cssnano');
const lessOpenUI5 = require('less-openui5');
const { OriginalSource } = require('webpack-sources');
const NullFactory = require('webpack/lib/NullFactory');
const LocalModuleDependency = require('webpack/lib/dependencies/LocalModuleDependency');
const ConstDependency = require('webpack/lib/dependencies/ConstDependency');
const ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');
const DefineDependency = require('./DefineDependency');
const DefineDependencyParserPlugin = require('./DefineDependencyParserPlugin');
const OpenUI5ViewDependency = require('./ViewDependency');
const RequireDependencyParserPlugin = require('./RequireDependencyParserPlugin');
const RequireDependency = require('./RequireDependency');
const RequireItemDependency = require('./RequireItemDependency');
const RequireContextDependency = require('./RequireContextDependency');
const ResourceDependencyParserPlugin = require('./ResourceDependencyParserPlugin');
const ResourceDependency = require('./ResourceDependency');
const ResourceModuleFactory = require('./ResourceModuleFactory');
const JQueryDependencyParserPlugin = require('./JQueryDependencyParserPlugin');
const JQueryItemDependency = require('./JQueryItemDependency');
const GlobalDependencyParserPlugin = require('./GlobalDependencyParserPlugin');
const ViewDependencyParserPlugin = require('./ViewDependencyParserPlugin');

class OpenUI5Plugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    const { options } = this;

    const resourceModuleFactory = new ResourceModuleFactory(compiler.resolverFactory);

    compiler.hooks.compilation.tap('OpenUI5Plugin', (compilation, { normalModuleFactory, contextModuleFactory }) => {
      compilation.dependencyFactories.set(RequireDependency, new NullFactory());
      compilation.dependencyTemplates.set(RequireDependency, new RequireDependency.Template());

      compilation.dependencyFactories.set(RequireItemDependency, normalModuleFactory);
      compilation.dependencyTemplates.set(RequireItemDependency, new RequireItemDependency.Template());

      compilation.dependencyFactories.set(RequireContextDependency, contextModuleFactory);
      compilation.dependencyTemplates.set(RequireContextDependency, new RequireContextDependency.Template());

      compilation.dependencyFactories.set(DefineDependency, new NullFactory());
      compilation.dependencyTemplates.set(DefineDependency, new DefineDependency.Template());

      compilation.dependencyFactories.set(JQueryItemDependency, normalModuleFactory);
      compilation.dependencyTemplates.set(JQueryItemDependency, new JQueryItemDependency.Template());

      compilation.dependencyFactories.set(ResourceDependency, resourceModuleFactory);
      compilation.dependencyTemplates.set(ResourceDependency, new ResourceDependency.Template());

      compilation.dependencyFactories.set(OpenUI5ViewDependency, normalModuleFactory);
      compilation.dependencyTemplates.set(OpenUI5ViewDependency, new OpenUI5ViewDependency.Template());

      compilation.dependencyFactories.set(LocalModuleDependency, new NullFactory());
      compilation.dependencyTemplates.set(LocalModuleDependency, new LocalModuleDependency.Template());

      compilation.dependencyFactories.set(ConstDependency, new NullFactory());
      compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());

      compilation.dependencyFactories.set(ContextElementDependency, normalModuleFactory);
      compilation.dependencyFactories.set(ContextElementDependency, normalModuleFactory);

      normalModuleFactory.hooks.parser.for('javascript/auto').tap('OpenUI5Plugin', (parser) => {
        new RequireDependencyParserPlugin(options).apply(parser);
        new DefineDependencyParserPlugin(options).apply(parser);
        new JQueryDependencyParserPlugin().apply(parser);
        new GlobalDependencyParserPlugin().apply(parser);
        new ViewDependencyParserPlugin(options).apply(parser);
        new ResourceDependencyParserPlugin(options).apply(parser);
      });
    });

    if (options.theme) {
      compiler.hooks.thisCompilation.tap('OpenUI5Plugin', (compilation) => {
        compilation.hooks.additionalAssets.tapAsync('OpenUI5Plugin', (callback) => {
          const builder = new lessOpenUI5.Builder();
          const promises = [];

          let themes = options.theme;
          if (!Array.isArray(themes)) {
            themes = [themes];
          }

          for (const theme of themes) {
            for (const lib of options.libs) {
              const libPath = `${lib.replace(/\./g, '/')}/themes/${theme}`;
              const promise = builder.build({
                lessInputPath: `${libPath}/library.source.less`,
                rootPaths: options.rootPaths,
                library: {
                  name: lib,
                },
              }).then(result => cssnano.process(result.css, {
                postcssNormalizeUrl: false,
              }).then((result) => {
                const file = `${libPath}/library.css`;
                compilation.assets[file] = new OriginalSource(result.css, file);
              })).catch(callback);

              promises.push(promise);
            }
          }

          Promise.all(promises).then(() => {
            callback();
          }).catch(callback);
        });
      });
    }
  }
}
module.exports = OpenUI5Plugin;
