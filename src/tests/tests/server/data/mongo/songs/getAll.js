const mocha = require(_$t+'helpers/testbase')

mocha('mongo/songs/getAll', async(ctx)=>{

    it('mongo/songs/getAll::happy    gets all songs for profile', async () => {

        // replace call to mongo
        ctx.inject.object(_$+'data/mongo/common', {
            find (collection, query){
                return [{query, _id : 'some-id'}]
            }
        })
        
        let mongo = require(_$+'data/mongo/songs'),
            records = await mongo.getAll('dafda')

        ctx.assert.equal(records[0].id, 'some-id')
    })

})
