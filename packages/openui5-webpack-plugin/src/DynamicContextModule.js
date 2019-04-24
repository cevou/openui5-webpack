const Module = require('webpack/lib/Module');
const ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');
const OriginalSource = require('webpack-sources').OriginalSource;
const RawSource = require('webpack-sources').RawSource;

class DynamicContextModule extends Module {
  constructor(options) {
    super('javascript/dynamic');
    this.options = options || {};
    this.additionalDependencies = [];
  }

  identifier() {
    return 'openui5 dynamic context';
  }

  build(options, compilation, resolver, fs, callback) {
    this.built = true;
    this.buildMeta = {};
    this.buildInfo = {
      builtTime: Date.now(),
    };

    const requireSync = this.options.requireSync || [];
    const dependencies = [...requireSync, ...this.additionalDependencies];

    this.dependencies = dependencies.map((require) => {
      const dep = new ContextElementDependency(require);
      dep.optional = true;
      dep.weak = true;
      return dep;
    });

    callback()
  }

  readableIdentifier() {
    return `openui5 dynamic context`;
  }

  addAdditionalDependencies(dependencies) {
    this.additionalDependencies = dependencies.map((dependency) => dependency.request);
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
function openui5DynamicDep(req, failOnError) {
  var id = openui5DynamicDepResolve(req, failOnError);
  if (id === null) {
    return null;
  }
  if(!__webpack_require__.m[id])
    throw new Error("Module '" + req + "' ('" + id + "') is not available (weak dependency)");
  return __webpack_require__(id);
};
function openui5DynamicDepResolve(req, failOnError) {
  var id = map[req];
  if(!(id + 1)) { // check for number or string
    if (failOnError) {
      throw new Error("Cannot find module '" + req + "'.");
    }
    return null;
  }
  return id;
};
openui5DynamicDep.keys = function openui5DynamicDepKeys() {
  return Object.keys(map);
};
openui5DynamicDep.resolve = openui5DynamicDepResolve;
openui5DynamicDep.id = ${JSON.stringify(id)};
module.exports = openui5DynamicDep;`;
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
}

module.exports = DynamicContextModule;
