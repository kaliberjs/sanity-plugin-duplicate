"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDocumentActionDuplicate = createDocumentActionDuplicate;

var _client = _interopRequireDefault(require("part:@sanity/base/client"));

var _icons = require("@sanity/icons");

var _i18n = require("./i18n");

var _router = require("@sanity/base/router");

var _sanityPluginDuplicate = _interopRequireDefault(require("config:@kaliber/sanity-plugin-duplicate"));

var _excluded = ["_id", "_createdAt", "_updatedAt"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var client = _client.default.withConfig({
  apiVersion: '2022-04-06'
});

function createDocumentActionDuplicate(documentSchemes) {
  var documentTypes = getReplacementFunctionsForAllSchemes(documentSchemes);
  var i18n = (0, _i18n.i18n)(_sanityPluginDuplicate.default.language);
  return function DocumentActionDuplicate(_ref) {
    var type = _ref.type,
        published = _ref.published,
        draft = _ref.draft;
    var router = (0, _router.useRouter)();
    return {
      icon: _icons.CopyIcon,
      label: 'Duplicate',
      title: i18n['duplicate'],
      onHandle: function () {
        var _onHandle = _asyncToGenerator(function* () {
          var currentDoc = draft || published;
          if (!currentDoc) return;

          var _id = currentDoc._id,
              _createdAt = currentDoc._createdAt,
              _updatedAt = currentDoc._updatedAt,
              currentContent = _objectWithoutProperties(currentDoc, _excluded);

          var replacementFunctions = documentTypes === null || documentTypes === void 0 ? void 0 : documentTypes[type];
          var replacementData = Object.fromEntries(Object.entries(replacementFunctions || []).map(_ref2 => {
            var _ref3 = _slicedToArray(_ref2, 2),
                fieldName = _ref3[0],
                replacement = _ref3[1];

            return [fieldName, typeof replacement === 'function' ? replacement(currentContent[fieldName]) : replacement];
          }));

          var doc = _objectSpread(_objectSpread(_objectSpread({}, currentContent), replacementData), {}, {
            _id: 'drafts.'
          });

          var created = yield client.create(doc);
          router.navigateIntent('edit', {
            id: created._id,
            type
          });
        });

        function onHandle() {
          return _onHandle.apply(this, arguments);
        }

        return onHandle;
      }()
    };
  };
}

function getReplacementFunctionsForAllSchemes(documentSchemes) {
  return Object.fromEntries(documentSchemes.map(x => [x.name, Object.fromEntries(x.fields.filter(x => {
    var _x$kaliberOptions, _x$kaliberOptions2, _x$kaliberOptions3, _x$kaliberOptions4, _x$kaliberOptions5;

    return typeof ((_x$kaliberOptions = x.kaliberOptions) === null || _x$kaliberOptions === void 0 ? void 0 : _x$kaliberOptions.duplicate) === 'function' || typeof ((_x$kaliberOptions2 = x.kaliberOptions) === null || _x$kaliberOptions2 === void 0 ? void 0 : _x$kaliberOptions2.duplicate) === 'string' || typeof ((_x$kaliberOptions3 = x.kaliberOptions) === null || _x$kaliberOptions3 === void 0 ? void 0 : _x$kaliberOptions3.duplicate) === 'number' || typeof ((_x$kaliberOptions4 = x.kaliberOptions) === null || _x$kaliberOptions4 === void 0 ? void 0 : _x$kaliberOptions4.duplicate) === 'boolean' || typeof ((_x$kaliberOptions5 = x.kaliberOptions) === null || _x$kaliberOptions5 === void 0 ? void 0 : _x$kaliberOptions5.duplicate) === 'object';
  }).map(field => [field.name, field.kaliberOptions.duplicate]))]));
}
//# sourceMappingURL=createDocumentActionDuplicate.js.map