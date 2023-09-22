import { CopyIcon } from '@sanity/icons'
import { useRouter } from 'sanity/router'

export function DocumentActionDuplicate({ document, schema, schemaType, getClient, reportError, onComplete }) {
  const router = useRouter()
  const [isDuplicating, setDuplicating] = React.useState(false)
  const [error, setError] = React.useState(false)
  
  const documentSchema = schema.get(schemaType)
  const client = getClient({ apiVersion: '2023-09-22' })

  /** @type {ReturnType<import('sanity').DocumentActionComponent>} */
  return {
    icon: CopyIcon,
    disabled: isDuplicating || !document,
    label: isDuplicating ? 'Duplicating' : 'Duplicate',
    title: 'Duplicate',
    onHandle: async () => {
      try {
        setDuplicating(true)
        const { id } = await duplicate(document, { documentSchema, client })
        navigateToDocument(id, { schemaType })
        setDuplicating(false)
        onComplete()
      } catch (e) {
        reportError(e)
        setError(e)
      }
    },
    dialog: error 
      ? {
        type: 'dialog',
        header: 'Problem duplicating',
        content: 'Something went wrong with duplicating. If this problem persists, please contact an administrator.',
        onClose: () => {
          setError(false)
          setDuplicating(false)
        },
        width: 'small'
      }
      : null
  }

  function navigateToDocument(id, { schemaType }) {
    router.navigateIntent('edit', { id, type: schemaType })
  }
}

async function duplicate(document, { documentSchema, client }) {
  const { _id, _createdAt, _updatedAt, ...currentContent } = document
  // TODO: this is not good enough - nested objects will be missed
  const replacementFunctions = getReplacementFunctions(documentSchema)
  const replacementData = Object.fromEntries(replacementFunctions
    .map(([fieldName, replacement]) =>[fieldName, replacement(currentContent[fieldName])])
  )// TODO, handle clear even though it already works because as a symbol it's not serialized to JSON

  const doc = { ...currentContent, ...replacementData, _id: 'drafts.' }
  const created = await client.create(doc)
  
  return { id: created._id.replace('drafts.', '') }
}

function getReplacementFunctions(schema) {
  return schema.fields
    .filter(x => x.type.options?.kaliber?.duplicate !== undefined)
    .map(field => {
      const duplicateValueOrFunction = field.type.options.kaliber.duplicate
      return [field.name, typeof duplicateValueOrFunction === 'function' ? duplicateValueOrFunction : () => duplicateValueOrFunction]
    })
}
