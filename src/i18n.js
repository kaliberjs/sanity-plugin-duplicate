export function i18n(language) {
  const strings = {
    'en': {
      'duplicate': 'Duplicate',
    },
    'nl': {
      'duplicate': 'Dupliceer',
    },
  }
  return strings[language || 'nl']
}
