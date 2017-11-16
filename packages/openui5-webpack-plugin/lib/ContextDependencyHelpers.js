'use strict';

const ContextDependencyHelpers = exports;

/**
 * Escapes regular expression metacharacters
 * @param {string} str String to quote
 * @return {string} Escaped string
 */
function quotemeta(str) {
  return str.replace(/[-[\]\\/{}()*+?.^$|]/g, '\\$&');
}

ContextDependencyHelpers.create = function (Dep, range, param, expr, options, chunkName) {
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
    const dep = new Dep(context, options.wrappedContextRecursive, regExp, range, valueRange, chunkName);
    dep.loc = expr.loc;
    dep.prepend = param.prefix && param.prefix.isString() ? prefix : null;
    dep.critical = options.wrappedContextCritical && 'a part of the request of a dependency is an expression';
    return dep;
  }
  return null;
};
