const PORT = process.env.PORT || 3001;
require('dotenv').config();

const { EnsurePythonIsInstalledLinux } = require('./PythonManager');
EnsurePythonIsInstalledLinux();
const rateLimit = require("express-rate-limit");

const express = require('express');
const cookieParser = require('cookie-parser');
const { YTDL } = require('./YouTubeDL');
YTDL.init();

const { mediaManager } = require('./MediaManager');

function isAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.end();
    }
}

const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5000
});

const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 10, // start blocking after 10 requests
    message:
      "Too many accounts created from this IP, please try again after an hour"
});

const app = express();
app.use(express.json());
app.use(cookieParser());

// Look for user cookies to see if they are already logged in
app.use(require('./CookieManager').CookieCheck)

app.use(express.static('public'));

// TODO: check if authenticated before allowing access to the endpoint

// User is querying an existing chart in the db
app.get('/api/chart/:id', apiLimiter, isAuthenticated, (req, res) => {
    // console.log(req.params.id);
    // req.params.id for the :id param
    // res.send({name: 'bob'})
    // get query params: req.query.[param]
    // res.end()
});

// User is creating a new chart - create a new chart in db, download video, etc
app.post('/api/chart/new', apiLimiter, isAuthenticated, (req, res) => {
    // console.log(req.params.id);
    // req.params.id for the :id param
    // res.send({name: 'bob'})
    // get query params: req.query.[param]
    // res.end()
});

// id is a uuid
app.post('/api/video/', apiLimiter, isAuthenticated, (req, res) => {
    // See what the current download status of a video is.
    // If it does not exist, begin downloading and return status.
    console.log(req.body);
    mediaManager.getMedia(req.body.media_id, req.body.query).then((media_info) => {
        res.send(media_info);
        res.end();
    });
});

// User arrives here with a magic link
app.get('/login', createAccountLimiter, require('./CookieManager').MagicLinkLogin);

// User goes to site, enters email, and posts request with email to see if they can get a magic link
app.post('/register', createAccountLimiter, require('./CookieManager').TryRegister);

// User queries this on page load to get their info and load the authenticated screen(s)
app.get('/getMyInfo', (req, res) => {
    if (req.user) {
        // TODO: query from DB or something for more detailed info
        res.send(req.user);
    } else {
        return res.status(403).end();
    }
});

app.get('*', (req, res) => {
    res.redirect('/');
    res.end();
});

app.listen(PORT, () => console.log(`API server listening on port ${PORT}!`));
