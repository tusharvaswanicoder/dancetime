# Getting Started

1. Run `npm install` to install all necessary node modules.
2. Navigate to `node_modules/@tensorflow/tfjs-core/dist/platforms/platform_browser.js`.
3. Add these lines after the imports:

```js
import browser from 'webextension-polyfill';

function forwardRequest(path, init) {
    return new Promise((resolve, reject) => {
        browser.runtime.sendMessage({fetchModel: true, path, init}, (response) => {
            if (!response) return reject(browser.runtime.lastError)
            return resolve({json: () => {return response}, arrayBuffer: () => {return response}, ok: true})
        })
    })
}
```

4. A few lines later, replace `return fetch(path, init);` with `return forwardRequest(path, init);`.
5. run `npm run build` to build the extension into the `/public` directory.