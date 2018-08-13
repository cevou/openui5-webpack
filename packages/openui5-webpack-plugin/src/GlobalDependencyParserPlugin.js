const RequireItemDependency = require('./RequireItemDependency');

class GlobalDependencyParserPlugin {
  apply(parser) {
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

    const processGlobal = (expr, request) => {
      const dep = new RequireItemDependency(request, expr.range, true);
      dep.loc = expr.loc;
      dep.optional = !!parser.scope.inTry;
      parser.state.current.addDependency(dep);
      return true;
    };

    Object.keys(globals).forEach((key) => {
      parser.hooks.expression.for(key).tap('OpenUI5Plugin', expr => processGlobal(expr, globals[key]));
    });
  }
}

module.exports = GlobalDependencyParserPlugin;
