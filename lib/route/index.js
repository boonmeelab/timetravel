var fs = require('fs');
var path = require('path');

/**
 * Web Controllers
 * @returns {WebController}
 */
function WebController() {
  this.routes = [
    'default'
  ];
}


/**
 * register web controllers
 * @param app
 */
WebController.prototype.register = function(app) {
  console.info('register server routes', this.routes);
  this.routes.forEach(function(route) {
    require('./' + route + '.js').register(app);
  });
};

module.exports = new WebController();
