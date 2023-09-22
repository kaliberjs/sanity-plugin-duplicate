import { definePlugin } from 'sanity'
import { DocumentActionDuplicate } from './DocumentActionDuplicate'

/** @typedef {{ reportError(e: Error): void }} Options */
export { clear } from './clear'

export const sanityPluginDuplicate = definePlugin(
  /** @type {import('sanity').PluginFactory<Options>} */
  ({ reportError }) => ({
    name: 'sanity-plugin-duplicate',
    document: {
      actions: (prev, context) => {
        const { schema, schemaType } = context
        const getClient = context.getClient.bind(context)

        duplicateAction.action = 'duplicate' // allow for filtering

        return prev.map(x => x.action === duplicateAction.action ? duplicateAction : x)
          
        /** @type {import('sanity').DocumentActionComponent} */
        function duplicateAction({ draft, published, onComplete }) {
          return DocumentActionDuplicate({
            document: draft || published,
            schema,
            schemaType,
            getClient,
            reportError,
            onComplete,
          })
        }
      }
    }
  })
)

