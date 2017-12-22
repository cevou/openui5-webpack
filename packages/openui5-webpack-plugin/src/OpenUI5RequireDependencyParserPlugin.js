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

    parser.plugin('call sap.ui.require', (expr) => {
      const param = parser.evaluateExpression(expr.arguments[0]);
      if (expr.arguments[0].type === 'Literal') {
        parser.applyPluginsBailResult('call require:openui5:item', expr, param);
        return true;
      } else if (expr.arguments[0].type === 'ArrayExpression') {
        parser.applyPluginsBailResult('call require:openui5:array', expr, param);
        return true;
      }
      return false;
    });

    parser.plugin('call sap.ui.requireSync', (expr) => {
      const param = parser.evaluateExpression(expr.arguments[0]);

      let result = parser.applyPluginsBailResult('call require:openui5:item', expr, param);
      if (!result) {
        result = parser.applyPluginsBailResult('call require:openui5:context', expr, param);
      }
      return result;
    });

    parser.plugin('call lazyInstanceof', (expr) => {
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

    parser.plugin('call jQuery.sap.require', (expr) => {
      const param = parser.evaluateExpression(expr.arguments[0]);
      if (expr.arguments[0].type === 'Literal') {
        parser.applyPluginsBailResult('call require:openui5:item', expr, param);
        return true;
      }
      parser.applyPluginsBailResult('call require:openui5:remove', expr, param);
      return false;
    });

    parser.plugin('call $.sap.require', (expr) => {
      const param = parser.evaluateExpression(expr.arguments[0]);
      if (expr.arguments[0].type === 'Literal') {
        parser.applyPluginsBailResult('call require:openui5:item', expr, param);
        return true;
      }
      return false;
    });

    parser.plugin('call require:openui5:array', (expr, param) => {
      param.items.forEach((param) => {
        parser.applyPluginsBailResult('call require:openui5:item', expr, param);
      });
      return true;
    });

    parser.plugin('call require:openui5:item', (expr, param) => {
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
    });

    parser.plugin('call require:openui5:context', (expr, param) => {
      const dep = ContextDependencyHelpers.create(OpenUI5RequireContextDependency, expr.range, param, expr, options);
      if (!dep) return false;
      dep.loc = expr.loc;
      dep.optional = !!parser.scope.inTry;
      parser.state.current.addDependency(dep);
      return true;
    });

    parser.plugin('call require:openui5:remove', ParserHelpers.toConstantDependency(process.env.NODE_ENV === 'production' ? '' : 'console.warn("UI5 tried to dynamically require a module. If it doesn\'t exist in the bundle a error might follow.")'));

    parser.plugin('expression require:openui5:global', (expr, request) => {
      const dep = new OpenUI5RequireItemDependency(request, expr.range, true);
      dep.loc = expr.loc;
      dep.optional = !!parser.scope.inTry;
      parser.state.current.addDependency(dep);
      return true;
    });

    Object.keys(globals).forEach((key) => {
      parser.plugin(`expression ${key}`, expr => parser.applyPluginsBailResult('expression require:openui5:global', expr, globals[key]));
    });
  }
}
module.exports = OpenUI5RequireDependencyParserPlugin;
