const Dependency = require('webpack/lib/Dependency');
const WebpackMissingModule = require('webpack/lib/dependencies/WebpackMissingModule');

class OpenUI5ResourceDependency extends Dependency {
  constructor(context, modulePath, extensions, libraries, translations, failOnError, range, valueRange) {
    super();
    this.context = context;
    this.modulePath = modulePath.replace(/\//g, '\\/');
    this.extensions = extensions;
    this.libraries = libraries;
    this.translations = translations;
    this.failOnError = failOnError;
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

OpenUI5ResourceDependency.Template = class OpenUI5ResourceDependencyTemplate {
  apply(dep, source) {
    const containsDeps = dep.module && dep.module.dependencies && dep.module.dependencies.length > 0;
    if (containsDeps) {
      source.replace(dep.valueRange[1], dep.range[1] - 1, `).replace(/^(?:\\.\\/)?${dep.modulePath}/, "."), ${JSON.stringify(dep.failOnError)})`);
      source.replace(dep.range[0], dep.valueRange[0] - 1, `__webpack_require__(${JSON.stringify(dep.module.id)})((`);
    } else {
      const content = WebpackMissingModule.module('OpenUI5 Resources (No resources configured)');
      source.replace(dep.range[0], dep.range[1] - 1, content);
    }
  }
};

module.exports = OpenUI5ResourceDependency;
