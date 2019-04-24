const cssnano = require('cssnano');
const lessOpenUI5 = require('less-openui5');
const path = require("path");
const { OriginalSource } = require('webpack-sources');
const NullFactory = require('webpack/lib/NullFactory');
const LocalModuleDependency = require('webpack/lib/dependencies/LocalModuleDependency');
const ConstDependency = require('webpack/lib/dependencies/ConstDependency');
const ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');
const DefineDependency = require('./DefineDependency');
const DefineDependencyParserPlugin = require('./DefineDependencyParserPlugin');
const DynamicContextModule = require('./DynamicContextModule');
const DynamicContextModuleFactory = require('./DynamicContextModuleFactory');
const OpenUI5ViewDependency = require('./ViewDependency');
const RequireDependencyParserPlugin = require('./RequireDependencyParserPlugin');
const RequireDependency = require('./RequireDependency');
const RequireItemDependency = require('./RequireItemDependency');
const RequireContextDependency = require('./RequireContextDependency');
const RequireDynamicContextDependency = require('./RequireDynamicContextDependency');
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
    const { modulePath } = options;

    const resourceModuleFactory = new ResourceModuleFactory(compiler.resolverFactory);
    const dynamicContextModuleFactory = new DynamicContextModuleFactory(options.requireSync);

    compiler.hooks.compilation.tap('OpenUI5Plugin', (compilation, { normalModuleFactory, contextModuleFactory }) => {
      compilation.dependencyFactories.set(RequireDependency, new NullFactory());
      compilation.dependencyTemplates.set(RequireDependency, new RequireDependency.Template());

      compilation.dependencyFactories.set(RequireItemDependency, normalModuleFactory);
      compilation.dependencyTemplates.set(RequireItemDependency, new RequireItemDependency.Template());

      compilation.dependencyFactories.set(RequireContextDependency, contextModuleFactory);
      compilation.dependencyTemplates.set(RequireContextDependency, new RequireContextDependency.Template());

      compilation.dependencyFactories.set(RequireDynamicContextDependency, dynamicContextModuleFactory);
      compilation.dependencyTemplates.set(RequireDynamicContextDependency, new RequireDynamicContextDependency.Template());

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

      // Resolve module path
      normalModuleFactory.hooks.beforeResolve.tap('OpenUI5Plugin', (options) => {
        const { context, request } = options;
        if (request.startsWith(modulePath)) {
          let relative = path.relative(context, compilation.options.context);
          if (relative.substr(0, 1) !== '.') {
            relative = `.${relative}`;
          }

          options.request = request.replace(modulePath, relative);
        }
      });

      compilation.hooks.optimizeTree.tapAsync('OpenUI5Plugin', (chunks, modules, callback) => {
        let dynamicContextModule;
        let dependencies = [];
        for (const module of modules) {
          if (module instanceof DynamicContextModule) {
            dynamicContextModule = module;
          } else if (module.loaders && module.loaders.filter(loader => loader.loader.indexOf("openui5-xml-loader") > -1).length > 0) {
            dependencies = [...dependencies, ...module.dependencies];
          }
        }
        if (options.libs) {
          // UI5 core makes dynamic request for libraries specified in manifest
          for (const lib of options.libs) {
            dependencies = [...dependencies, new RequireItemDependency(`${lib.replace(/\./g, "/")}/library`, null, false)];
          }
        }
        if (dynamicContextModule) {
          dynamicContextModule.addAdditionalDependencies(dependencies);
          compilation.rebuildModule(dynamicContextModule, (err) => {
            if (err) {
              compilation.errors.push(err);
            }
            callback();
          })
        } else {
          callback();
        }
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
                rootPaths: compilation.options.resolve.modules,
                library: {
                  name: lib,
                },
              }).then(result => cssnano.process(result.css, {
                postcssNormalizeUrl: false,
                reduceIdents: false,
                from: undefined,
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
