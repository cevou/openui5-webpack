const ParserHelpers = require('webpack/lib/ParserHelpers');
const JQueryItemDependency = require('./JQueryItemDependency');

class JQueryDependencyParserPlugin {
  apply(parser) {
    const processItem = (expr, param, range) => {
      if (param.isString()) {
        let item = param.string;
        if (item.substr(0, 10) !== 'jquery.sap' && item.substr(0, 2) !== './') {
          item = item.replace(/\./g, '/');
        }
        const dep = new JQueryItemDependency(item, range);
        dep.loc = expr.loc;
        dep.optional = !!parser.scope.inTry;
        parser.state.current.addDependency(dep);
        return true;
      }
      return false;
    };

    const processRemove = ParserHelpers.toConstantDependency(parser, process.env.NODE_ENV === 'production' ? '' : 'console.warn("UI5 tried to dynamically require a module. If it doesn\'t exist in the bundle a error might follow.")');

    parser.hooks.call.for('jQuery.sap.require').tap('OpenUI5Plugin', (expr) => {
      // TODO evaluate object option
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
  }
}

module.exports = JQueryDependencyParserPlugin;
