const 
    RouteTester = require(_$t+'helpers/routeTester'),
    settings = require(_$+'helpers/settings'),
    mocha = require(_$t+'helpers/testbase')

mocha('route/session/post', async(ctx)=>{
    
    it('route/session/post::happy    logs user in, returns user content', async () => {
        
        let actualUsername,
            actualPassword,
            route = require(_$+'routes/session'),
            routeTester = await new RouteTester(route)

        routeTester.req.body.password = 'mypass'
        routeTester.req.body.browserUID = 'myid'

        // disable brute force check
        ctx.inject.object(_$+'helpers/bruteForce', {
            process (){ }, // do nothing
            clear (){ } // do nothing
        }) 
        
        ctx.inject.object(_$+'helpers/content', {
            build (profileId, authTokenId){
                return { someUserContent : '............', profileId, authTokenId } 
            }
        })

        ctx.inject.object(_$+'logic/profiles', {
            authenticate (username, password){
                actualUsername = username
                actualPassword = password
                // this id will be passed along the chain of functions and eventually end up in the content returned
                return 'a-profile-id'
            }
        })

        ctx.inject.object(_$+'logic/authToken', {
            create (profileId){            
                return { profileId, id : 'myAuthtokenId'}
            }
        })

        await routeTester.post('/v1/session')

        ctx.assert.equal(actualUsername, settings.masterUsername)
        ctx.assert.equal(actualPassword, 'mypass')
        ctx.assert.null(routeTester.res.content.code)
        ctx.assert.equal(routeTester.res.content.payload.profileId, 'a-profile-id')
    })
    
})
