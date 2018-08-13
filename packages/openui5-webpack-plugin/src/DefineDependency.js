const NullDependency = require('webpack/lib/dependencies/NullDependency');

class DefineDependency extends NullDependency {
  constructor(range, arrayRange, functionRange, namedModule) {
    super();
    this.range = range;
    this.arrayRange = arrayRange;
    this.functionRange = functionRange;
    this.namedModule = namedModule;
  }

  get type() {
    return 'openui5 define';
  }
}

DefineDependency.Template = class UI5DefineDependencyTemplate {
  get definitions() {
    return {
      f: [
        'var __WEBPACK_UI5_DEFINE_RESULT__;',
        `!(__WEBPACK_UI5_DEFINE_RESULT__ = #.call(exports, __webpack_require__, exports, module),
        __WEBPACK_UI5_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_UI5_DEFINE_RESULT__))`,
      ],
      af: [
        'var __WEBPACK_UI5_DEFINE_ARRAY__, __WEBPACK_UI5_DEFINE_RESULT__;',
        `!(__WEBPACK_UI5_DEFINE_ARRAY__ = #, __WEBPACK_UI5_DEFINE_RESULT__ = #.apply(exports, __WEBPACK_UI5_DEFINE_ARRAY__),
        __WEBPACK_UI5_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_UI5_DEFINE_RESULT__))`,
      ],
      lf: [
        'var XXX, XXXmodule;',
        '!(XXXmodule = { id: YYY, exports: {}, loaded: false }, XXX = #.call(XXXmodule.exports, __webpack_require__, XXXmodule.exports, XXXmodule), XXXmodule.loaded = true, XXX === undefined && (XXX = XXXmodule.exports))',
      ],
      laf: [
        'var __WEBPACK_UI5_DEFINE_ARRAY__, XXX;',
        '!(__WEBPACK_UI5_DEFINE_ARRAY__ = #, XXX = (#.apply(exports, __WEBPACK_UI5_DEFINE_ARRAY__)))',
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

  localModuleVar(dependency) {
    return dependency.localModule && dependency.localModule.used && dependency.localModule.variableName();
  }

  branch(dependency) {
    const localModuleVar = this.localModuleVar(dependency) ? 'l' : '';
    const arrayRange = dependency.arrayRange ? 'a' : '';
    const functionRange = dependency.functionRange ? 'f' : '';
    return localModuleVar + arrayRange + functionRange;
  }

  replace(dependency, source, definition, text) {
    const localModuleVar = this.localModuleVar(dependency);
    if (localModuleVar) {
      text = text.replace(/XXX/g, localModuleVar.replace(/\$/g, '$$$$'));
      definition = definition.replace(/XXX/g, localModuleVar.replace(/\$/g, '$$$$'));
    }

    if (dependency.namedModule) {
      text = text.replace(/YYY/g, JSON.stringify(dependency.namedModule));
    }

    const texts = text.split('#');

    if (definition) source.insert(0, definition);

    let current = dependency.range[0];
    if (dependency.arrayRange) {
      source.replace(current, dependency.arrayRange[0] - 1, texts.shift());
      current = dependency.arrayRange[1];
    }

    source.replace(current, dependency.functionRange[0] - 1, texts.shift());
    current = dependency.functionRange[1];

    source.replace(current, dependency.range[1] - 1, texts.shift());
    /* istanbul ignore next */
    if (texts.length > 0) {
      throw new Error('Implementation error');
    }
  }
};

module.exports = DefineDependency;
