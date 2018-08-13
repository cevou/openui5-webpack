const NullDependency = require("webpack/lib/dependencies/NullDependency");

class RequireDependency extends NullDependency {
  constructor(block) {
    super();
    this.block = block;
  }

  get type() {
    return "openui5 require";
  }
}

RequireDependency.Template = class AsyncRequireDependencyTemplate {
  apply(dep, source, runtime) {
    const depBlock = dep.block;
    const promise = runtime.blockPromise({
      block: depBlock,
      message: "openui5 require"
    });

    const startBlock = `${promise}.then(function() { `;
    const endBlock = `}).catch(${runtime.onError()})`;
    source.replace(
      depBlock.outerRange[0],
      depBlock.arrayRange[0] - 1,
      startBlock
    );
    source.insert(
      depBlock.arrayRange[0] + 0.9,
      "var __WEBPACK_UI5_REQUIRE_ARRAY__ = "
    );

    if (depBlock.functionRange) {
      source.replace(
        depBlock.arrayRange[1],
        depBlock.functionRange[0] - 1,
        "; ("
      );

      source.insert(
        depBlock.functionRange[1],
        ").apply(null, __WEBPACK_UI5_REQUIRE_ARRAY__);"
      );
      source.replace(
        depBlock.functionRange[1],
        depBlock.outerRange[1] - 1,
        endBlock
      );
    } else {
      source.insert(
        depBlock.arrayRange[1],
        ";"
      );
      source.replace(
        depBlock.arrayRange[1],
        depBlock.outerRange[1] - 1,
        endBlock
      );
    }

  }
};

module.exports = RequireDependency;
