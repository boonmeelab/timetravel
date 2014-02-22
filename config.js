/**
 * global configuration file
 */
var fs = require('fs');
var path = require('path');

function Configuration() {}

/**
 * read json file from path
 * @param path
 */
Configuration.prototype.read = function(filename) {
  console.log('loading configuration from', filename);
  var data = fs.readFileSync(filename, 'utf8');
  // parse content
  var json = JSON.parse(data);
  for (var n in json) {
    // copy property to the instance
    this[n] = json[n];
  }
};

module.exports = new Configuration();
