const 
    RouteTester = require(_$t+'helpers/routeTester'),
    mocha = require(_$t+'helpers/testbase')

mocha('route/sandbox/nextcloudAuthenticate', async(ctx)=>{
    
    it('route/sandbox/nextcloudAuthenticate::happy    route directs', async () => {
        
        // enable sandbox mode to allow sandbox route binding
        ctx.inject.object(_$+'helpers/settings', {
            musicSourceSandboxMode : true
        })

        const route = require(_$+'routes/sandbox'),
            routeTester = await new RouteTester(route)

        await routeTester.get('/v1/sandbox/nextcloudAuthenticate')

        ctx.assert.notNull(routeTester.res.redirected)
    })

})
