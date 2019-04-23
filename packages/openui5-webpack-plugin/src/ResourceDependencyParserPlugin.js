const ResourceDependency = require('./ResourceDependency');

class ResourceDependencyParserPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(parser) {
    const options = this.options || {};

    parser.hooks.call.for('jQuery.sap.loadResource').tap('OpenUI5Plugin', (expr) => {
      const modulePath = options.modulePath || '';
      const resources = options.resources || {};
      const extensions = resources.extensions || ['properties', 'xml'];
      const translations = options.translations || [];
      const libraries = options.libs || [];
      const manifest = options.manifest;
      const arg = expr.arguments[0];

      let param;
      let foe;
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

        const failOnError = arg.properties.find((prop) => {
          if (prop.key && prop.key.type === 'Identifier' && prop.key.name === 'failOnError') {
            return true;
          }
          return false;
        });

        param = parser.evaluateExpression(property.value);
        if (failOnError) {
          foe = parser.evaluateExpression(failOnError.value);
        }
      } else {
        param = parser.evaluateExpression(arg);
      }

      const dep = new ResourceDependency(
        parser.state.options.context,
        modulePath,
        extensions,
        libraries,
        translations,
        manifest,
        foe ? foe.bool : true,
        false,
        expr.range,
        param.range,
      );
      dep.loc = expr.loc;
      parser.state.current.addDependency(dep);
      return true;
    });

    parser.hooks.call.for('LoaderExtensions.loadResource').tap('OpenUI5Plugin', (expr) => {
      const modulePath = options.modulePath || '';
      const resources = options.resources || {};
      const extensions = resources.extensions || ['properties', 'xml'];
      const translations = options.translations || [];
      const libraries = options.libs || [];
      const manifest = options.manifest;
      const arg1 = expr.arguments[0];
      const arg2 = expr.arguments[1];

      let param;
      let arg;
      if (arg1.type === 'ObjectExpression') {
        arg = arg1;

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
        arg = arg2;
        param = parser.evaluateExpression(arg1);
      }

      let async;
      let foe;
      if (arg && arg.type === 'ObjectExpression') {
        const failOnError = arg.properties.find((prop) => {
          if (prop.key && prop.key.type === 'Identifier' && prop.key.name === 'failOnError') {
            return true;
          }
          return false;
        });

        const asyncLoading = arg.properties.find((prop) => {
          if (prop.key && prop.key.type === 'Identifier' && prop.key.name === 'async') {
            return true;
          }
          return false;
        });

        if (failOnError) {
          foe = parser.evaluateExpression(failOnError.value);
        }
        if (asyncLoading) {
          async = parser.evaluateExpression(asyncLoading.value);
        }
      }

      const dep = new ResourceDependency(
        parser.state.options.context,
        modulePath,
        extensions,
        libraries,
        translations,
        manifest,
        foe ? foe.bool : true,
        async,
        expr.range,
        param.range,
      );

      dep.loc = expr.loc;
      parser.state.current.addDependency(dep);

      return true;
    });
  }
}
module.exports = ResourceDependencyParserPlugin;
