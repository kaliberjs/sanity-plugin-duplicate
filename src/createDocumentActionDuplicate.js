import sanityClient from 'part:@sanity/base/client'
import { CopyIcon } from '@sanity/icons'
import { i18n as getI18n } from './i18n'
import { useRouter } from '@sanity/base/router'
import pluginConfig from 'config:@kaliber/sanity-plugin-duplicate'

const client = sanityClient.withConfig({
  apiVersion: '2022-04-06'
})

export function createDocumentActionDuplicate(documentSchemes) {
  const documentTypes = getReplacementFunctionsForAllSchemes(documentSchemes)
  const i18n = getI18n(pluginConfig.language)

  return function DocumentActionDuplicate({ type, published, draft }) {
    const router = useRouter()
    return {
      icon: CopyIcon,
      label: 'Duplicate',
      title:  i18n['duplicate'],
      onHandle: async () => {
        const currentDoc = draft || published
        if (!currentDoc) return

        const { _id, _createdAt, _updatedAt, ...currentContent} = currentDoc
        
        const replacementFunctions = documentTypes?.[type]
        const replacementData = Object.fromEntries(
          Object.entries(replacementFunctions || [])
          .map(([fieldName, replacement]) =>
            [fieldName, typeof replacement === 'function' ? replacement(currentContent[fieldName]) : replacement]
          )
        )

        const doc = { ...currentContent, ...replacementData, _id: 'drafts.' }
        const created = await client.create(doc)
        router.navigateIntent('edit', { id: created._id, type })
      },
    }
  }

}

function getReplacementFunctionsForAllSchemes(documentSchemes) {
  return Object.fromEntries(documentSchemes
    .map(x => [x.name, Object.fromEntries(x.fields
      .filter(x =>
        typeof x.kaliberOptions?.duplicate === 'function'
        || typeof x.kaliberOptions?.duplicate === 'string'
        || typeof x.kaliberOptions?.duplicate === 'number'
        || typeof x.kaliberOptions?.duplicate === 'boolean'
        || typeof x.kaliberOptions?.duplicate === 'object'
      )
      .map(field => [field.name, field.kaliberOptions.duplicate]))
    ])
  )
}
