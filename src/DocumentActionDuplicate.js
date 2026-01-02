import { CopyIcon } from '@sanity/icons'
import { useRouter } from 'sanity/router' // eslint-disable-line import/no-unresolved
import { clear } from './clear'
/**
 * @import {
 *   SanityDocument,
 *   Schema,
 *   SourceClientOptions,
 *   SanityClient,
 *   DocumentActionDescription,
 *   SchemaType,
 *   ReferenceSchemaType,
 *   ArraySchemaType,
 *   ObjectField
 * } from 'sanity'
 */

/**
 * @arg {{
 *   document: SanityDocument | null,
 *   schema: Schema,
 *   schemaType: string,
 *   getClient: (options: SourceClientOptions) => SanityClient,
 *   reportError: (e: unknown) => void,
 *   onComplete: () => void,
 * }} props
 * @returns {DocumentActionDescription}
 */
export function DocumentActionDuplicate({ document, schema, schemaType, getClient, reportError, onComplete }) {
  const router = useRouter()
  const [isDuplicating, setDuplicating] = React.useState(false)
  const [error, setError] = React.useState(/** @type {unknown} */ (false))

  const documentSchema = schema.get(schemaType)

  const client = getClient({ apiVersion: '2023-09-22' })

  return /** @satisfies {DocumentActionDescription} */ ({
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
      ? /** @type const */ ({
        type: 'dialog',
        header: 'Problem duplicating',
        content: 'Something went wrong with duplicating. If this problem persists, please contact an administrator.',
        onClose: () => {
          setError(false)
          setDuplicating(false)
        },
        width: 'small'
      })
      : null
  })

  /**
   * @arg {string} id
   * @arg {{ schemaType: string }} context
   */
  function navigateToDocument(id, { schemaType }) {
    router.navigateIntent('edit', { id, type: schemaType })
  }
}

/**
 * @arg {SanityDocument | null} document
 * @arg {{ documentSchema?: SchemaType, client: SanityClient }} config
 */
async function duplicate(document, { documentSchema, client }) {
  const copy = duplicateRecursive({ object: document, objectSchema: documentSchema, includeNonDeclaredKeys: false })

  if (!copy)
    throw new Error(`Duplicate action resulted in falsy value for copy`)

  const created = await client.create({ ...copy, _id: 'drafts.' })

  return { id: created._id.replace('drafts.', '') }
}

/**
 * @arg {{
 *   object: Record<string, any> | undefined | null,
 *   objectSchema: SchemaType | undefined,
 *   includeNonDeclaredKeys: boolean,
 * }} props
 * @returns {any}
 */
function duplicateRecursive({ object, objectSchema, includeNonDeclaredKeys }) {
  if (!object) return object
  if (!objectSchema?.type) return object
  if (objectSchema.type.name === 'block') return object
  if (!('fields' in objectSchema)) return object

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
        'fields' in field.type ? duplicateRecursive({
          object: object[key] || {},
          objectSchema: field.type,
          includeNonDeclaredKeys: true
        }) :
        field.type.name === 'array' && 'of' in field.type ? duplicateRecursiveArray({
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

/**
 * @arg {{ array: Record<string, any>[], arraySchemas: (Exclude<SchemaType, ArraySchemaType> | ReferenceSchemaType)[] }} param0
 */
function duplicateRecursiveArray({ array, arraySchemas }) {
  return array.map(object => {
    const objectSchema = arraySchemas.find(objectSchema => objectSchema.name === object._type)
    return duplicateRecursive({ object, objectSchema, includeNonDeclaredKeys: true })
  })
}

/** @arg {ObjectField} field */
function getReplaceValueFunction(field) {
  const replaceValueOrFunction = field.type.options?.kaliber?.duplicate
  return replaceValueOrFunction && (
    typeof replaceValueOrFunction === 'function'
      ? replaceValueOrFunction
      : () => replaceValueOrFunction
  )
}
