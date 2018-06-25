const ContextDependencyHelpers = exports;

/**
 * Escapes regular expression metacharacters
 * @param {string} str String to quote
 * @return {string} Escaped string
 */
function quotemeta(str) {
  return str.replace(/[-[\]\\/{}()*+?.^$|]/g, '\\$&');
}

ContextDependencyHelpers.create = function (Dep, range, param, expr, options, contextOptions) {
  if (param.isWrapped() && (param.prefix && param.prefix.isString())) {
    let prefix = param.prefix.string;
    const prefixRange = param.prefix.range;
    const valueRange = [prefixRange ? prefixRange[1] : param.range[0], param.range[1]];
    const idx = prefix.lastIndexOf('/');
    let context = '.';
    if (idx >= 0) {
      context = prefix.substr(0, idx);
      prefix = `.${prefix.substr(idx)}`;
    }
    const regExp = new RegExp(`^${quotemeta(prefix)}.*$`);
    const dep = new Dep(Object.assign({
      request: context,
      recursive: options.wrappedContextRecursive,
      regExp,
      mode: 'sync',
    }, contextOptions), range, valueRange);
    dep.loc = expr.loc;
    dep.prepend = param.prefix && param.prefix.isString() ? prefix : null;
    dep.critical = options.wrappedContextCritical && 'a part of the request of a dependency is an expression';
    return dep;
  }
  return null;
};

ContextDependencyHelpers.createView = function (Dep, range, param, expr, options, contextOptions) {
  const prefix = 'sap/ui/core/mvc/';
  const regExp = new RegExp(`View.js$`);
  const dep = new Dep(Object.assign({
    request: prefix,
    recursive: options.wrappedContextRecursive,
    regExp,
    mode: 'weak',
  }, contextOptions), range, param.range);
  dep.loc = expr.loc;
  dep.prepend = null;
  dep.critical = options.wrappedContextCritical && 'a part of the request of a dependency is an expression';
  dep.replaces = [
    {
      range: [dep.valueRange[0] - 1, dep.valueRange[0] - 1],
      value: 'new (',
    },
    {
      range: [dep.valueRange[1], dep.valueRange[1]],
      value: '.replace("sap/ui/core/mvc", ".") + ".js")',
    },
    {
      range: [dep.range[1], dep.range[1]],
      value: '(oView)',
    },
  ];
  return dep;
};
