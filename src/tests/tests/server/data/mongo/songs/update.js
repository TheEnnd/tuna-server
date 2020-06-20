const 
    assert = require('madscience-node-assert'),
    inject = require(_$t+'helpers/inject'),
    mocha = require(_$t+'helpers/testbase')

mocha('songsData : update', async(testArgs)=>{

    it('happy path : updates song', async () => {

        // replace call to mongo
        let updatedRecord,
            updatedId

        inject.object(_$+'data/mongo/common', {
            update : (collection, id, record)=>{
                updatedId = id
                updatedRecord = record
            }
        })

        const mongo = require(_$+'data/mongo/songs')
        await mongo.update({ id : testArgs.mongoId, thing : 'stuff' })

        assert.equal(updatedId, testArgs.mongoId)
        assert.equal(updatedRecord.thing, 'stuff')
    })

})
