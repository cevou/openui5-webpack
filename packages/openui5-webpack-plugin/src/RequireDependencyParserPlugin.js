const RequireDependenciesBlock = require('./RequireDependenciesBlock');
const RequireItemDependency = require('./RequireItemDependency');
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
        if (!item.match(/j[Qq]uery\.sap/) && item.substr(0, 2) !== './' && item.substr(0, 3) !== '../') {
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

    const processContext = (expr, param, inArray) => {
      const dep = ContextDependencyHelpers.create(expr.range, param, expr, options, { inArray });
      if (!dep) return false;
      dep.loc = expr.loc;
      dep.optional = !!parser.scope.inTry;
      parser.state.current.addDependency(dep);
      return true;
    };

    const processArray = (expr, param) => {
      param.items.forEach((param) => {
        const result = processItem(expr, param, param.range);
        if (!result) {
          processContext(param, param);
        }
      });
      return true;
    };

    parser.hooks.call.for('sap.ui.require').tap('OpenUI5Plugin', (expr) => {
      if (expr.arguments[0].type === 'Literal') {
        // Synchronous retrieval of module only one string argument
        const module = expr.arguments[0];
        const param = parser.evaluateExpression(module);
        return processItem(expr, param, expr.range);
      } else if (!expr.arguments[1] && (expr.arguments[0].type === 'CallExpression' || expr.arguments[0].type === 'Identifier')) {
        // only one parameter and variable ==> context dependency
        const param = parser.evaluateExpression(expr.arguments[0]);
        return processContext(expr, param);
      } else if (expr.arguments[0].type === 'ArrayExpression' || expr.arguments[0].type === 'CallExpression' || expr.arguments[0].type === 'Identifier') {
        // Async loading of module and optionally execution of callback function
        const arg0 = expr.arguments[0];
        const param = parser.evaluateExpression(arg0);
        const fn = expr.arguments[1];

        const dep = new RequireDependenciesBlock(expr, arg0, fn ? fn.range : null, parser.state.module, expr.loc);
        const old = parser.state.current;
        parser.state.current = dep;

        try {
          let result;
          if (arg0.type === 'ArrayExpression') {
            result = processArray(expr, param);
          } else {
            result = processContext(expr, param, true);
          }
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
