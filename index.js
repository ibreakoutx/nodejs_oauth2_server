//MARK: --- REQUIRE MODULES

const port = 3001

const mySqlConnection = require('./databaseHelpers/mySqlWrapper')
const accessTokenDBHelper = require('./databaseHelpers/accessTokensDBHelper')(mySqlConnection)
const userDBHelper = require('./databaseHelpers/userDBHelper')(mySqlConnection)
const oAuthModel = require('./authorisation/accessTokenModel')(userDBHelper, accessTokenDBHelper)
const oAuth2Server = require('node-oauth2-server')
var OAuthError = require('node-oauth2-server/lib/error');
const express = require('express')
const expressApp = express()
const logger = require('winston')
const morgan = require('morgan');
const path = require('path');
const cons = require('consolidate');
const swig = require('swig');

expressApp.use(morgan('dev'));

// view engine setup
expressApp.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
expressApp.set('view engine', 'html');
expressApp.engine('.html', cons.swig);

expressApp.use(express.static(path.join(__dirname, 'public')));

expressApp.oauth = oAuth2Server({
  model: oAuthModel,
  grants: ['password'],
  debug: true
})

const restrictedAreaRoutesMethods = require('./restrictedArea/restrictedAreaRoutesMethods.js')
const restrictedAreaRoutes = require('./restrictedArea/restrictedAreaRoutes.js')(express.Router(), expressApp, restrictedAreaRoutesMethods)
const authRoutesMethods = require('./authorisation/authRoutesMethods')(userDBHelper)
const authRoutes = require('./authorisation/authRoutes')(express.Router(), expressApp, authRoutesMethods)
const bodyParser = require('body-parser')

//MARK: --- REQUIRE MODULES

//MARK: --- INITIALISE MIDDLEWARE & ROUTES

/*
expressApp.use(function(req, res, next) {
var rawBody = '';
req.setEncoding('utf8');
req.on('data', function(chunk) { rawBody += chunk; });
req.on('end', function() {
  console.log("raw body = " + rawBody);
  next(); });
 });
*/

//set the bodyParser to parse the urlencoded post data
expressApp.use(bodyParser.urlencoded({ extended: true }))

//set the authRoutes for registration and & login requests
expressApp.use('/auth', authRoutes)

//set the restrictedAreaRoutes used to demo the accesiblity or routes that ar OAuth2 protected
expressApp.use('/restrictedArea', restrictedAreaRoutes)

expressApp.get('/login', (req,res) => {
  //render login form
  res.render("login.html");
  //res.json({response:"Login HTML for Get request"});
});

expressApp.use(function (err, req, res, next) {
  console.log("OAuth authorization error");
  //If oauth authorization error
  if (err instanceof OAuthError) {
    //logger.log('info', err); // pass only oauth errors to winston
    return res.redirect('/login');
  }
  next(err); // pass on to
});

//MARK: --- INITIALISE MIDDLEWARE & ROUTES
expressApp.use(expressApp.oauth.errorHandler()); // Send back oauth compliant response

//init the server
expressApp.listen(port, () => {

   console.log(`listening on port ${port}`)
})
