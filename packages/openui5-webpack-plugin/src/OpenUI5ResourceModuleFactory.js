const async = require('async');
const Tapable = require('tapable');
const OpenUI5ResourceModule = require('./OpenUI5ResourceModule');

class OpenUI5ResourceModuleFactory extends Tapable {
  constructor(resolvers) {
    super();
    this.resolvers = resolvers;
  }

  create(data, callback) {
    const dependencies = data.dependencies;
    const dependency = dependencies[0];

    this.applyPluginsAsyncWaterfall('before-resolve', {
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
      const resolvers = this.resolvers;

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

      async.map(resources, (resource, callback) => {
        resolvers.normal.resolve({}, dependency.context, resource, (err) => {
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

        this.applyPluginsAsyncWaterfall('after-resolve', {
          context,
          modulePath,
          extensions,
          resources: result,
          failOnError,
        }, (err, result) => {
          if (err) return callback(err);

          // Ignored
          if (!result) return callback();

          return callback(null, new OpenUI5ResourceModule(
            result.context,
            result.modulePath,
            result.extensions,
            result.resources,
            result.failOnError,
          ));
        });
      });
    });
  }
}

module.exports = OpenUI5ResourceModuleFactory;
