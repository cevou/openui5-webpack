module.exports = function({ types: t }, options) {
  return {
    visitor: {
      IfStatement(path) {
        const test = path.node.test;
        if (test.type !== "BinaryExpression") {
          return;
        }

        const left = test.left;
        if (left.type !== "CallExpression") {
          return;
        }

        const callee = left.callee;
        if (callee.type !== "MemberExpression") {
          return;
        }

        const property = callee.property;
        if (property.type !== "Identifier") {
          return;
        }

        if (property.name === "getSupportMode") {
          path.remove();
        }
      }
    }
  }
};
