# 💃🕺 DanceTime

Just Dance meets YouTube. 

DanceTime is a web app that allows you to dance/move along with any YouTube video and receive a score in realtime using pose estimation through [TensorFlow.js' MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html). All you need is a webcam to get started.

This is an open source project, but is not available through [the website](https://dancetime.io) for public consumption. You can self-host DanceTime if you want, and instructions for doing so are below. 

DanceTime uses [Svelte](https://svelte.dev), [Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview), [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/overview), [TensorFlow.js](https://www.tensorflow.org/), [a WebExtension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions), MySQL, and more.

## How DanceTime Works

> For an in-depth look at the development process of DanceTime, please take a look at [this series of articles](https://dev.to/benank/series/14615).



## How to Set Up DanceTime (local)

1. Git clone this repository to your machine.
2. Run `npm install` to install all required node modules.
3. Run `npm install -g @azure/static-web-apps-cli azure-functions-core-tools` to install Azure Static Web Apps for local development and usage.
4.  Create a `.env` file with the following fields:

```
JWT_SECRET_KEY=<random secret key string>
EMAIL_POST_ENDPOINT=<Azure logic apps email post endpoint URL>
MAGIC_LINK_URL=<magic link URL to embed in emails, such as https://dancetime.io/login>
MYSQL_DB_USER=<MySQL database username>
MYSQL_DB_PW=<MySQL database password>
MYSQL_DB_HOST=<MySQL database host, such as xxx.mysql.database.azure.com or localhost>
MYSQL_DB_PORT=<MySQL database port, eg. 3306>
MYSQL_DB_PROD=<MySQL production database name>
MYSQL_DB_DEV=<MySQL development database name>
CONTENT_MOD_ENDPOINT=<Azure services content moderator endpoint URL>
CONTENT_MOD_KEY=<Azure content moderator key>
```

5. As part of Step 3, you'll need to set up a MySQL server, either locally on your computer or in a cloud environment. While you don't need to set up the prod/dev databases yourself (as the code will do it for you), it might be a good idea to use the [Starter Database Files](https://drive.google.com/file/d/1odmwqbtVhpEOXezxYkAC7pOUZ38HdM8P/view?usp=sharing) that I have provided. These are database files that contain many pre-created/analyzed dances so you can jump right in without having to analyze videos first (and you won't need to install the extension either). This is my personal collection of many fun songs to dance to, and I hope you will enjoy them as well if you choose to use them.
6. Add yourself as an invited user in the database. Insert a new record into `invited_emails` (in either the production or development database, or both) containing only your email address. Only people with their email on the invitation list can create a user and login.
7. Run `npm run start` to start the livereload server and static web app. DanceTime should now be live at [http://localhost:4280](http://localhost:4280) (or it might say something different as it starts up - monitor the output to make find the correct link!)


### How to Set Up the DanceTime Extension

If you want to analyze YouTube videos and add them to the collection of playable videos, you will need to install the DanceTime browser extension. Currently this extension has only been tested on Firefox. This step is not required if you only want to play and do not want to analyze and add new YouTube videos.

1. Navigate to `/extension`.
2. Run `npm install` to install all required node modules.
3. Open the file: `node_modules/@tensorflow/tfjs-core/dist/platforms/platform_browser.js`
4. Replace the following in the file:
```js
export class PlatformBrowser {
    fetch(path, init) {
        return fetch(path, init);
    }
```
with this:
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
export class PlatformBrowser {
    fetch(path, init) {
        return forwardRequest(path, init);
    }
```
This step is necessary because the injected part of the extension in the page isn't allowed to make network requests, so the network request must be forwarded to the background element of the extension to make the network request. Once the response is received, it is sent back to the extension. This is only used to load the TensorFlow.js model.

5. Run `npm run build` to build the extension.
6. In Firefox, type `about:debugging` into the search bar and hit enter.
7. Click "This Firefox" on the left side.
8. Click "Load Temporary Add-on...".
9. Select the manifest file: `/extension/public/manifest.json`
10. This should load the extension into your browser, and you should now be able to analyze YouTube videos. If the browser is closed, you will need to repeat steps 6-9 to load the extension into Firefox again.


## How to Set Up DanceTime (cloud)

These are steps for setting up DanceTime on a cloud provider. Specifically, the steps below are for [Azure](https://azure.com), but you can likely use similar steps for other cloud providers.

**TODO**

## Attribution

If you use any part of this project in part or whole, please include a credit to [the original source](https://github.com/benank/dancetime) and [original author (benank)](https://github.com/benank).

## License

This work is licensed under GNU APGLv3. 