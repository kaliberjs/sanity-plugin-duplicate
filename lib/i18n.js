"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.i18n = i18n;

function i18n(language) {
  var strings = {
    'en': {
      'duplicate': 'Duplicate'
    },
    'nl': {
      'duplicate': 'Dupliceer'
    }
  };
  return strings[language || 'nl'];
}
//# sourceMappingURL=i18n.js.map