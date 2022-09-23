# 💃🕺 DanceTime

Just Dance meets YouTube. 

DanceTime is a single page web app that allows you to dance/move along with any YouTube video and receive a score in realtime using pose estimation through [TensorFlow.js' MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html). All you need is a webcam to get started.

This is an open source project, but is not available through [the website](https://dancetime.io) for public consumption. You can self-host DanceTime if you want, and instructions for doing so are below. 

DanceTime uses [Svelte](https://svelte.dev), [Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview), [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/overview), [TensorFlow.js](https://www.tensorflow.org/js/), [a WebExtension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions), MySQL, and more.

DanceTime has also been tested mainly in Firefox - other browsers may not function properly. This is especially true of the WebExtension that it uses.

### Table of Contents
- [How DanceTime Works](#how-dancetime-works)
- [How to Set Up DanceTime (local)](#how-to-set-up-dancetime-local)
- [How to Set Up DanceTime (cloud)](#how-to-set-up-dancetime-cloud)
- [How to Set Up the DanceTime Extension](#how-to-set-up-the-dancetime-extension)
- [How to Analyze YouTube Videos](#how-to-analyze-youtube-videos)
- [Adjusting DanceTime Preferences](#adjusting-dancetime-preferences)
- [Known Issues](#known-issues)
- [Attribution](#attribution)
- [License](#license)

## How DanceTime Works

> For an in-depth look at the development process of DanceTime, please take a look at [this series of articles](https://dev.to/benank/series/14615).

DanceTime works by running [TensorFlow.js](https://www.tensorflow.org/js/) in a web app in your browser. The video stream from your webcam is analyzed by TensorFlow's [MoveNet model](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html) to obtain pose and keypoint data in realtime. This pose and keypoint data is then [compared](https://en.wikipedia.org/wiki/Procrustes_analysis) to the expected pose and keypoint data from a pre-analyzed dataset of a YouTube video. After many score adjustments, you are finally given a "judgement" for that frame, which is a word score of how well you performed. PERFECT is the best, and MISS is the worst:
```
PERFECT
MARVELOUS
GREAT
GOOD
ALMOST
MISS
```
At the end of the dance, all your judgements are summed up and you are given a score out of 100. There are also mid-dance snapshots that enhance the excitement of score reveals. First the scores pop up, then the headshots of the players appear over them! 😎

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
5. Disable the username content moderator: open `/api/services/Constants.mjs` and set `contentModeratorEnabled` to `false`.
6. Add yourself as an invited user in the database. Insert a new record into `invited_emails` (in either the production or development database, or both) containing only your email address. Only people with their email on the invitation list can create a user and login.
7. Run `npm run start` to start the livereload server and static web app. DanceTime should now be live at [http://localhost:4280](http://localhost:4280) (or it might say something different as it starts up - monitor the output to make find the correct link!)

## How to Set Up DanceTime (cloud)

These are steps for setting up DanceTime on a cloud provider. Specifically, the steps below are for [Azure](https://azure.com), but you can likely use similar steps for other cloud providers.

### Local Settings

This step is only necessary for [local testing with Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-develop-vs-code?tabs=nodejs).

Create a `local.settings.json` file in the `/api` directory:
```
{
    "IsEncrypted": false,
    "Values": {
        "AzureWebJobsStorage": "",
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "JWT_SECRET_KEY": "",
        "EMAIL_POST_ENDPOINT": "",
        "MAGIC_LINK_URL": "",
        "AZURE_CONTENT_MODERATOR_ENDPOINT": "",
        "AZURE_CONTENT_MODERATOR_KEY": "",
        "MYSQL_DB_USER": "",
        "MYSQL_DB_PW": "",
        "MYSQL_DB_HOST": "",
        "MYSQL_DB_PORT": "",
        "MYSQL_DB_PROD": "",
        "MYSQL_DB_DEV": "",
        "CONTENT_MOD_ENDPOINT": "",
        "CONTENT_MOD_KEY": "",
        "JWT_PLAY_SECRET_KEY": ""
    }
}
```
All fields should have the same values as your local environment (if you set up the local env first, as seen above with the `.env` file).

### MySQL Database

1. Create a new [Azure Database for MySQL Flexible Server](https://portal.azure.com/#view/Microsoft_Azure_Marketplace/GalleryItemDetailsBladeNopdl/id/Microsoft.MySQLFlexibleServer/product/) resource. In the Networking tab, make sure to allow access from any Azure service within Azure to this server and also add your current client IP address.
2. Connect to your database using a management program, such as [MySQL Workbench](https://www.mysql.com/products/workbench/).
3. Add the [Starter Database Files](https://drive.google.com/file/d/1odmwqbtVhpEOXezxYkAC7pOUZ38HdM8P/view?usp=sharing) to your database. This step is optional, but highly recommended.

### Static Webapp

1. Create a new [Static Web App](https://portal.azure.com/#view/Microsoft_Azure_Marketplace/GalleryItemDetailsBladeNopdl/id/Microsoft.StaticApp/product/). Under Deployment Details, you can choose your own repository where you cloned DanceTime.
2. Once the resource is created, nagivate to the Configuration blade. You'll need to add every field seen in the `local.settings.json` or `.env` above, mirroring your local development settings.
3. Because [Azure Functions is automatically included with static web apps](https://docs.microsoft.com/en-us/azure/static-web-apps/add-api?tabs=vanilla-javascript), there is no need to create another resources to utilize the serverless functions.

### Logic App

The Logic App is only used for sending automated emails when a user tries to login. Logins are done through magic links.

1. Create a new [Logic App](https://portal.azure.com/#view/Microsoft_Azure_Marketplace/GalleryItemDetailsBladeNopdl/id/Microsoft.LogicApp/product/).

2. Choose **Workflow** publish and **Consumption** plan type.
3. Create the resource.
4. Once it finishes, go to the API connections blade of the Logic app.
5. Add a new Gmail API connection.
6. Navigate to the Logic app code view blade.
7. Paste the code from `logic-app-code.json` into the code view. Edit the gmail connection info at the bottom, such as the subscription id and resource group name. 
8. Save.
9. Go to the Logic app designer blade. Click on the box "When a HTTP request is received" and copy the HTTP POST URL. 
10. Add this URL to the `EMAIL_POST_ENDPOINT` field of your environment settings.

### Content Moderator

Content Moderator is currently only used to check for inappropriate usernames. It is not required to play the game.

1. Enable Content Moderator: open `/api/services/Constants.mjs` and set `contentModeratorEnabled` to `true`.
1. Create a new [Content Moderator](https://azure.microsoft.com/en-us/services/cognitive-services/content-moderator/) resource.
1. Go to the "Keys and Endpoint" blade and take note of your keys and endpoint.
1. Copy your endpoint URL to the `CONTENT_MOD_ENDPOINT` field of your `.env` and `local.settings.json` files.
1. Copy one of your keys to the `CONTENT_MOD_KEY` of your `.env` and `local.settings.json` files.

## How to Set Up the DanceTime Extension

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


## How to Analyze YouTube Videos

You can add any YouTube video to DanceTime and dance along to it. Even workout videos are supported if you'd like to see how well you match the movements!

1. Make sure that you followed [the steps to set up the DanceTime extension](#how-to-set-up-the-dancetime-extension).

1. Open DanceTime in your web browser, and click the **Create** button. This will take you to the Create page, where you can analyze YouTube videos and publish them to DanceTime.

1. Click "Create New Project" to start creating a new project. Enter a name for your project and the YouTube video link you want to use. Click "Create" to create your project.
> Note: all projects are currently saved in your browser in IndexedDB. One of my TODO items is to convert the projects to cloud storage, aka MySQL, so you can access them no matter where you login to DanceTime from. Published DanceTime dances are persisted in MySQL.

4. DanceTime will take a moment to gather details about the YouTube video, and then an arrow will appear in the top right corner of the project. Click the arrow to begin editing the project.

1. There are three sections to note here:
   - Top Left: This is the editing section, where you can edit the video, add components, analyze it with TensorFlow.js, and ultimately publish it to DanceTime
   - Top Right: This is the video preview. Clicking on the preview is disabled, so you will need to use the timeline and keyboard shortcuts to navigate through the video.
   - Bottom: This is the editor timeline. It shows where you are currently at in the video, and you can click anywhere in it to navigate to that specific point in time. The combination of timeline clicking and keyboard navigation makes scrubbing through the video easy (see below for keyboard navigation).
> Editor keyboard navigation: hover over any of the play/pause icons to learn their hotkeys. For reference: Play/Pause: Space, Next/Prev Frame: Left/Right Arrows, Skip to End/Beginning: Right/Left Bracket

6. While in the EDIT tab of the editing section, you can add different components to modify your project. Descriptions of components:
    - **Project Info**: you can modify all information related to your project in this components, such as project name, chart title, song artist, and difficulty.
    - **Video In/Out Points**: this component allows you to set the in/out points of the video. This is useful if there are intros/outros in the YouTube video that you do not want in your dance. Navigate to the point in the timeline where you want to begin the video, and click "Set In", and do the same but for the end of the video.
    - **Scoring Areas**: this components allows you to mark where you want players to be scored on their dancing. If there are some parts of the video without a person in them, it's good to mark these zones as disabled for scoring. Scoring Areas uses keyframes, which means that you can mark where scoring is disabled, and then where it is enabled again.
    - **Preview Area**: this components allows you to choose a small section of the video to be shown as a preview in the song browser. Currently unused.
    - **Blocked Area**: not implemented, but was going to allow you to create generic shapes to block certain parts of the video from analysis.
    
1. After finishing with the EDIT tab, continue to the REVIEW tab. The REVIEW tab allows you to analyze the YouTube video with TensorFlow.js. To analyze:
    - *(If you see text that says "Browser extesnion required for video analysis", that means you do not have the extension installed. See [this step for more info](#how-to-set-up-the-dancetime-extension).)*
    - **Keypoint Score Threshold**: this setting indicates how confident the system was able to analyze and find certain parts of the person's body, such as elbows or hands. Lower = more tolerant of mistakes, higher = less tolerant of mistakes. Usually okay to leave at 0.5.
    - **Video Playback Rate**: in the case that you have a very powerful computer or very slow computer, you can use this to obtain better analysis results. If your computer is powerful, you can increase this to speed up analysis of the video, but you might miss frames, which will cause the analysis to be less accurate. On the other hand, if you use a slower video playback rate, more frames will be analyzed and the result will be better, but will take more time to analyze.
    - Click "Start Automatic Analysis" to start analyzing the YouTube video. You will see blue lines on your screen indicating that it is in progress. **While the analysis is in progress, _do not click away_ from this tab or use another program; this will result in decreased analysis performance and accuracy.**
    - After the analysis completes, you'll see an Analysis Summary, which indicates some common problems that may have been found and ways to fix them. Green = good, Yellow = warning, and Red = Big Problem. Right now, many parts of the summary are disabled, so you'll likely only see the Average Keypoint Frequency. If it's green, you're good to go!
    - SAVE! Since analysis takes a while, it's good to save your progress at this point by clicking the save button.
    - At this point, you can playtest your chart by clicking the play icon next to the PlayTest title. (even though it says playtesting is required, I have not made it required yet in the code 😅)

1. Once you're satisfied with the analysis, you can publish it to DanceTime! Navigate to the PUBLISH tab to do this.
    - Review all information in this tab - if something is wrong, you can go back and correct it.
    - Change the Visibility to Public.
    - Click the giant arrow underneath PUBLISH to publish it! It may take a few seconds to do so. If you publish the same chart again, it will update the existing one.

1. Congrats! Now that you've published it, you can exit the editor and check out your new dance on the homepage. Have fun!

## Adjusting DanceTime Preferences

To adjust in-game preferences for DanceTime, such as the camera source you'd like to use, follow the steps below.

1. Start playing any chart.
2. While it is loading (in the pink screen), press Enter to bring up the preferences menu.
3. Here, you can adjust your selected camera. You can also click the gray box on the right side to toggle the camera preview.
> Note: none of the other settings have been implemented yet.
4. Press Escape to return to the game.

## Known Issues

DanceTime is very much a work in progress, so there are many incomplete features and a few bugs.

Non-exhaustive list of things to know:
 - None of the tabs on the left are implemented except for the Home tab.
 - Solo mode is currently broken (change it in the top right). You can use Couple mode and only dance with one person as well.
 - You can sometimes get a score over 100, so the scoring algorithm has some bugs.
 - The Preview Area component in the Create page isn't currently used anywhere.
 - There isn't a waveform in the Create editor's timeline (there used to be one in an earlier version with a different method of video analysis)

## Attribution

If you use any part of this project in part or whole, please include a credit to [the original source](https://github.com/benank/dancetime) and [original author (benank)](https://github.com/benank).

## License

This work is licensed under GNU APGLv3. 