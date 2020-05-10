const 
    constants = require(_$+'types/constants'),
    Exception = require(_$+'types/exception'),
    lastFmHelper = require(_$+'helpers/lastfm'),
    songsCache = require(_$+'cache/songs'),
    JsonHelper = require(_$+'helpers/json')

module.exports = {

    /**
     *
     */
    async createMany(songs){
        if (!songs || !songs.length)
            throw new Exception({ 
                code : constants.ERROR_INVALID_ARGUMENT, 
                log : 'Songs required' 
            });

        return await songsCache.createMany(songs);
    },


    /**
     * Streams a song from a source like nextcloud
     */
    async streamSong(profileId, mediaPath, res){
        let sourceProvider = require(_$+'helpers/sourceProvider'),
            source = sourceProvider.get();

        await source.streamMedia(profileId, mediaPath, res);
    },


    /**
     *
     */
    async update(song){
        return await songsCache.update(song);
    },


    /**
     *
     */
    async deleteAll(profileId){
        return await songsCache.deleteAll(profileId);
    },


    /**
     * song : song object to delete.
     */
    async delete(song){
        return await songsCache.delete(song);
    },


    /**
     * Gets all user songs, unfiltered
     */
    async getAll(profileId){
        return await songsCache.getAll(profileId);
    },

    
    /**
     *
     */
    async nowPlaying(profileId, songId){
        let profileLogic = require(_$+'logic/profiles'),
            profile = await profileLogic.getById(profileId);

        if (!profile)
            throw new Exception({ code: constants.ERROR_INVALID_USER_OR_SESSION });

        let song = await this._getById(songId, profileId);

        if (!song)
            throw new Exception({ code: constants.ERROR_INVALID_SONG });

        return await lastFmHelper.nowPlaying(profile, song);
    },


    /**
     * Move to lastfm helper
     */
    async scrobble(profileId, songId, songDuration){
        let song = await this._getById(songId, profileId);

        if (!song)
            throw { code: 2, message : 'Invalid song'};

        let cacheKey = profileId + '_nowPlaying',
            nowPlaying = await cache.get(cacheKey);

        if (!nowPlaying)
            throw new Exception({ 
                log : 'Expected playSession was not retrieved',
                inner : {
                    profileId,
                    songId
                }
            });

        if (nowPlaying.songId !== songId)
            throw new Exception({ 
                log : 'playSession contains a different song',
                inner : {
                    playSession :nowPlaying,
                    songId
                }
            });        

        // duration logic not working yet, disabling for now
        let halfWayPoint = /*songDuration ? songDuration / 2 : song.duration ? (song.duration / 2) :*/ 30, // 30 bein lastfm minimum scrobble time
            diff = new Date().getTime() - nowPlaying.started,
            seconds = diff / 1000;

        if (seconds < halfWayPoint)
            throw new Exception({ 
                log : 'pre-halftime scrobble attempt',
                inner : {
                    playSession : nowPlaying,
                    songId
                }
            });

        let profileLogic = require(_$+'logic/profiles'),
            profile = await profileLogic.getById(profileId);

        if (!profile)
            throw new Exception({ code : constants.ERROR_INVALID_USER_OR_SESSION });

        if (!profile.scrobbleToken)
            throw new Exception({ log : 'profile not scrobbling'});

        let unixStart = Math.round(+nowPlaying.started / 1000);
        await lastFmHelper.scrobble(profile, song, unixStart);
        await cache.remove( cacheKey );
    },


    /**
     * Why are we fething song this long-ass way?
     */
    async  _getById(songId, profileId){
        let songs = await songsCache.getAll(profileId);
        if (!songs.length)
            return null;

        let song = songs.find(function(element){
            return element.id === songId;
        });

        return song;
    },


    /**
     *
     */
    async toggleLove(songId, profileId){
        let song = await this._getById(songId, profileId);
        if (!song)
            throw new Exception({ code : constants.ERROR_INVALID_SONG });

        song.isLoved = !song.isLoved;
        await songsCache.update(song);
        return song;
    },


    /**
     *
     */
    async persistSong(songRawJson, profileId){
        let songJson = JsonHelper.parse(songRawJson);

        // we check ownership implicitly by fetching song id in scope of current profile
        let song = await this._getById(songJson.id, profileId);
        if (!song)
           throw new Exception({ code : constants.ERROR_INVALID_SONG });

        for (let property in song)
            song[property] = songJson[property];

        await songsCache.update(song);
        return song;
    },


    /**
     *
     */
    async getSongUrl(songId, profileId, authTokenId){
        // dont make member, causes cross-import tangle
        const 
            sourceProvider = require(_$+'helpers/sourceProvider'),
            profileLogic = require(_$+'logic/profiles'),
            profile = await profileLogic.getById(profileId),
            song = await this._getById(songId, profileId),
            source = sourceProvider.get(),
            url = await source.getFileLink(profile.sources, song.path, authTokenId);

        return url;
    }
};