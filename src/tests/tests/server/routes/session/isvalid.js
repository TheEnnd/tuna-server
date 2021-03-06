const 
    RouteTester = require(_$t+'helpers/routeTester'),
    mocha = require(_$t+'helpers/testbase')

mocha('route/session/isvalid', async(ctx)=>{
    
    it('route/session/isvalid::happy    gets a user session', async () => {
        
        let actualAuthTokenId,
            actualProfileId,
            route = require(_$+'routes/session'),
            routeTester = await new RouteTester(route)

        routeTester.authenticate()
        routeTester.req.query.token = 1234

        ctx.inject.object(_$+'logic/authToken', {
            getById (authTokenId){ 
                actualAuthTokenId = authTokenId
                return { id : authTokenId, profileId: 5678 } 
            }
        })

        ctx.inject.object(_$+'logic/profiles', {
            // song hash will also be checked
            songsHashValid (){ 
                return true
            },            
            getById (profileId){ 
                actualProfileId = profileId
                return { } // return a profile
            }
        })

        await routeTester.get('/v1/session/isvalid')

        ctx.assert.equal(actualAuthTokenId, 1234 )
        ctx.assert.equal(actualProfileId, 5678 )
        ctx.assert.true(routeTester.res.content.payload.isValid)
    })




    it('route/session/isvalid::unhappy    token does not exist', async () => {
        
        let tokenLookup = false,
            profileLookup = false,
            route = require(_$+'routes/session'),
            routeTester = await new RouteTester(route)

        routeTester.authenticate()
        routeTester.req.query.token = 1234
        
        ctx.inject.object(_$+'logic/authToken', {
            // this must return null to simulate in valid token
            getById (){ 
                tokenLookup = true
                return null
            }
        })
        
        ctx.inject.object(_$+'logic/profiles', {
            getById (){ 
                profileLookup = true
                return null
            }
        })

        await routeTester.get('/v1/session/isvalid')

        ctx.assert.true(tokenLookup)
        ctx.assert.false(profileLookup)
        ctx.assert.false(routeTester.res.content.payload.isValid)
    })

    


    it('route/session/isvalid::unhappy    user does not exist', async () => {
        
        let tokenLookup = false,
            profileLookup = false,
            route = require(_$+'routes/session'),
            routeTester = await new RouteTester(route)

        routeTester.authenticate()
        routeTester.req.query.token = 1234

        // this must return null to simulate in valid token
        ctx.inject.object(_$+'logic/authToken', {
            getById (){ 
                tokenLookup = true
                return {}
            }
        })

        // must return null to simulate invalid profile
        ctx.inject.object(_$+'logic/profiles', {
            getById (){ 
                profileLookup = true
                return null
            }
        })

        await routeTester.get('/v1/session/isvalid')

        ctx.assert.true(tokenLookup)
        ctx.assert.true(profileLookup)
        ctx.assert.false(routeTester.res.content.payload.isValid)
    })

})

