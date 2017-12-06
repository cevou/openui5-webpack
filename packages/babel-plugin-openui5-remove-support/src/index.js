module.exports = function () {
  return {
    visitor: {
      IfStatement(path) {
        const { test } = path.node;
        if (test.type !== 'BinaryExpression') {
          return;
        }

        const { left } = test;
        if (left.type !== 'CallExpression') {
          return;
        }

        const { callee } = left;
        if (callee.type !== 'MemberExpression') {
          return;
        }

        const { property } = callee;
        if (property.type !== 'Identifier') {
          return;
        }

        if (property.name === 'getSupportMode') {
          path.remove();
        }
      },
    },
  };
};
