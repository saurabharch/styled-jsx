'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.flush = flush;

var _react = require('react');

var _render = require('./render');

var _render2 = _interopRequireDefault(_render);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var update = typeof window === 'undefined' ? doRender : updateOnClient;
var components = [];
var updatePromise = void 0;

var _class = function (_Component) {
  _inherits(_class, _Component);

  function _class() {
    _classCallCheck(this, _class);

    return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
  }

  _createClass(_class, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      mount(this);
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate() {
      update();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      unmount(this);
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }]);

  return _class;
}(_react.Component);

exports.default = _class;
function flush() {
  var ret = {};

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = components[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref2 = _step.value;
      var props = _ref2.props;

      ret[props.styleId] = props.css;
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

  components = [];

  return ret;
}

function mount(component) {
  components.push(component);
  update();
}

function unmount(component) {
  var i = components.indexOf(component);
  if (i < 0) {
    return;
  }

  components.splice(i, 1);
  update();
}

function updateOnClient() {
  // Debounce calls and only render once the latest promise resolves.
  // rAF causes FOUC in Safari, setTimeout causes FOUC in Chrome, Promise#then()
  // ensures micro task enqueuing of styles update before paint.
  var promise = updatePromise = Promise.resolve().then(function () {
    if (promise === updatePromise) {
      updatePromise = null;
      doRender();
    }
  });
}

function doRender() {
  (0, _render2.default)(components);
}