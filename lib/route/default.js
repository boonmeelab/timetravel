var qs = require('querystring');
var config = require('../config');
var log = require('../log');

var request = require('superagent');
var fs = require('fs');

var api_config = config.connect_api;

var credentials = {
  site: 'https://connect.gettyimages.com/oauth2/token',
  callback_url: 'http://localhost:8000/search',
  ClientId: api_config.ClientId,
  ClientSecret: api_config.ClientSecret,
  UserName: api_config.UserName,
  UserPassword: api_config.UserPassword
};

var clientCache = function(res, minutes) {
  res.removeHeader('Pragma');
  res.set('Cache-Control','max-age='+minutes*60);
  res.set('Expires', new Date(Date.now()+minutes*60000));
};

exports.register = function(app) {

  app.get('/', function(req, res) {
    if(!req.cookies.access_token){
      log.info('No token, will redirect to /gettoken');
      res.redirect('/gettoken');
    }
    res.render('index');
  });

  app.get('/gettoken', function(req, res){
    request.post(credentials.site)
      .send('client_id='+credentials.ClientId)
      .send('client_secret='+credentials.ClientSecret)
      .send('grant_type=password')
      .send('username='+credentials.UserName)
      .send('password='+credentials.UserPassword)
      .end(function(response){
        if(response.ok){
          var token_json = response.body;
          log.info('[--- Getting token ---]');
          log.info(token_json);
          res.cookie('access_token', token_json.access_token , {maxAge: parseInt(token_json.expires_in*60*1000)});
          res.cookie('refresh_token', token_json.refresh_token , {maxAge: parseInt(token_json.expires_in*60*1000)});
          res.redirect(req.query.redirect ||'/');
        }else{
          res.end(response.text);
        }
      });
  });
  // there is a renew token operation in gettyimages too.
  // just in case we need it.
  app.get('/renewtoken', function(req, res){

  });

  app.get('/search', function(req,res){
    var params = req.query;
    if(!req.cookies.access_token){
      log.info('No token, will redirect to /gettoken');
      var paramsStr = qs.stringify(req.params);
      res.redirect('/gettoken?redirect=/search?'+paramsStr);
    }
    var searchOptions = JSON.parse(
      fs.readFileSync(__dirname+'/../search_template/image_search_template.json')
      );

    // set start and end date
    var dateRange = searchOptions.SearchForImagesRequestBody.Query.DateCreatedRange;
    dateRange.StartDate = typeof params.startdate != "undefined" ? params.startdate : "";
    dateRange.EndDate = typeof params.enddate != "undefined" ? params.enddate : "";
    // set SearchPhrase
    searchOptions.SearchForImagesRequestBody.Query.SearchPhrase = params.query? params.query : "apple";
    // get all resultOptions
    var resultOptions = searchOptions.SearchForImagesRequestBody.ResultOptions;
    // set number of items per page
    resultOptions.ItemCount = typeof params.itemperpage != "undefined" ? params.itemperpage : 5;
    // set start page
    resultOptions.ItemStartNumber = typeof params.startpage != "undefined" ? params.startpage : 1;
    // set sort by
    // Default - order by DateCreated, Date-submitted, ImageId descending (From oldest)
    // MostRecent - order by DateSubmitted descending (From Newest)
    // MostPopular - order by relevancy as determined from data gathered from customer interactions on Getty Images websites
    // Trending - similar to MostPopular, but with the most recent images first
    // TSMostPopular
    // BestMatch
    // DateSubmitted
    resultOptions.EditorialSortOrder = typeof params.sortby != "undefined" ? params.sortby : "MostPopular";
    // add access_token to query
    searchOptions.RequestHeader.Token = req.cookies.access_token;
    request.post('https://connect.gettyimages.com/v2/search/SearchForImages')
      .send(searchOptions)
      .end(function(response){
        if(response.ok){
          res.json(response.body);
        }else{
          res.end(response.text);
        }
      });
  });

  // Proxy steaming photo on server to avoid cross-origin restriction in WebGL texture
  app.get('/photo/:service/*', function(req, res) {
    var service = req.params.service;
    var url = req.params[0];
    var req;
    if (service === 'getty') {
      // Sample URL
      // "http://cache3.asset-cache.net/xr/50655076.jpg?v=1&c=IWSAsset&k=3&d=B5384F3B2A5A9842F8F44C8B571C48C4161E1F267B7C6B1A6B0BE11B41AB15E0&b=Qw=="
      clientCache(res, 10);
      request
      .get(url)
      .on('error', function(err) {
        log.error('error', err);
        res.send(500);
      })
      .pipe(res);
    } else {
      res.send(400);
    }
  });

}
