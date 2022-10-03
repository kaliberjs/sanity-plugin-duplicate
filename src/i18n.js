export function i18n(language) {
  const strings = {
    'en': {
      'duplicate': 'Duplicate',
      'duplicating': 'Duplicating...',
    },
    'nl': {
      'duplicate': 'Dupliceer',
      'duplicating': 'Aan het dupliceren...',
    },
  }
  return strings[language || 'nl']
}
