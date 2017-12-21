const OpenUI5ResourceDependency = require('./OpenUI5ResourceDependency');

class OpenUI5ResourceDependencyParserPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(parser) {
    const options = this.options || {};

    parser.plugin('call jQuery.sap.loadResource', (expr) => {
      const modulePath = options.modulePath || '';
      const resources = options.resources || {};
      const extensions = resources.extensions || ['properties', 'xml'];
      const translations = options.translations || [];
      const libraries = options.libs || [];
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

      const dep = new OpenUI5ResourceDependency(
        parser.state.options.context,
        modulePath,
        extensions,
        libraries,
        translations,
        expr.range,
        param.range,
      );
      dep.loc = expr.loc;
      parser.state.current.addDependency(dep);
      return true;
    });
  }
}
module.exports = OpenUI5ResourceDependencyParserPlugin;
