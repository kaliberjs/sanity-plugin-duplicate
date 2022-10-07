import sanityClient from 'part:@sanity/base/client'
import { CopyIcon } from '@sanity/icons'
import { useRouter } from '@sanity/base/router'
import schema from 'part:@sanity/base/schema'
import React from 'react'

const client = sanityClient.withConfig({
  apiVersion: '2022-04-06'
})

export function DocumentActionDuplicate({ type, published, draft }) {
  const router = useRouter()
  const [isDuplicating, setDuplicating] = React.useState(false)
  const [error, setError] = React.useState(false)

  return {
    icon: CopyIcon,
    disabled: isDuplicating,
    label: isDuplicating ? 'Duplicating' : 'Duplicate',
    title: 'Duplicate',
    onHandle: async () => {
      try {
        setDuplicating(true)
        const currentDoc = draft || published
        if (!currentDoc) return

        const { _id, _createdAt, _updatedAt, ...currentContent } = currentDoc
        const replacementFunctions = getReplacementFunctions(schema.get(type))
        const replacementData = Object.fromEntries(replacementFunctions
          .map(([fieldName, replacement]) =>
            [fieldName, typeof replacement === 'function' ? replacement(currentContent[fieldName]) : replacement]
          )
        )

        const doc = { ...currentContent, ...replacementData, _id: 'drafts.' }
        const created = await client.create(doc)
        router.navigateIntent('edit', { id: created._id, type })
        setDuplicating(false)
      } catch {
        setError(true)
      }
    },
    dialog: error && {
      onClose: () => {
        setError(false)
        setDuplicating(false)
      },
      type: 'modal',
      content: 'Something went wrong with duplicating. Please try again.'
    }
  }
}


function getReplacementFunctions(schema) {
  return schema.fields
    .filter(x => ![undefined, null].includes(x.type.kaliberOptions?.duplicate))
    .map(field => [field.name, field.type.kaliberOptions.duplicate])
}
