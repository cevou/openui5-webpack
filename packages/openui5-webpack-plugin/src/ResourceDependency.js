const Dependency = require('webpack/lib/Dependency');
const WebpackMissingModule = require('webpack/lib/dependencies/WebpackMissingModule');

class ResourceDependency extends Dependency {
  constructor(context, modulePath, extensions, libraries, translations, failOnError, async, range, valueRange) {
    super();
    this.context = context;
    this.modulePath = modulePath.replace(/\//g, '\\/');
    this.extensions = extensions;
    this.libraries = libraries;
    this.translations = translations;
    this.failOnError = failOnError;
    this.async = async;
    this.range = range;
    this.valueRange = valueRange;
  }

  getResourceIdentifier() {
    return `openui5resource${this.context} ${this.modulePath}`;
  }

  get type() {
    return 'openui5 resource';
  }
}

ResourceDependency.Template = class ResourceDependencyTemplate {
  apply(dep, source) {
    const containsDeps = dep.module && dep.module.dependencies && dep.module.dependencies.length > 0;
    if (containsDeps) {
      if (dep.async) {
        source.insert(dep.range[0], "Promise.resolve().then(function() { return ");
        source.insert(dep.range[1], "; })");
      }

      source.replace(dep.valueRange[1], dep.range[1] - 1, `).replace(/^(?:\\.\\/)?${dep.modulePath}/, "."), ${JSON.stringify(dep.failOnError)})`);
      source.replace(dep.range[0], dep.valueRange[0] - 1, `__webpack_require__(${JSON.stringify(dep.module.id)})((`);
    } else {
      const content = WebpackMissingModule.module('OpenUI5 Resources (No resources configured)');
      source.replace(dep.range[0], dep.range[1] - 1, content);
    }
  }
};

module.exports = ResourceDependency;
