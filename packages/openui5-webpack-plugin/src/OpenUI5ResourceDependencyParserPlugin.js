const OpenUI5RequireContextDependency = require('./OpenUI5RequireContextDependency');

class OpenUI5ResourceDependencyParserPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(parser) {
    const options = this.options || {};

    parser.plugin('call jQuery.sap.loadResource', (expr) => {
      const context = options.resourceContext || '.';
      const regExp = options.resourceRegExp || /^.*\.(xml|properties)$/;
      const arg = expr.arguments[0];

      let param;
      if (arg.type === 'ObjectExpression') {
        const property = arg.properties.find((prop) => {
          if (prop.key && prop.key.type === 'Identifier' && prop.key.name === 'url') {
            return true;
          }
          return false;
        });

        if (!property) {
          throw new Error('Property url missing in object for jQuery.sap.loadResource');
        }

        param = parser.evaluateExpression(property.value);
      } else {
        param = parser.evaluateExpression(arg);
      }

      const dep = new OpenUI5RequireContextDependency(context, true, regExp, expr.range, param.range);
      dep.loc = expr.loc;
      dep.critical = options.wrappedContextCritical && 'a part of the request of a dependency is an expression';
      dep.optional = !!parser.scope.inTry;
      if (options.modulePath) {
        dep.replaces = [
          {
            range: [param.range[0], param.range[0]],
            value: '(',
          },
          {
            range: [param.range[1], param.range[1]],
            value: `).replace(/^(?:\\.\\/)?${options.modulePath.replace(/\//g, '\\/')}/,".")`,
          },
        ];
      }
      parser.state.current.addDependency(dep);
      return true;
    });
  }
}
module.exports = OpenUI5ResourceDependencyParserPlugin;
