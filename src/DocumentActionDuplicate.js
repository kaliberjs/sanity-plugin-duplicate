import sanityClient from 'part:@sanity/base/client'
import { CopyIcon } from '@sanity/icons'
import { i18n as getI18n } from './i18n'
import { useRouter } from '@sanity/base/router'
import pluginConfig from 'config:@kaliber/sanity-plugin-duplicate'
import schema from 'part:@sanity/base/schema'

const client = sanityClient.withConfig({
  apiVersion: '2022-04-06'
})

export function DocumentActionDuplicate({ type, published, draft }) {
  const router = useRouter()
  const i18n = getI18n(pluginConfig.language)
  return {
    icon: CopyIcon,
    label: 'Duplicate',
    title: i18n['duplicate'],
    onHandle: async () => {
      const currentDoc = draft || published
      if (!currentDoc) return
      
      const { _id, _createdAt, _updatedAt, ...currentContent } = currentDoc
      const replacementFunctions = getReplacementFunctions(schema.get(type))
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


function getReplacementFunctions(schema) {
  return Object.fromEntries(schema.fields
    .filter(x => ![undefined, null].includes(x.type.kaliberOptions?.duplicate))
    .map(field => [field.name, field.type.kaliberOptions.duplicate]))
}
