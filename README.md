# Tuna

Tuna lets you stream your music to any modern browser. It is open source and self-hosted, and uses popular storage platforms like Dropbox and NextCloud to host your files.

## Requirements

- A modern HTML5 browser like FireFox, Chrome etc. (iOS is not supported as iOS does not natively support MP3)
- An x64 Linux server with Docker (if you want to roll your own configuration you need NodeJS 10+ and MongoDB 3.x or higher)
- MP3, MP4 or Ogg Vorbis music files with valid ID3 tags for at least song, album and artist.
- A Dropbox or NextCloud account with enough space for your music files.  

## Setup

### App ID + secret

Tuna uses Oauth to access to your music on your storage platform. Both Dropbox and Nextcloud allow you to set up apps which can grant access, and you'll need to set one up first. Fortunately the process is relatively straightforward. 

- [Dropbox](https://www.dropbox.com/developers/apps/create)

#### NextCloud

When setting up your Oauth app in Nextcloud, you'll need to specify a callback URL. Use

    https://yourtunaurl.com/v1/oauth/nextcloud

- [Nextcloud](later)

### Server 

The following docker-compose script will set up everything you need to run a Tuna server.

    version: "2"
    services:
        mongo:
            image: mongo:latest
            container_name: tuna-mongo
            restart: unless-stopped
            environment:
                MONGO_INITDB_ROOT_USERNAME: admin
                MONGO_INITDB_ROOT_PASSWORD: yourPasswordHere
            volumes:
                - ./mongo/data:/data/db:rw        
                - ./mongo/logs:/var/logs:rw        
        tuna:
            image: shukriadams/tuna-server:latest
            container_name: tuna-server
            restart: unless-stopped
            depends_on:
                - mongo
            volumes:
                - ./tuna:/usr/tuna/data/:rw
            environment:
                mongoConnectionString: "mongodb://admin:yourPasswordHere@mongo:27017"
                siteUrl: "https://yourtunaurl.com"

                # Allowed values are : nextcloud|dropbox
                musicSource : nextcloud 

                # if using dropbox, add your dropbox app id & secret here
                dropboxAppId: .........
                dropboxAppSecret: .........

                # if using nexcloud, add your nextcloud app host, id & secret here
                nextCloudHost: ........
                nextCloudClientId : .........
                nextCloudSecret: .........

            ports:
            - "48004:48004"

Change "yourPasswordHere" to something better. Note that this setup isn't ideal for security as it passwords are stored in clear text, and you're connecting to Mongo as root, but it's "good enough" to get started.

Before starting you should create the local tuna folder and set its permission

    mkdir tuna
    chown 1000 -R tuna

### Indexing music

Tuna needs to know what music you've got in your Dropbox or NextCloud drive. Download the Tuna Indexer app, install and point it to your Dropbox or NextCloud folder and let it do its thing.

### Logging in 

Tuna is a single-user system. It will automatically create a user for you. To retrieve your password, check the text file at /tuna/.autogeneratedPassword. Once you log in, it is strongly recommended that you change your password.

If you lose your password you can set a new one from the command line with 

    docker exec -it tuna-server "cd /usr/tuna/scripts && node set --password YOURPASSWORD"

When you log in, you'll be prompted to give access to either Dropbox or Nextcloud, follow the on-screen instructions. 

## Advanced 

### Nginx and Socket.io

This app makes entensive use of websockets, if you're hosting your app behind Nginx, you might have problems with this. Try adding the following to your Nginx config

    location / {
        proxy_pass http://localhost:YOUR-PORT-HERE; # add your own app port hehre
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

## License

Tuna is available under the GNU General Public License v3.0. See LICENSE for more 

## Developement

Please see /docs/development.md
