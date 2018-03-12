const ParserHelpers = require('webpack/lib/ParserHelpers');
const OpenUI5LazyInstanceDependency = require('./OpenUI5LazyInstanceDependency');
const OpenUI5RequireItemDependency = require('./OpenUI5RequireItemDependency');
const OpenUI5RequireContextDependency = require('./OpenUI5RequireContextDependency');
const ContextDependencyHelpers = require('./ContextDependencyHelpers');

class OpenUI5RequireDependencyParserPlugin {
  constructor(options) {
    this.options = options;
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
    };

    const processItem = (expr, param) => {
      if (param.isString()) {
        let item = param.string;
        if (item.substr(0, 10) !== 'jquery.sap' && item.substr(0, 2) !== './') {
          item = item.replace(/\./g, '/');
        }
        const dep = new OpenUI5RequireItemDependency(item, expr.range);
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
        processItem(expr, param);
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
      const param = parser.evaluateExpression(expr.arguments[0]);
      if (expr.arguments[0].type === 'Literal') {
        processItem(expr, param);
        return true;
      } else if (expr.arguments[0].type === 'ArrayExpression') {
        processArray(expr, param);
        return true;
      }
      return false;
    });

    parser.hooks.call.for('sap.ui.requireSync').tap('OpenUI5Plugin', (expr) => {
      const param = parser.evaluateExpression(expr.arguments[0]);

      let result = processItem(expr, param);
      if (!result) {
        result = processContext(expr, param);
      }
      return result;
    });

    parser.hooks.call.for('call lazyInstanceof').tap('OpenUI5Plugin', (expr) => {
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

    parser.hooks.call.for('jQuery.sap.require').tap('OpenUI5Plugin', (expr) => {
      const param = parser.evaluateExpression(expr.arguments[0]);
      if (expr.arguments[0].type === 'Literal') {
        processItem(expr, param);
        return true;
      }
      processRemove(expr, param);
      return false;
    });

    parser.hooks.call.for('$.sap.require').tap('OpenUI5Plugin', (expr) => {
      const param = parser.evaluateExpression(expr.arguments[0]);
      if (expr.arguments[0].type === 'Literal') {
        processItem(expr, param);
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
