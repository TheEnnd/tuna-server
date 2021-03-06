

module.exports = {
 
    start : ()=>{
        
        let
            CronJob = require('cron').CronJob,
            profileLogic = require(_$+'logic/profiles'),
            settings = require(_$+'helpers/settings'),
            logger = require('winston-wrapper').instance(settings.logPath),
            sourceProvider = require(_$+'helpers/sourceProvider'),
            sourceCommon = require(_$+'helpers/sourceCommon'),
            busy = false

        new CronJob(settings.daemonInterval, async ()=>{

            if (busy)
                return

            busy = true
 
            try {

                // do song re-import
                const profiles = await profileLogic.getAll()

                for (let profile of profiles){

                    if (!profile.sources || !profile.sources[settings.musicSource])
                        continue

                    const source = sourceProvider.get()

                    if (await sourceCommon.isRemoteNewer(profile.id, source)){

                        const Importer = sourceProvider.getImporter(),
                            importer = new Importer(profile.id)

                        try {

                            // warning ! we're awaiting this, so profiles are processed in series. On multiuser systems
                            // this obviously doesn't scale, but don't want to slam the remote with all users simultaneously either
                            // find some form of staggered parallel call
                            await importer.start()

                            logger.info.info(`songs autoimported for user ${profile.identifier}`)

                        } catch (ex){

                            logger.error.error(ex)

                        }
                    }
        
                }

            } catch (ex) {

                logger.error.error(ex)

            } finally {

                busy = false

            }
        }, 
        null, 
        true, 
        null, 
        null, 
        false /* runonitit */ )

    }
}