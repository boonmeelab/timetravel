var express = require('express');
var fs = require('fs');
var path = require('path');
// var passport = require('passport');
// var util = require('./util');
var log = require('./log');

var app = express();

// read config file
var confdir = path.join(__dirname,'../config', (process.env.ENV || 'local') + '.json');
var config = require('./config');
config.read(confdir);
// log level
log.config(config.logging);
// get version
try {
  config.version = fs.readFileSync('./version', { encoding: 'utf8' }).replace(/(\r\n|\n|\r)/gm, '');
  log.info('version', config.version);
} catch (e) {
  log.info('version none');
}

// set compatible mode for ie
app.use(function (req, res, next) {
      var url = req.url,
         ua = req.headers['user-agent'];
      if (ua && ua.indexOf('MSIE') > -1 && /html?($|\?|#)/.test(url)) {
         res.setHeader('X-UA-Compatible', 'IE=9; IE=8; IE=7');
      }
      next();
   });


// Basic site info
app.set('config', config);
app.set('env', config.env);
app.set('title', 'TimeTravel');
app.set('baseurl', config.baseurl);
app.enable('case sensitive routing');

// Render engine
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');
// app.set('view cache', config.env==='product');
app.set('views', __dirname + '/../src/jade');

// Parser
app.use(express.compress());
app.use(express.cookieParser('mysecret'));
app.use(express.session());
app.use(express.bodyParser());
app.use(express.methodOverride());

// Static files
app.use(express.favicon(__dirname + '/../public/images/favicon.ico'));
app.use('/public', express.staticCache());
app.use('/public', express.static(__dirname + '/../public', { maxAge: 7*86400000 }));

// register web handler
require('./route').register(app);

app.use(function(err, req, res, next) {
    if (!err) return next();
    log.error(err);
    res.send(err, 500);
});

// something weird happens, kill process
process.on('uncaughtException', function (err) {
  log.error('[uncaughtException]');
  log.error(err);
  // process.exit(1);
})

// Start server
var port = process.env.PORT || config.port || 8000;
app.listen(port);
log.info('------- server -------');
log.info('environment: ' + config.env);
log.info('server starts listening to port ' + port + ' ...');
log.info('press Ctrl+C to stop');
