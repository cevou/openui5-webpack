const ViewDependency = require('./ViewDependency');
const ContextDependencyHelpers = require('./ContextDependencyHelpers');
const RequireContextDependency = require('./RequireContextDependency');

class ViewDependencyParserPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(parser) {
    const options = this.options || {};

    parser.hooks.call.for('createView').tap('OpenUI5Plugin', (expr) => {
      let dep;
      const param0 = parser.evaluateExpression(expr.arguments[0]);
      if (expr.arguments[0].type === 'Literal') {
        dep = new ViewDependency(param0.string, expr.arguments[1].name, expr.range);
        if (!dep) {
          return false
        }
      } else if (expr.arguments[0].type === 'Identifier') {
        dep = ContextDependencyHelpers.createView(RequireContextDependency, expr.range, param0, expr, options);
      } else {
        return false;
      }
      dep.loc = expr.loc;
      dep.optional = !!parser.scope.inTry;
      parser.state.current.addDependency(dep);
      return true;
    });
  }
}

module.exports = ViewDependencyParserPlugin;
