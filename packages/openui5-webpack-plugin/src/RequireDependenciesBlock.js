const AsyncDependenciesBlock = require("webpack/lib/AsyncDependenciesBlock");
const RequireDependency = require("./RequireDependency");

module.exports = class RequireDependenciesBlock extends AsyncDependenciesBlock {
  constructor(expr, arrayRange, functionRange, module, loc) {
    super(null, module, loc, null);
    this.expr = expr;
    this.outerRange = expr.range;
    this.arrayRange = arrayRange;
    this.functionRange = functionRange;
    if (functionRange) {
      this.range = [arrayRange[0], functionRange[1]];
    } else {
      this.range = arrayRange;
    }
    const dep = new RequireDependency(this);
    dep.loc = loc;
    this.addDependency(dep);
  }
};
