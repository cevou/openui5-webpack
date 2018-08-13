const RequireDependenciesBlock = require('./RequireDependenciesBlock');
const RequireItemDependency = require('./RequireItemDependency');
const RequireContextDependency = require('./RequireContextDependency');
const ContextDependencyHelpers = require('./ContextDependencyHelpers');

class RequireDependencyParserPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(parser) {
    const options = this.options || {};

    const processItem = (expr, param, range) => {
      if (param.isString()) {
        let item = param.string;
        if (item.substr(0, 10) !== 'jquery.sap' && item.substr(0, 2) !== './') {
          item = item.replace(/\./g, '/');
        }
        const dep = new RequireItemDependency(item, range);
        dep.loc = expr.loc;
        dep.optional = !!parser.scope.inTry;
        parser.state.current.addDependency(dep);
        return true;
      }
      return false;
    };

    const processContext = (expr, param) => {
      const dep = ContextDependencyHelpers.create(RequireContextDependency, expr.range, param, expr, options);
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

    parser.hooks.call.for('sap.ui.require').tap('OpenUI5Plugin', (expr) => {
      if (expr.arguments[0].type === 'Literal') {
        // Synchronous retrieval of module only one string argument
        const module = expr.arguments[0];
        const param = parser.evaluateExpression(module);
        return processItem(expr, param, expr.range)
      } else if (expr.arguments[0].type === 'ArrayExpression') {
        // Async loading of module and optionally execution of callback function
        const array = expr.arguments[0];
        const param = parser.evaluateExpression(array);
        const fn = expr.arguments[1];

        const dependenciesItems = param ? param.items : [param];
        const dep = new RequireDependenciesBlock(expr, array.range, fn ? fn.range : null, parser.state.module, expr.loc, dependenciesItems[0].string);
        const old = parser.state.current;
        parser.state.current = dep;

        try {
          const result = processArray(expr, param);
          if (!result) {
            return;
          }

          if (fn && fn.type === 'FunctionExpression') {
            if (fn.body.type === 'BlockStatement') {
              parser.walkStatement(fn.body);
            } else {
              parser.walkExpression(fn.body);
            }
          }
          old.addBlock(dep);
        } finally {
          parser.state.current = old;
        }

        return true;
      }
    });

    parser.hooks.call.for('sap.ui.requireSync').tap('OpenUI5Plugin', (expr) => {
      const param = parser.evaluateExpression(expr.arguments[0]);

      let result = processItem(expr, param, expr.range);
      if (!result) {
        result = processContext(expr, param);
      }
      return result;
    });
  }
}
module.exports = RequireDependencyParserPlugin;
