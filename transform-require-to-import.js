/**
 * @fileoverview Transform CommonJS require() statements to ES6 import statements
 */

module.exports = function(fileInfo, api, options) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
  
    // Helper function to convert require to import
    function convertRequire(nodePath) {
      const node = nodePath.node;
  
      // Handle statements like: const module = require('module');
      if (
        node.type === 'VariableDeclaration' &&
        node.declarations.length === 1 &&
        node.declarations[0].init &&
        node.declarations[0].init.type === 'CallExpression' &&
        node.declarations[0].init.callee.name === 'require' &&
        node.declarations[0].init.arguments.length === 1 &&
        node.declarations[0].init.arguments[0].type === 'Literal'
      ) {
        const varName = node.declarations[0].id.name;
        const source = node.declarations[0].init.arguments[0].value;
  
        const importDecl = j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier(varName))],
          j.literal(source)
        );
  
        j(nodePath).replaceWith(importDecl);
      }
  
      // Handle destructured requires: const { something } = require('module');
      if (
        node.type === 'VariableDeclaration' &&
        node.declarations.length === 1 &&
        node.declarations[0].id.type === 'ObjectPattern' &&
        node.declarations[0].init &&
        node.declarations[0].init.type === 'CallExpression' &&
        node.declarations[0].init.callee.name === 'require' &&
        node.declarations[0].init.arguments.length === 1 &&
        node.declarations[0].init.arguments[0].type === 'Literal'
      ) {
        const properties = node.declarations[0].id.properties;
        const source = node.declarations[0].init.arguments[0].value;
  
        const importSpecifiers = properties.map(prop => {
          if (prop.type === 'Property') {
            const key = prop.key.name;
            const value = prop.value.name;
            if (key === value) {
              return j.importSpecifier(j.identifier(key));
            } else {
              return j.importSpecifier(j.identifier(key), j.identifier(value));
            }
          }
          return null;
        }).filter(Boolean);
  
        const importDecl = j.importDeclaration(importSpecifiers, j.literal(source));
        j(nodePath).replaceWith(importDecl);
      }
  
      // Handle side-effect imports: require('module');
      if (
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'CallExpression' &&
        node.expression.callee.name === 'require' &&
        node.expression.arguments.length === 1 &&
        node.expression.arguments[0].type === 'Literal'
      ) {
        const source = node.expression.arguments[0].value;
        const importDecl = j.importDeclaration([], j.literal(source));
        j(nodePath).replaceWith(importDecl);
      }
    }
  
    // Traverse the AST and apply transformations
    root.find(j.CallExpression, { callee: { name: 'require' } }).forEach(convertRequire);
    root.find(j.VariableDeclaration).forEach(convertRequire);
    root.find(j.ExpressionStatement).forEach(convertRequire);
  
    return root.toSource({ quote: 'double' });
  };
  