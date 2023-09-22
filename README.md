# Sanity plugin duplicate
Replaces the default duplicate function of Sanity and allows for the schema to determine how
to handle duplication of specific fields.

## Installation

```
> yarn add @kaliber/sanity-plugin-duplicate
```

_`config/default.js`_

```js
{
  kaliber: [
    compileWithBabel: [
      /@kaliber\/sanity-plugin-duplicate/,
      ...
    ],
    ...
  ],
  ...
}
```

_`admin/sanity.config.js`_

```js
defineConfig({
    ...

    plugins: [
      preview({ reportError }),
      ...
    ],
})
```

Signatures of `reportError`:

```ts
(e: Error) => void
```

## Additional setup

Customize duplication can be done by setting the Kaliber `duplicate` option.

```js
import { clear } from '@kaliber/sanity-plugin-duplicate'

export const page = {
  type: 'document',
  name: 'page',
  title: 'Page',
  ...
  fields: [
    {
      title: 'My Field',
      name: 'myField',
      type: 'string',
      ...
      options: {
        kaliber: {
          duplicate: clear,
          ...
        },
        ...
      }
    }
  ]
```

The `duplicate` option allows for the following values:

* A regular value, this value is used in the duplication
* The `clear` symbol, the field is cleared (removed) during duplication
* A function, the function is called with the current value to generate a new value

Common example for things like titles:

```
  options: {
    kaliber: {
      duplicate(previousValue) {
        return `${previousValue} (copy)`
      }
    }
  }
```

---

## Development

```
> yarn
> yarn link
```

```
project/> yarn link @kaliber/sanity-plugin-duplicate
project/> yarn add @kaliber/sanity-plugin-duplicate@link:./node_modules/@kaliber/sanity-plugin-duplicate
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
