const async = require('async');
const Tapable = require('tapable').Tapable;
const AsyncSeriesWaterfallHook = require('tapable').AsyncSeriesWaterfallHook;
const OpenUI5ResourceModule = require('./OpenUI5ResourceModule');

class OpenUI5ResourceModuleFactory extends Tapable {
  constructor(resolverFactory) {
    super();
    this.hooks = {
      beforeResolve: new AsyncSeriesWaterfallHook(['data']),
      afterResolve: new AsyncSeriesWaterfallHook(['data']),
    };
    this.resolverFactory = resolverFactory;
  }

  create(data, callback) {
    const dependencies = data.dependencies;
    const dependency = dependencies[0];
    const resolveOptions = data.resolveOptions;

    this.hooks.beforeResolve.callAsync({
      context: dependency.context,
      modulePath: dependency.modulePath,
      extensions: dependency.extensions,
      libraries: dependency.libraries,
      translations: dependency.translations,
      locales: dependency.locales ? dependency.locales : dependency.translations,
      failOnError: dependency.failOnError,
    }, (err, result) => {
      const context = result.context;
      const modulePath = result.modulePath;
      const extensions = result.extensions;
      const libraries = result.libraries;
      const translations = result.translations;
      const locales = result.locales;
      const failOnError = result.failOnError;

      const messagebundles = ['messagebundle.properties'];
      translations.forEach((translation) => {
        messagebundles.push(`messagebundle_${translation}.properties`);
      });

      const resources = [];
      libraries.forEach((library) => {
        const libSlash = library.replace(/\./g, '/');
        messagebundles.forEach((messagebundle) => {
          resources.push(`${libSlash}/${messagebundle}`);
        });
      });
      locales.forEach((translation) => {
        resources.push(`sap/ui/core/cldr/${translation}.json`);
      });

      const normalResolver = this.resolverFactory.get('normal', resolveOptions || {});

      async.map(resources, (resource, callback) => {
        normalResolver.resolve({}, dependency.context, resource, {}, (err) => {
          if (err) {
            callback(err);
            return;
          }
          callback(null, resource);
        });
      }, (err, result) => {
        if (err) {
          callback(err);
          return;
        }

        this.hooks.afterResolve.callAsync({
          context,
          modulePath,
          extensions,
          resources: result,
          failOnError,
        }, (err, result) => {
          if (err) return callback(err);

          // Ignored
          if (!result) return callback();

          return callback(null, new OpenUI5ResourceModule(result));
        });
      });
    });
  }
}

module.exports = OpenUI5ResourceModuleFactory;
