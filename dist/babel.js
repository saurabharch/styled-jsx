'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // Packages


// Ours


exports.default = function (_ref) {
  var t = _ref.types;

  var isGlobalEl = function isGlobalEl(el) {
    return el.attributes.some(function (attr) {
      return attr && attr.name && attr.name.name === GLOBAL_ATTRIBUTE;
    });
  };

  var isStyledJsx = function isStyledJsx(_ref2) {
    var el = _ref2.node;
    return t.isJSXElement(el) && el.openingElement.name.name === 'style' && el.openingElement.attributes.some(function (attr) {
      return attr && attr.name && attr.name.name === STYLE_ATTRIBUTE;
    });
  };

  var findStyles = function findStyles(path) {
    if (isStyledJsx(path)) {
      var node = path.node;

      return isGlobalEl(node.openingElement) ? [node] : [];
    }

    return path.get('children').filter(isStyledJsx).map(function (_ref3) {
      var node = _ref3.node;
      return node;
    });
  };

  var getExpressionText = function getExpressionText(expr) {
    return t.isTemplateLiteral(expr) ? expr.quasis[0].value.raw :
    // assume string literal
    expr.value;
  };

  var makeStyledJsxTag = function makeStyledJsxTag(id, transformedCss) {
    return t.JSXElement(t.JSXOpeningElement(t.JSXIdentifier(STYLE_COMPONENT), [t.JSXAttribute(t.JSXIdentifier(STYLE_COMPONENT_ID), t.JSXExpressionContainer(t.numericLiteral(id))), t.JSXAttribute(t.JSXIdentifier(STYLE_COMPONENT_CSS), t.JSXExpressionContainer(t.stringLiteral(transformedCss)))], true), null, []);
  };

  return {
    inherits: _babelPluginSyntaxJsx2.default,
    visitor: {
      JSXOpeningElement: function JSXOpeningElement(path, state) {
        var el = path.node;

        var _ref4 = el.name || {},
            name = _ref4.name;

        if (!state.hasJSXStyle) {
          return;
        }

        if (state.ignoreClosing === null) {
          // we keep a counter of elements inside so that we
          // can keep track of when we exit the parent to reset state
          // note: if we wished to add an option to turn off
          // selectors to reach parent elements, it would suffice to
          // set this to `1` and do an early return instead
          state.ignoreClosing = 0;
        }

        if (name && name !== 'style' && name !== STYLE_COMPONENT && name.charAt(0) !== name.charAt(0).toUpperCase()) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = el.attributes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _attr = _step.value;

              if (_attr.name === MARKUP_ATTRIBUTE || _attr.name.name === MARKUP_ATTRIBUTE) {
                // avoid double attributes
                return;
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          var attr = t.jSXAttribute(t.JSXIdentifier(MARKUP_ATTRIBUTE), t.JSXExpressionContainer(t.numericLiteral(state.jsxId)));
          el.attributes.push(attr);
        }

        state.ignoreClosing++;
        // next visit will be: JSXElement exit()
      },

      JSXElement: {
        enter: function enter(path, state) {
          if (state.hasJSXStyle !== null) {
            return;
          }

          var styles = findStyles(path);

          if (styles.length === 0) {
            return;
          }

          state.styles = [];

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = styles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var style = _step2.value;

              // compute children excluding whitespace
              var children = style.children.filter(function (c) {
                return t.isJSXExpressionContainer(c) ||
                // ignore whitespace around the expression container
                t.isJSXText(c) && c.value.trim() !== '';
              });

              if (children.length !== 1) {
                throw path.buildCodeFrameError('Expected one child under ' + ('JSX Style tag, but got ' + style.children.length + ' ') + '(eg: <style jsx>{`hi`}</style>)');
              }

              var child = children[0];

              if (!t.isJSXExpressionContainer(child)) {
                throw path.buildCodeFrameError('Expected a child of ' + 'type JSXExpressionContainer under JSX Style tag ' + ('(eg: <style jsx>{`hi`}</style>), got ' + child.type));
              }

              var expression = child.expression;

              if (!t.isTemplateLiteral(child.expression) && !t.isStringLiteral(child.expression)) {
                throw path.buildCodeFrameError('Expected a template ' + 'literal or String literal as the child of the ' + 'JSX Style tag (eg: <style jsx>{`some css`}</style>),' + (' but got ' + expression.type));
              }

              var styleText = getExpressionText(expression);
              var styleId = (0, _stringHash2.default)(styleText);

              state.styles.push([styleId, styleText, expression.loc]);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          state.jsxId = (0, _stringHash2.default)(state.styles.map(function (s) {
            return s[1];
          }).join(''));
          state.hasJSXStyle = true;
          state.file.hasJSXStyle = true;
          // next visit will be: JSXOpeningElement
        },
        exit: function exit(path, state) {
          var el = path.node.openingElement;
          var isGlobal = isGlobalEl(el);

          if (state.hasJSXStyle && ! --state.ignoreClosing && !isGlobal) {
            state.hasJSXStyle = null;
          }

          if (!state.hasJSXStyle || !el.name || el.name.name !== 'style') {
            return;
          }

          // we replace styles with the function call

          var _state$styles$shift = state.styles.shift(),
              _state$styles$shift2 = _slicedToArray(_state$styles$shift, 3),
              id = _state$styles$shift2[0],
              css = _state$styles$shift2[1],
              loc = _state$styles$shift2[2];

          if (isGlobal) {
            path.replaceWith(makeStyledJsxTag(id, css));
            return;
          }

          var useSourceMaps = Boolean(state.file.opts.sourceMaps);
          var transformedCss = void 0;

          if (useSourceMaps) {
            var filename = state.file.opts.sourceFileName;
            var generator = new _sourceMap.SourceMapGenerator({
              file: filename,
              sourceRoot: state.file.opts.sourceRoot
            });
            generator.setSourceContent(filename, state.file.code);
            transformedCss = [(0, _styleTransform2.default)(String(state.jsxId), css, generator, loc.start, filename), _convertSourceMap2.default.fromObject(generator).toComment({ multiline: true }), '/*@ sourceURL=' + filename + ' */'].join('\n');
          } else {
            transformedCss = (0, _styleTransform2.default)(String(state.jsxId), css);
          }

          path.replaceWith(makeStyledJsxTag(id, transformedCss));
        }
      },
      Program: {
        enter: function enter(path, state) {
          state.hasJSXStyle = null;
          state.ignoreClosing = null;
          state.file.hasJSXStyle = false;
        },
        exit: function exit(_ref5, state) {
          var node = _ref5.node,
              scope = _ref5.scope;

          if (!(state.file.hasJSXStyle && !scope.hasBinding(STYLE_COMPONENT))) {
            return;
          }

          var importDeclaration = t.importDeclaration([t.importDefaultSpecifier(t.identifier(STYLE_COMPONENT))], t.stringLiteral('styled-jsx/style'));

          node.body.unshift(importDeclaration);
        }
      }
    }
  };
};

var _babelPluginSyntaxJsx = require('babel-plugin-syntax-jsx');

var _babelPluginSyntaxJsx2 = _interopRequireDefault(_babelPluginSyntaxJsx);

var _stringHash = require('string-hash');

var _stringHash2 = _interopRequireDefault(_stringHash);

var _sourceMap = require('source-map');

var _convertSourceMap = require('convert-source-map');

var _convertSourceMap2 = _interopRequireDefault(_convertSourceMap);

var _styleTransform = require('../lib/style-transform');

var _styleTransform2 = _interopRequireDefault(_styleTransform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var STYLE_ATTRIBUTE = 'jsx';
var GLOBAL_ATTRIBUTE = 'global';
var MARKUP_ATTRIBUTE = 'data-jsx';
var STYLE_COMPONENT = '_JSXStyle';
var STYLE_COMPONENT_ID = 'styleId';
var STYLE_COMPONENT_CSS = 'css';