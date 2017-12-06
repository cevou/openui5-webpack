const LocalModulesHelpers = require('webpack/lib/dependencies/LocalModulesHelpers');
const LocalModuleDependency = require('webpack/lib/dependencies/LocalModuleDependency');
const OpenUI5DefineDependency = require('./OpenUI5DefineDependency');
const OpenUI5RequireItemDependency = require('./OpenUI5RequireItemDependency');

class OpenUI5DefineDependencyParserPlugin {
  constructor(options) {
    this.options = options;
  }

  newDefineDependency(range, arrayRange, functionRange, namedModule) {
    return new OpenUI5DefineDependency(range, arrayRange, functionRange, namedModule);
  }

  apply(parser) {
    parser.plugin('call sap.ui.define', (expr) => {
      let array;
      let fn;
      let namedModule;

      switch (expr.arguments.length) {
        case 1:
          fn = expr.arguments[0];
          break;
        case 2:
          if (expr.arguments[0].type === 'Literal') {
            namedModule = expr.arguments[0].value;
            fn = expr.arguments[1];
          } else if (expr.arguments[0].type === 'ArrayExpression') {
            array = expr.arguments[0];
            fn = expr.arguments[1];
          } else {
            fn = expr.arguments[0];
          }
          break;
        case 3:
          if (expr.arguments[0].type === 'Literal') {
            namedModule = expr.arguments[0].value;
            array = expr.arguments[1];
            fn = expr.arguments[2];
          } else {
            array = expr.arguments[0];
            fn = expr.arguments[1];
          }
          break;
        case 4:
          namedModule = expr.arguments[0].value;
          array = expr.arguments[1];
          fn = expr.arguments[2];
        // no default
      }

      if (array) {
        const param = parser.evaluateExpression(array);
        const result = parser.applyPluginsBailResult('call define:openui5:array', expr, param, namedModule);
        if (!result) return false;
      }

      if (fn && fn.type === 'FunctionExpression') {
        if (fn.body.type === 'BlockStatement') {
          parser.walkStatement(fn.body);
        } else {
          parser.walkExpression(fn.body);
        }
      }

      const dep = this.newDefineDependency(
        expr.range,
        array ? array.range : null,
        fn ? fn.range : null,
        namedModule || null,
      );
      dep.loc = expr.loc;
      if (namedModule) {
        dep.localModule = LocalModulesHelpers.addLocalModule(parser.state, namedModule);
      }
      parser.state.current.addDependency(dep);
      return true;
    });

    parser.plugin('call define:openui5:array', (expr, param, namedModule) => {
      param.items.forEach((param) => {
        parser.applyPluginsBailResult('call define:openui5:item', expr, param, namedModule);
      });
      return true;
    });

    parser.plugin('call define:openui5:item', (expr, param, namedModule) => {
      let dep;
      const localModule = LocalModulesHelpers.getLocalModule(parser.state, param.string, namedModule);
      if (localModule) {
        dep = new LocalModuleDependency(localModule, param.range);
      } else {
        dep = new OpenUI5RequireItemDependency(param.string, param.range);
      }
      dep.loc = expr.loc;
      parser.state.current.addDependency(dep);
      return true;
    });
  }
}
module.exports = OpenUI5DefineDependencyParserPlugin;
