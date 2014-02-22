var express = require('express');
var fs = require('fs');
var path = require('path');
// var passport = require('passport');
// var util = require('./util');
var log = require('./log');

var app = express();
var port = process.env.PORT || 8000;

// read config file
var confdir = path.join(__dirname,'../config', (process.env.ENV || 'local') + '.json');
var config = require('./config');
config.read(confdir);
// log level
log.config(config.logging);
// get version
try {
  config.version = fs.readFileSync('./version', { encoding: 'utf8' }).replace(/(\r\n|\n|\r)/gm, '');
  console.log('version', config.version);
} catch (e) {
  console.log('version none');
}

// Basic site info
app.set('config', config);
app.set('env', config.env);
app.set('title', 'Wityu');
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
app.listen(port);
console.log('------- server -------');
console.log('environment: ' + config.env);
console.log('server starts listening to port ' + port + ' ...');
console.log('press Ctrl+C to stop');
