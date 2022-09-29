# Sanity plugin duplicate
Adds (usable) duplicate document action to Sanity.

## Installation

```
> cd admin
> yarn add @kaliber/sanity-plugin-duplicate
```

_`admin/sanity.json`_

```json
{
  "plugins": [
    "@kaliber/sanity-plugin-duplicate",
    ...
  ],
  ...
}
```

### Adding the custom document actions

To add the actual document actions, you have to add them to the default document actions. To do this, in your sanity folder create a file called `resolveDocumentActions.js` and add the following:

```js
import { singletonDocuments, documents } from './schemas/schema'
import { createDocumentActionDuplicate } from '@kaliber/sanity-plugin-duplicate'

const DocumentActionDuplicate = createDocumentActionDuplicate([...singletonDocuments, ...documents])

export default function resolveDocumentActions(props) {
  return [
    ...defaultResolve(props).filter(action => action?.name !== 'DuplicateAction'),
    DocumentActionDuplicate,
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
