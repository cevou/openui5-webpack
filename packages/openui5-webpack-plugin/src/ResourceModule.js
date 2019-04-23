const path = require('path');
const async = require('async');
const Module = require('webpack/lib/Module');
const ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');
const OriginalSource = require('webpack-sources').OriginalSource;
const RawSource = require('webpack-sources').RawSource;

class ResourceModule extends Module {
  constructor(options) {
    super('javascript/dynamic', options.context);
    this.options = options;
  }

  identifier() {
    return this.options.context;
  }

  readableIdentifier(requestShortener) {
    return `${requestShortener.shorten(this.options.context)} openui5 resources`;
  }

  build(options, compilation, resolver, fs, callback) {
    this.built = true;
    this.buildMeta = {};
    this.buildInfo = {
      builtTime: Date.now(),
    };

    this.dependencies = this.options.resources.map((resource) => {
      const userRequest = resource.indexOf('cldr') > -1 || resource.startsWith("./") ? resource : `./${resource}`;
      const dep = new ContextElementDependency(resource, userRequest);
      dep.optional = true;
      dep.modulePath = this.options.modulePath;
      dep.loc = dep.userRequest;
      dep.weak = true;
      return dep;
    });

    this.collectDependencies(fs, this.options, (err, dependencies) => {
      if (err) return callback(err);

      if (!dependencies) {
        return callback();
      }

      // enhance dependencies with meta info
      for (const dep of dependencies) {
        dep.modulePath = this.options.modulePath;
        dep.loc = dep.userRequest;
        dep.weak = true;
      }

      this.dependencies = this.dependencies.concat(dependencies);

      return callback();
    });
  }

  getUserRequestMap(dependencies) {
    // if we filter first we get a new array
    // therefor we dont need to create a clone of dependencies explicitly
    // therefore the order of this is !important!
    return dependencies
      .filter(dependency => dependency.module)
      .sort((a, b) => {
        if (a.userRequest === b.userRequest) {
          return 0;
        }
        return a.userRequest < b.userRequest ? -1 : 1;
      }).reduce((map, dep) => {
        map[dep.userRequest] = dep.module.id;
        return map;
      }, Object.create(null));
  }

  getWeakSyncSource(dependencies, id) {
    const map = this.getUserRequestMap(dependencies);
    return `var map = ${JSON.stringify(map, null, '\t')};
function openui5Resource(req, failOnError) {
  var id = openui5ResourceResolve(req, failOnError);
  if (id === null) {
    return null;
  }
  if(!__webpack_require__.m[id])
    throw new Error("Module '" + req + "' ('" + id + "') is not available (weak dependency)");
  return __webpack_require__(id);
};
function openui5ResourceResolve(req, failOnError) {
  var id = map[req];
  if(!(id + 1)) { // check for number or string
    if (failOnError) {
      throw new Error("Cannot find module '" + req + "'.");
    }
    return null;
  }
  return id;
};
openui5Resource.keys = function openui5ResourceKeys() {
  return Object.keys(map);
};
openui5Resource.resolve = openui5ResourceResolve;
openui5Resource.id = ${JSON.stringify(id)};
module.exports = openui5Resource;`;
  }

  getSourceForEmptyContext(id) {
    return `function webpackEmptyContext(req) {
  throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = ${JSON.stringify(id)};`;
  }

  getSourceString() {
    if (this.dependencies && this.dependencies.length > 0) {
      return this.getWeakSyncSource(this.dependencies, this.id);
    }
    return this.getSourceForEmptyContext(this.id);
  }

  getSource(sourceString) {
    if (this.useSourceMap) {
      return new OriginalSource(sourceString, this.identifier());
    }
    return new RawSource(sourceString);
  }

  source(dependencyTemplates, outputOptions, requestShortener) {
    return this.getSource(this.getSourceString(outputOptions, requestShortener));
  }

  size() {
    // TODO update
    // base penalty
    const initialSize = 160;

    // if we dont have dependencies we stop here.
    return this.dependencies.reduce((size, dependency) => size + 5 + dependency.userRequest.length, initialSize);
  }

  collectDependencies(fs, options, callback) {
    const context = options.context;
    const extensions = options.extensions;
    const addDirectory = (directory, callback) => {
      fs.readdir(directory, (err, files) => {
        if (err) {
          callback(err);
          return;
        }
        async.map(files.filter(p => p.indexOf('.') !== 0), (segment, callback) => {
          const subResource = path.join(directory, segment);

          fs.stat(subResource, (err, stat) => {
            if (err) {
              if (err.code === 'ENOENT') {
                // ENOENT is ok here because the file may have been deleted between
                // the readdir and stat calls.
                callback();
                return;
              }
              callback(err);
              return;
            }
            if (stat.isDirectory()) {
              addDirectory(subResource, callback);
            } else if (stat.isFile() && extensions.includes(path.extname(subResource).substr(1))) {
              const obj = {
                context,
                request: `.${subResource.substr(context.length).replace(/\\/g, '/')}`,
              };
              const dep = new ContextElementDependency(obj.request);
              dep.optional = true;
              callback(null, dep);
            } else {
              callback();
            }
          });
        }, (err, result) => {
          if (err) {
            callback(err);
            return;
          }

          if (!result) {
            callback(null, []);
            return;
          }

          callback(null, result.filter(i => !!i).reduce((a, i) => a.concat(i), []));
        });
      });
    };
    addDirectory(context, callback);
  }
}

module.exports = ResourceModule;
