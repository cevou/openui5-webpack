const AsyncDependenciesBlock = require("webpack/lib/AsyncDependenciesBlock");
const RequireDependency = require("./RequireDependency");

module.exports = class RequireDependenciesBlock extends AsyncDependenciesBlock {
  constructor(expr, arg, functionRange, module, loc) {
    super(null, module, loc, null);
    this.expr = expr;
    this.outerRange = expr.range;
    this.arrayRange = arg.range;
    this.functionRange = functionRange;
    if (functionRange) {
      this.range = [this.arrayRange[0], functionRange[1]];
    } else {
      this.range = this.arrayRange;
    }
    const dep = new RequireDependency(this, arg.type === "CallExpression");
    dep.loc = loc;
    this.addDependency(dep);
  }
};
