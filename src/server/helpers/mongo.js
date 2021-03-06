module.exports = {
    
    async getCollection(name){
        const 
            MongoClient = require('mongodb').MongoClient,
            settings = require(_$+'helpers/settings'),
            constants = require(_$+'types/constants'),
            Exception = require(_$+'types/exception')

        return new Promise(async (resolve, reject)=>{
            try {
                MongoClient.connect(settings.mongoConnectionString, { useUnifiedTopology: true }, (err, client)=>{
                    if (err)
                        return reject(new Exception({ code : constants.ERROR_DATABASE_NOT_AVAILABLE, inner : err }))

                    const db = client.db(settings.mongoDBName),
                        collection = db.collection(settings.mongoCollectionPrefix + name)
    
                    resolve({ collection , done : ()=>{
                        client.close()
                    }})
    
                })

            } catch (ex) {
    
                reject(ex)
            }
        })
    },
    
    async initialize(){
        const 
            MongoClient = require('mongodb').MongoClient,
            settings = require(_$+'helpers/settings'),
            constants = require(_$+'types/constants'),
            Exception = require(_$+'types/exception')

        return new Promise(async (resolve, reject)=>{
            try {
                MongoClient.connect(settings.mongoConnectionString, { useUnifiedTopology: true }, async (err, client)=>{
                    if (err)
                        return reject(new Exception({ code : constants.ERROR_DATABASE_NOT_AVAILABLE, inner : err }))
    
                    const db = client.db(settings.mongoDBName)

                    await db.collection(`${settings.mongoCollectionPrefix}profiles`).createIndex( { 'identifier': 1  }, { unique: true, name : `${settings.mongoCollectionPrefix}profiles_unique` })
                    await db.collection(`${settings.mongoCollectionPrefix}songs`).createIndex( { 'path': 1 }, { unique: true, name : `${settings.mongoCollectionPrefix}songs_unique` })
                    await db.collection(`${settings.mongoCollectionPrefix}authTokens`).createIndex( { 'context': 1, 'profileId' : 1  }, { unique: true, name : `${settings.mongoCollectionPrefix}authTokens_unique` })
                    
                    client.close()

                    resolve()
                })

            } catch (ex) {
    
                reject(ex)
            }
        })
    }
}