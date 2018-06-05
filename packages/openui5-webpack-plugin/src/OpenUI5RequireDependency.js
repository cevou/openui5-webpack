const NullDependency = require('webpack/lib/dependencies/NullDependency');

class OpenUI5RequireDependency extends NullDependency {
  constructor(range, moduleRange, arrayRange, functionRange) {
    super();
    this.range = range;
    this.moduleRange = moduleRange;
    this.arrayRange = arrayRange;
    this.functionRange = functionRange;
  }

  get type() {
    return 'openui5 define';
  }
}

OpenUI5RequireDependency.Template = class OpenUI5RequireDependencyTemplate {
  get definitions() {
    return {
      m: [
        'var __WEBPACK_UI5_REQUIRE_DEPENDENCY__;',
        `__WEBPACK_UI5_REQUIRE_DEPENDENCY__ = #`,
      ],
      af: [
        'var __WEBPACK_UI5_REQUIRE_DEPENDENCIES__;',
        `__WEBPACK_UI5_REQUIRE_DEPENDENCIES__ = #, #.apply(null, __WEBPACK_UI5_REQUIRE_DEPENDENCIES__)`,
      ],
    };
  }

  apply(dependency, source) {
    const branch = this.branch(dependency);
    const defAndText = this.definitions[branch];
    const definitions = defAndText[0];
    const text = defAndText[1];
    this.replace(dependency, source, definitions, text);
  }

  branch(dependency) {
    const moduleRange = dependency.moduleRange ? 'm' : '';
    const arrayRange = dependency.arrayRange ? 'a' : '';
    const functionRange = dependency.functionRange ? 'f' : '';
    return moduleRange + arrayRange + functionRange;
  }

  replace(dependency, source, definition, text) {
    const texts = text.split('#');

    if (definition) source.insert(0, definition);

    let current = dependency.range[0];
    if (dependency.arrayRange) {
      source.replace(current, dependency.arrayRange[0] - 1, texts.shift());
      current = dependency.arrayRange[1];
    }

    if (dependency.functionRange) {
      source.replace(current, dependency.functionRange[0] - 1, texts.shift());
      current = dependency.functionRange[1];
    }

    source.replace(current, dependency.range[1] - 1, texts.shift());
    /* istanbul ignore next */
    if (texts.length > 0) {
      throw new Error('Implementation error');
    }
  }
};

module.exports = OpenUI5RequireDependency;
