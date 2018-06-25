const ParserHelpers = require('webpack/lib/ParserHelpers');
const OpenUI5LazyInstanceDependency = require('./OpenUI5LazyInstanceDependency');
const OpenUI5ViewDependency = require('./OpenUI5ViewDependency');
const OpenUI5RequireDependency = require('./OpenUI5RequireDependency');
const OpenUI5RequireItemDependency = require('./OpenUI5RequireItemDependency');
const OpenUI5RequireContextDependency = require('./OpenUI5RequireContextDependency');
const ContextDependencyHelpers = require('./ContextDependencyHelpers');

class OpenUI5RequireDependencyParserPlugin {
  constructor(options) {
    this.options = options;
  }

  newRequireDependency(range, moduleRange, arrayRange, functionRange) {
    return new OpenUI5RequireDependency(range, moduleRange, arrayRange, functionRange);
  }

  apply(parser) {
    const options = this.options || {};
    const globals = {
      'sap.ui.core.theming.Parameters': 'sap/ui/core/theming/Parameters',
      'sap.ui.core.LabelEnablement': 'sap/ui/core/LabelEnablement',
      'sap.ui.core.HTML': 'sap/ui/core/HTML',
      'sap.m.CheckBox': 'sap/m/CheckBox',
      'sap.viz.ui5.theming.Util': 'sap/viz/ui5/theming/Util',
      'sap.ui.unified.DateRange': 'sap/ui/unified/DateRange',
      'sap.ui.core.IconPool': 'sap/ui/core/IconPool',
      'sap.m.IconTabHeader': 'sap/m/IconTabHeader',
    };

    const processItem = (expr, param, range) => {
      if (param.isString()) {
        let item = param.string;
        if (item.substr(0, 10) !== 'jquery.sap' && item.substr(0, 2) !== './') {
          item = item.replace(/\./g, '/');
        }
        const dep = new OpenUI5RequireItemDependency(item, range);
        dep.loc = expr.loc;
        dep.optional = !!parser.scope.inTry;
        parser.state.current.addDependency(dep);
        return true;
      }
      return false;
    };

    const processContext = (expr, param) => {
      const dep = ContextDependencyHelpers.create(OpenUI5RequireContextDependency, expr.range, param, expr, options);
      if (!dep) return false;
      dep.loc = expr.loc;
      dep.optional = !!parser.scope.inTry;
      parser.state.current.addDependency(dep);
      return true;
    };

    const processArray = (expr, param) => {
      param.items.forEach((param) => {
        processItem(expr, param, param.range);
      });
      return true;
    };

    const processGlobal = (expr, request) => {
      const dep = new OpenUI5RequireItemDependency(request, expr.range, true);
      dep.loc = expr.loc;
      dep.optional = !!parser.scope.inTry;
      parser.state.current.addDependency(dep);
      return true;
    };

    const processRemove = ParserHelpers.toConstantDependency(parser, process.env.NODE_ENV === 'production' ? '' : 'console.warn("UI5 tried to dynamically require a module. If it doesn\'t exist in the bundle a error might follow.")');

    parser.hooks.call.for('sap.ui.require').tap('OpenUI5Plugin', (expr) => {
      let module;
      let array;
      let fn;

      if (expr.arguments[0].type === 'Literal') {
        module = expr.arguments[0];
      } else if (expr.arguments[0].type === 'ArrayExpression') {
        array = expr.arguments[0];
      } else {
        console.warn(`OpenUI5 webpack plugin: cannot handle dynamic dependency (type ${expr.arguments[0].type}) for sap.ui.require. Skipping dependency resolution.`);
        return false
      }

      if (expr.arguments[1]) {
        fn = expr.arguments[1];
      }

      const param = parser.evaluateExpression(expr.arguments[0]);
      if (module) {
        const result = processItem(expr, param, expr.range);
        return result;
      }


      const result = processArray(expr, param);
      if (!result) return false;

      if (fn && fn.type === 'FunctionExpression') {
        if (fn.body.type === 'BlockStatement') {
          parser.walkStatement(fn.body);
        } else {
          parser.walkExpression(fn.body);
        }
      }

      const dep = this.newRequireDependency(
        expr.range,
        module ? module.range : null,
        array ? array.range : null,
        fn ? fn.range : null,
      );
      dep.loc = expr.loc;
      parser.state.current.addDependency(dep);
      return true;
    });

    parser.hooks.call.for('sap.ui.requireSync').tap('OpenUI5Plugin', (expr) => {
      const param = parser.evaluateExpression(expr.arguments[0]);

      let result = processItem(expr, param, expr.range);
      if (!result) {
        result = processContext(expr, param);
      }
      return result;
    });

    parser.hooks.call.for('lazyInstanceof').tap('OpenUI5Plugin', (expr) => {
      const param1 = parser.evaluateExpression(expr.arguments[1]);
      if (param1.string !== 'sap/ui/app/Application') {
        const dep = new OpenUI5LazyInstanceDependency(param1.string, expr.arguments[0].name, expr.range);
        dep.loc = expr.loc;
        dep.optional = !!parser.scope.inTry;
        parser.state.current.addDependency(dep);
        return true;
      }
      return false;
    });

    parser.hooks.call.for('createView').tap('OpenUI5Plugin', (expr) => {
      let dep;
      const param0 = parser.evaluateExpression(expr.arguments[0]);
      if (expr.arguments[0].type === 'Literal') {
        dep = new OpenUI5ViewDependency(param0.string, expr.arguments[1].name, expr.range);
        if (!dep) {
          return false
        }
      } else if (expr.arguments[0].type === 'Identifier') {
        dep = ContextDependencyHelpers.createView(OpenUI5RequireContextDependency, expr.range, param0, expr, options);
      } else {
        return false;
      }
      dep.loc = expr.loc;
      dep.optional = !!parser.scope.inTry;
      parser.state.current.addDependency(dep);
      return true;
    });

    parser.hooks.call.for('jQuery.sap.require').tap('OpenUI5Plugin', (expr) => {
      const param = parser.evaluateExpression(expr.arguments[0]);
      if (expr.arguments[0].type === 'Literal') {
        processItem(expr, param, expr.range);
        return true;
      }
      processRemove(expr, param);
      return false;
    });

    parser.hooks.call.for('$.sap.require').tap('OpenUI5Plugin', (expr) => {
      const param = parser.evaluateExpression(expr.arguments[0]);
      if (expr.arguments[0].type === 'Literal') {
        processItem(expr, param, expr.range);
        return true;
      }
      return false;
    });

    Object.keys(globals).forEach((key) => {
      parser.hooks.expression.for(key).tap('OpenUI5Plugin', expr => processGlobal(expr, globals[key]));
    });
  }
}
module.exports = OpenUI5RequireDependencyParserPlugin;
