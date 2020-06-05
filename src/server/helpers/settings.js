const 
    customEnv = require('custom-env'),          // 4ms
    process = require('process'),               // 1ms
    constants = require(_$+'types/constants'),
    settings = {
        // must match a SOURCE_* value from /types/constants
        musicSource : constants.SOURCES_DROPBOX,

        // base url of your site. Default is for dev environments, you NEED to change this when going live
        siteUrl : 'http://localhost:48004',

        mongoConnectionString : 'mongodb://admin:secret@127.0.0.1:27017',
        mongoDBName : 'tuna',
        mongoCollectionPrefix : '',

        // port the nodeJS app should listen on
        port : 48004,

        bruteForceThreshold : 20,
        bruteForcePeriod : 15,
        bruteForceCooldown : 10,
        passwordLength : 12,
        daemonInterval : '* * * * *',
        maxSessionsPerUser : 3,
        
        // this should always be true on production. Disable on dev systems for faster app start
        enableCrossProcessScripts : true,

        // true if minified file names should be used
        useMinifiedAssets : true,
        fromEmail : 'no-reply@example.com',
        // refactor out
        indexDelay : null,
        flushCacheOnStart : true,
        autogeneratedPasswordFile : './.autogeneratedPassword',
        
        // must always be lowecased, and trimmed
        masterUsername : 'master',
        
        // folder tuna writes important values like auto generated passwords to. In a docker environment should always
        // be volume mounted
        dataFolder :'./data',
        logPath :'./data/logs',

        // if true loads js from bundle file. If false, main.js will load first
        // which will cascade load all other files.
        isJSBundled : true,
        // number of songs per bulk insert into database 
        importInsertBlockSize : 100,
        debounceInterval : 500, // millseconds per import update socket push



        // if true, and a sandbox importer is available, will fallback to sandbox importer. This is for dev only
        // and will bypass true oauth in importer to use sandbox keys
        musicSourceSandboxMode : false,


        dropboxAppId : null,
        dropboxAppSecret : null,
        // if set, this token will always be used for "dev" oauth flow on dropbox. Use this to test workflow around dropbox.
        // Token can be copied from the dropbox API management page - dropbox are really developer-friendly this way.
        dropboxDevOauthToken : null,


        lastFmApiKey : null,
        lastFmApiSecret : null,
        // if set, this access token will always be returned when requesting a scrobble key from last.fm
        lastFmDevAuthKey : null,
        logLastFmResponses : false,


        
        nextCloudClientId : null,
        nextCloudSecret : null,

        // Unlike lastfm and dropbox, nextcloud is an absolute secops paranoia-induced nightmare to code up against - you cannot
        // get dev tokens, all tokens expire regardlwess, and worst of all refresh tokens ALSO expire - if you fail to save 
        // a refreh token your integration will break and you will have to start the process from scratch. 
        // To get tokens : 
        // 1) use a browser to start an authorize flow on your nextcloud server, set redirect URL to a safe bogus url
        // 2) Copy the auth code from the url in your browser, immediately POST that back to nextcloud to swap code for tokens. 
        // 3) Copy the access + refresh tokens returned, paste them in here. 
        // 4) Start your "fake" nextcloud oauth flow in tuna, it will consume the tokens listed here.
        // 5) Tokens will then be managed and refreshed automatically by tuna, you can read files from nextcloud forever 
        //    or until the keys go out-of-sycc with nextcloud, at which point you'll need to repeat this process from step 1.
        // NOTE : once refreshed, you CANNOT use these tokens again, as they will be out-of-sync with nextcloud.
        nextCloudDevAccessToken : null,
        nextCloudDevRefreshToken : null,

        nextCloudHost : null,

        // these are standard Nextcloud oauth urls, you don't need to change them unless you know what you're doing
        nextCloudAuthorizeUrl : '/index.php/apps/oauth2/authorize',
        nextCloudTokenExchangeUrl : '/index.php/apps/oauth2/api/v1/token',
        nextCloudCodeCatchUrl : '/v1/oauth/nextcloud',


        smtpUser : null,
        smtpPassword : null,
        forceEmailVerification : false,
        emailVerificationDeadlineHours : 12,
        
        // recommended way to send emails
        sendgridKey : null,

        // for debug only
        useSelfSignedSSL : false
    }

// apply custom .env settings - place an ".env" file in app root folder (where index.js/package.json) is
customEnv.env() // 5ms

// override defaults with env variables
for (let property in settings){
    if (!process.env[property])
        continue

    settings[property] = process.env[property]

    // parse env bools
    if (settings[property] === 'true')
        settings[property] = true

    if (settings[property] === 'false')
        settings[property] = false
    
    // parse env integers
    if (Number.isInteger(settings[property]))
        settings[property] = parseInt(settings[property])
}

module.exports = settings