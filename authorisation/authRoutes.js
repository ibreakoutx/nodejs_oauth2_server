module.exports =  (router, expressApp, authRoutesMethods) => {

    function logReqHeaders(req,res,next) {
      console.log(req.headers);
      console.log(req.body);
      next();
    }
    //route for registering new users
    router.post('/registerUser', authRoutesMethods.registerUser)

    //route for allowing existing users to login
    router.post('/login', logReqHeaders, expressApp.oauth.grant(), authRoutesMethods.login)

    return router
}
