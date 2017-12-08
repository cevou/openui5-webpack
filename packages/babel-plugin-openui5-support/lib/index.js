'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  function removeFromCore(path) {
    var test = path.node.test;

    if (test.type !== 'BinaryExpression') {
      return;
    }

    var left = test.left;

    if (left.type !== 'CallExpression') {
      return;
    }

    var callee = left.callee;

    if (callee.type !== 'MemberExpression') {
      return;
    }

    var property = callee.property;

    if (property.type !== 'Identifier') {
      return;
    }

    if (property.name === 'getSupportMode') {
      path.remove();
    }
  }

  function asyncReplaceCore(path) {
    var _path$node = path.node,
        test = _path$node.test,
        consequent = _path$node.consequent;

    if (test.type !== 'Identifier') {
      return;
    }

    if (test.name !== 'bAsync') {
      return;
    }

    if (consequent.type !== 'BlockStatement') {
      return;
    }

    var body = consequent.body;
    if (body.length > 1) {
      return;
    }

    var statement = body[0];
    if (statement.type !== 'ExpressionStatement') {
      return;
    }

    var expression = statement.expression;


    if (expression.type !== 'CallExpression') {
      return;
    }

    var args = expression.arguments;
    if (args.length !== 2) {
      return;
    }

    var arg1 = args[0];
    var arg2 = args[1];
    if (arg1.type !== 'ArrayExpression' && arg2.type !== 'Identifier') {
      return;
    }

    if (arg1.elements.length !== 1 && arg1.elements[0].type !== 'Literal') {
      return;
    }

    var dependency = arg1.elements[0].value;
    if (!dependency.match(/sap\/ui(?:\/core)?\/support/)) {
      return;
    }

    var callback = arg2;

    var importLiteral = t.stringLiteral(dependency);
    importLiteral.leadingComments = [{
      type: 'CommentBlock',
      value: ' webpackChunkName: "support" '
    }];

    path.replaceWith(t.expressionStatement(t.callExpression(t.memberExpression(t.callExpression(t.import(), [importLiteral]), t.identifier('then')), [callback])));
  }

  function handleTechInfo(path, mode) {
    var callee = path.node.callee;

    var args = path.node.arguments;

    if (callee.type !== 'MemberExpression' || args.length !== 1) {
      return;
    }

    var object = callee.object,
        property = callee.property;


    if (object.type !== 'Identifier' || property.type !== 'Identifier') {
      return;
    }

    if (object.name !== 'jQuery' && property.name !== 'ajax') {
      return;
    }

    var arg = args[0];

    if (arg.type !== 'ObjectExpression') {
      return;
    }

    arg.properties.forEach(function (property) {
      var key = property.key,
          value = property.value;

      if (key.type === 'Identifier' && key.name === 'url' && value.type === 'BinaryExpression' && value.right.value === 'Bootstrap.js') {
        if (mode === 'remove') {
          path.remove();
        } else {
          var importLiteral = t.stringLiteral('sap/ui/support/Bootstrap');
          importLiteral.leadingComments = [{
            type: 'CommentBlock',
            value: ' webpackChunkName: "support" '
          }];
          path.replaceWith(t.expressionStatement(t.callExpression(t.memberExpression(t.callExpression(t.import(), [importLiteral]), t.identifier('then')), [t.functionExpression(null, [t.identifier('Bootstrap')], t.blockStatement([t.variableDeclaration('var', [t.variableDeclarator(t.identifier('aSettings'), t.arrayExpression([t.memberExpression(t.identifier('oSettings'), t.identifier('support'))]))]), t.ifStatement(t.memberExpression(t.identifier('oSettings'), t.identifier('window')), t.blockStatement([t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('aSettings'), t.identifier('push')), [t.stringLiteral('window')]))])), t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('Bootstrap'), t.identifier('initSupportRules')), [t.identifier('aSettings')]))]))])));
        }
      }
    });
  }

  return {
    visitor: {
      IfStatement(path, state) {
        var opts = state.opts;
        var mode = opts.mode;


        if (mode === 'remove') {
          removeFromCore(path);
        } else {
          asyncReplaceCore(path);
        }
      },
      CallExpression(path, state) {
        var opts = state.opts;
        var mode = opts.mode;


        handleTechInfo(path, mode);
      }
    }
  };
};