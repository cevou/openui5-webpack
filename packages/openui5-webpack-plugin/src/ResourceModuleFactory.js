const async = require('async');
const { Tapable } = require('tapable');
const ResourceModule = require('./ResourceModule');

class ResourceModuleFactory extends Tapable {
  constructor(resolverFactory) {
    super();

    this.resolverFactory = resolverFactory;
  }

  create(data, callback) {
    const dependencies = data.dependencies;
    const dependency = dependencies[0];
    const resolveOptions = data.resolveOptions;

    const context = dependency.context;
    const modulePath = dependency.modulePath;
    const extensions = dependency.extensions;
    const libraries = dependency.libraries;
    const translations = dependency.translations;
    const locales = dependency.locales ? dependency.locales : dependency.translations;
    const failOnError = dependency.failOnError;

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
          callback();
          return;
        }
        callback(null, resource);
      });
    }, (err, result) => {
      if (err) {
        callback(err);
        return;
      }

      const resources = result.filter(resource => resource);

      return callback(null, new ResourceModule({
        context,
        modulePath,
        extensions,
        resources,
        failOnError,
      }));
    });
  }
}

module.exports = ResourceModuleFactory;
