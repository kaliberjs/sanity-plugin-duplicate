import { definePlugin } from 'sanity'
import { AddIcon } from '@sanity/icons'

export const privateDocumentTypes = definePlugin(
  ({ types }) => ({
    name: 'sanity-plugin-private-document-types',
    schema: {
      types: prev => prev.map(type => types.includes(type.name) ? withPrivateTranslationIds(type) : type),
    },
    document: {
      newDocumentOptions: prev => prev.filter(x => !types.includes(x.templateId)),
      actions: (prev, { schemaType }) => types.includes(schemaType)
        ? prev.filter(x => x.action !== 'duplicate')
        : prev,
    },
  })
)

export function privateCreateMenuItem(S, { type, title }) {
  return S.menuItem()
    .title(title)
    .icon(AddIcon)
    .showAsAction(true)
    .action(() => window.location.assign(
      `/admin/intent/create/type=${type};id=${type}.${crypto.randomUUID()}`
    ))
}

function withPrivateTranslationIds(type) {
  return {
    ...type,
    options: {
      ...type.options,
      kaliber: {
        ...type.options?.kaliber,
        multiLanguageNewDocumentId: () => `drafts.${type.name}.${crypto.randomUUID()}`,
      },
    },
  }
}
