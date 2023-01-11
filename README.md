# Sanity plugin duplicate
Adds (usable) duplicate document action to Sanity.

## Installation

```
> cd admin
> yarn add @kaliber/sanity-plugin-duplicate
```

### Adding the custom document actions

To add the actual document actions, you have to add them to the default document actions. To do this, in your sanity folder create a file called `resolveDocumentActions.js` and add the following:

```js
import defaultResolve, { DuplicateAction } from 'part:@sanity/base/document-actions'
import { DocumentActionDuplicate } from '@kaliber/sanity-plugin-duplicate'

export default function resolveDocumentActions(props) {
  return [
    ...defaultResolve(props).map(x => x === DuplicateAction ? DocumentActionDuplicate : x),
    DocumentActionProductionPreview,
    DocumentActionProductionReview
  ]
}

```

Then add the `part:@sanity/base/document-actions/resolver` part to the parts array in `sanity.json`:

```json
{
  "implements": "part:@sanity/base/document-actions/resolver",
  "path": "./resolveDocumentActions.js"
}
```

---

### Adding custom duplicate value to field

You can define custom duplicate values by adding `kaliberOptions: { duplicate: ...}` to your document scheme.

```js
const doc = {
  type: 'document',
  name: 'post',
  fields: [
    {
      type: 'text',
      name: 'title',
      kaliberOptions: {
        duplicate: 'fixed title'
      }
    },
    {
      type: 'number',
      name: 'index',
      kaliberOptions: {
        duplicate: index => index + 1
      }
    },
    {
      type: 'string',
      name: 'translationId',
      kaliberOptions: {
        duplicate: () => uuid.v4()
      }
    },
    {
      type: 'slug',
      name: 'slug',
      kaliberOptions: {
        duplicate: slug => ({type: 'slug', current: `${slug.current}-duplicate`})
      }
    }
  ]
}
```

## Development

```
> yarn
> yarn link
> yarn watch
```

```
project/admin/> yarn link @kaliber/sanity-plugin-duplicate
```

## Publish

```
yarn publish
git push
git push --tags
```

---

![](https://media.giphy.com/media/3oriOfWPE8r5YeK3lK/giphy.gif)

## Disclaimer
This library is intended for internal use, we provide __no__ support, use at your own risk.
