var qs = require('querystring');
var config = require('../config');
var log = require('../log');

var request = require('superagent');
var fs = require('fs');

var api_config = config.connect_api;

var credentials = {
  site: 'https://connect.gettyimages.com/oauth2/token',
  callback_url: config.baseurl+'/search',
  ClientId: process.env.GETTY_CLIENTID || api_config.ClientId,
  ClientSecret: process.env.GETTY_CLIENTSECRET || api_config.ClientSecret,
  UserName: process.env.GETTY_USERNAME || api_config.UserName,
  UserPassword: process.env.GETTY_USERPASSWORD || api_config.UserPassword
};

var clientCache = function(res, minutes) {
  res.removeHeader('Pragma');
  res.set('Cache-Control','max-age='+minutes*60);
  res.set('Expires', new Date(Date.now()+minutes*60000));
};

// redirect for mobile
function isCallerMobile(req){
  var ua = req.headers['user-agent'].toLowerCase(),
    isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4));
  return !!isMobile;
}

exports.register = function(app) {

  app.get('/', function(req, res) {
    // check if mobile, redirect to mobile site
    var isMobile = isCallerMobile(req);
    if(isMobile){
      return res.redirect('/mobile');
    }else if(!req.cookies.access_token){
      log.info('No token, will request token');
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
          var expire_9by10 = (9*token_json.expires_in/10);
          res.cookie('access_token', token_json.access_token , {maxAge: parseInt(expire_9by10*1000)});
          res.cookie('refresh_token', token_json.refresh_token , {maxAge: parseInt(expire_9by10*1000)});
          res.render('index');
        }else{
          return res.redirect('/gettoken');
        }
      });
    } else {
      res.render('index');
    }
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
          var expire_9by10 = (9*token_json.expires_in/10);
          res.cookie('access_token', token_json.access_token , {maxAge: parseInt(expire_9by10*1000)});
          res.cookie('refresh_token', token_json.refresh_token , {maxAge: parseInt(expire_9by10*1000)});
          res.redirect(req.query.redirect ||'/');
        }else{
          res.send(response.text);
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
      var paramsStr = qs.stringify(req.query);
      return res.redirect('/gettoken?redirect=/search?'+paramsStr);
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
          var body = response.body;
          var header = response.body.ResponseHeader;
          if(header.Status!="error"){
            res.json(body);
          }else{
            var errorList = header.StatusList;
            for(var i=0, len = errorList.length; i<len;i++){
              log.error('code: '+ errorList[i].Code);
              log.error('message: '+errorList[i].Message);
            }
            res.redirect('/gettoken?redirect=/search?'+paramsStr);
          }
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

  app.get('/mobile', function(req,res){
    res.render('mobile');
  });

}
