/**
 * log utility
 */
var util = require('util');

function Logger(config) {
  this._config = config || {
    level: 'debug',
    line: true,
    stack: true
  };
  this.config(this._config);
};

Logger.prototype.config = function (config) {

  this._config = config;

  this.debug = this.log.bind(this, 'debug', console.log);
  this.info = this.log.bind(this, 'info', console.info);
  this.warn = this.log.bind(this, 'warn', console.warn);
  this.error = this.log.bind(this, 'error', console.error);
  this.fatal = this.log.bind(this, 'fatal', console.error);

  if (this._config.level === 'info')
    this.debug = none;
  else if (this._config.level === 'warn')
    this.debug = this.info = none;
  else if (this._config.level === 'error')
    this.debug = this.info = this.warn = none;
  else if (this._config.level === 'fatal')
    this.debug = this.info = this.warn = this.error = none;
  else if (this._config.level === 'none')
    this.debug = this.info = this.warn = this.error = this.fatal = none;

};

Logger.prototype.log = function(level, print) {
  print = print || console.log;

  params = Array.prototype.slice.call(arguments, 2);

  for (var i = 0; i < params.length; i++) {

    if (params

      [i] instanceof Error) {
      var err = params[i];
      if (err.stack && this._config.stack) {
        params[i] = err.stack;
      } else {
        params[i] = err.message;
      }
    } else if (typeof params[i] == 'object') {
      params[i] = util.inspect(params[i]);
    }
  }

  var msg  = params.join(' ');

  var date = new Date();
  var dateformat = fillzero(date.getFullYear()   , 4) + '-'
            +fillzero(date.getMonth()  , 2) + '-'
            +fillzero(date.getDate()   , 2) + ' '
            +fillzero(date.getHours()  , 2) + ':'
            +fillzero(date.getMinutes(), 2) + ':'
            +fillzero(date.getSeconds(), 2);


  // line info
  var linemsg = null;
  if (this._config.line) {
    var stack = new Error().stack;
    var lines = stack.split('\n');
    if (lines[3]) {
      var line = lines[3];
      var idx = line.lastIndexOf('/script/');
      if (idx < 0) {
        idx = line.lastIndexOf('/');
      }
      if (idx >= 0) {
        linemsg = line.substring(idx);
        if (linemsg.charAt(linemsg.length-1) != ')')
          linemsg = ' (' + linemsg + ')';
        else
          linemsg = ' (' + linemsg;
      }
    }
  }
  try {
    if (linemsg)
      print(dateformat + ' ['+level+'] ' + msg + linemsg);
    else
      print(dateformat + ' ['+level+'] ' + msg);
  } catch (e) {
  }
};

var fillzero = function fillzero(num, size) {
  var str = String(num);
  while (str.length < size)
    str = '0' + str;
  return str;
};
var none = function none() {};


module.exports = new Logger();
