export default function ({ types: t }) {
  function removeFromCore(path) {
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
  }

  function asyncReplaceCore(path) {
    const { test, consequent } = path.node;
    if (test.type !== 'Identifier') {
      return;
    }

    if (test.name !== 'bAsync') {
      return;
    }

    if (consequent.type !== 'BlockStatement') {
      return;
    }

    const body = consequent.body;
    if (body.length > 1) {
      return;
    }

    const statement = body[0];
    if (statement.type !== 'ExpressionStatement') {
      return;
    }

    const { expression } = statement;

    if (expression.type !== 'CallExpression') {
      return;
    }

    const args = expression.arguments;
    if (args.length !== 2) {
      return;
    }

    const arg1 = args[0];
    const arg2 = args[1];
    if (arg1.type !== 'ArrayExpression' && arg2.type !== 'Identifier') {
      return;
    }

    if (arg1.elements.length !== 1 && arg1.elements[0].type !== 'Literal') {
      return;
    }

    const dependency = arg1.elements[0].value;
    if (!dependency.match(/sap\/ui(?:\/core)?\/support/)) {
      return;
    }

    const callback = arg2;

    const importLiteral = t.stringLiteral(dependency);
    importLiteral.leadingComments = [
      {
        type: 'CommentBlock',
        value: ' webpackChunkName: "support" ',
      },
    ];

    path.replaceWith(t.expressionStatement(t.callExpression(
      t.memberExpression(
        t.callExpression(
          t.import(),
          [
            importLiteral,
          ],
        ),
        t.identifier('then'),
      ),
      [callback],
    )));
  }

  function handleTechInfo(path, mode) {
    const { callee } = path.node;
    const args = path.node.arguments;

    if (callee.type !== 'MemberExpression' || args.length !== 1) {
      return;
    }

    const { object, property } = callee;

    if (object.type !== 'Identifier' || property.type !== 'Identifier') {
      return;
    }

    if (object.name !== 'jQuery' && property.name !== 'ajax') {
      return;
    }

    const arg = args[0];

    if (arg.type !== 'ObjectExpression') {
      return;
    }

    arg.properties.forEach((property) => {
      const { key, value } = property;
      if (key.type === 'Identifier' && key.name === 'url' && value.type === 'BinaryExpression' && value.right.value === 'Bootstrap.js') {
        if (mode === 'remove') {
          path.remove();
        } else {
          const importLiteral = t.stringLiteral('sap/ui/support/Bootstrap');
          importLiteral.leadingComments = [
            {
              type: 'CommentBlock',
              value: ' webpackChunkName: "support" ',
            },
          ];
          path.replaceWith(t.expressionStatement(t.callExpression(
            t.memberExpression(
              t.callExpression(
                t.import(),
                [importLiteral],
              ),
              t.identifier('then'),
            ),
            [t.functionExpression(
              null,
              [t.identifier('Bootstrap')],
              t.blockStatement([
                t.variableDeclaration('var', [
                  t.variableDeclarator(
                    t.identifier('aSettings'),
                    t.arrayExpression([
                      t.memberExpression(
                        t.identifier('oSettings'),
                        t.identifier('support'),
                      ),
                    ]),
                  ),
                ]),
                t.ifStatement(
                  t.memberExpression(
                    t.identifier('oSettings'),
                    t.identifier('window'),
                  ),
                  t.blockStatement([
                    t.expressionStatement(t.callExpression(
                      t.memberExpression(
                        t.identifier('aSettings'),
                        t.identifier('push'),
                      ),
                      [t.stringLiteral('window')],
                    )),
                  ]),
                ),
                t.expressionStatement(t.callExpression(
                  t.memberExpression(
                    t.identifier('Bootstrap'),
                    t.identifier('initSupportRules'),
                  ),
                  [t.identifier('aSettings')],
                )),
              ]),
            )],
          )));
        }
      }
    });
  }

  return {
    visitor: {
      IfStatement(path, state) {
        const { opts } = state;
        const { mode } = opts;

        if (mode === 'remove') {
          removeFromCore(path);
        } else {
          asyncReplaceCore(path);
        }
      },
      CallExpression(path, state) {
        const { opts } = state;
        const { mode } = opts;

        handleTechInfo(path, mode);
      },
    },
  };
}
