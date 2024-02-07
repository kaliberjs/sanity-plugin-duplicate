import { CopyIcon } from '@sanity/icons'
import { useRouter } from 'sanity/router'
import { clear } from './clear'

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
  const copy = duplicateRecursive({ object: document, objectSchema: documentSchema, includeNonDeclaredKeys: false })

  const created = await client.create({ ...copy, _id: 'drafts.' })

  return { id: created._id.replace('drafts.', '') }
}


function duplicateRecursive({ object, objectSchema, includeNonDeclaredKeys }) {
  if(!objectSchema) return object

  const fromFields = Object.fromEntries(
    objectSchema.fields.flatMap(field => {
      const key = field.name

      if (!(key in object)) return []

      const originalValue = object[key]
      const replaceValue = getReplaceValueFunction(field)
      const replacementValue = replaceValue?.(originalValue)

      if (replacementValue === clear) return []
      return [[
        key,
        replaceValue ? replacementValue :
        field.type.fields ? duplicateRecursive({
          object: object[key] || {},
          objectSchema: field.type,
          includeNonDeclaredKeys: true
        }) :
        field.type.name === 'array' ? duplicateRecursiveArray({
          array: object[key] || [],
          arraySchemas: field.type.of
        }) :
        originalValue
      ]]
    })
  )

  return {
    _type: object._type,
    ...(includeNonDeclaredKeys && object),
    ...fromFields,
  }
}

function duplicateRecursiveArray({ array, arraySchemas }) {
  return array.map(object => {
    const objectSchema = arraySchemas.find(objectSchema => objectSchema.name === object._type)
    return duplicateRecursive({ object, objectSchema, includeNonDeclaredKeys: true })
  })
}

function getReplaceValueFunction(field) {
  const replaceValueOrFunction = field.type.options?.kaliber?.duplicate
  return replaceValueOrFunction && (
    typeof replaceValueOrFunction === 'function'
      ? replaceValueOrFunction
      : () => replaceValueOrFunction
  )
}
