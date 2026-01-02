import { definePlugin } from 'sanity'
import { DocumentActionDuplicate } from './DocumentActionDuplicate'
/** @import { DocumentActionComponent, PluginFactory } from 'sanity' */

const action = 'duplicate'

/** @typedef {{ reportError(e: unknown): void }} Options */

export const sanityPluginDuplicate = definePlugin(
  /** @type {PluginFactory<Options>} */
  ({ reportError }) => ({
    name: 'sanity-plugin-duplicate',
    document: {
      // @ts-ignore
      actions: (prev, context) => {
        const { schema, schemaType } = context
        const getClient = context.getClient.bind(context)

        duplicateAction.action = action // allow for filtering

        return prev.map(x => x.action === action ? duplicateAction : x)

        /**
         * @arg {Parameters<DocumentActionComponent>[0]} props
         */
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

