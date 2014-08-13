
// BEGIN - WebGLTimeTravel
var WebGLTimeTravel = function() {
  console.info('Normal mode');

  $('html').addClass('webgl');

  this.FADEOUT_DISTANCE = 30;
  this.INFOBOX_RANGE_CENTER_POSITION = 10;
  this.INFOBOX_RANGE_DISTANCE = 76;
  this.STAGE_TOP = 30;

  this.speed = 0;
  this.acc = 0.97;
  this.dist = 0;

  this.keyboard = new THREEx.KeyboardState();
  this.mouse = { x: 0, y: 0 };

  // this.camera
  // this.scene
  // this.renderer
  // this.projector
  // this.tween
  // this.objectList

  // this.current_object_index
  // this._intervalCurrentIndex

  this.fadeout_offset = this.FADEOUT_DISTANCE;
  this.infobox_offset = this.INFOBOX_RANGE_DISTANCE/2;
};

WebGLTimeTravel.prototype.addOnTimeline = function addOnTimeline(obj, d1, d2) {
  var self = this;
  self.objectList.add(obj);
  self.dist -= d1 || 60;
  obj.position.z = this.dist;
  self.dist -= d2 || 60;
}
WebGLTimeTravel.prototype.resetTimeline = function resetTimeline() {
  var self = this;
  if (self.objectList) {
    self.objectList.children.forEach(function(obj) {
      self.deallocMesh(obj);
      self.scene.remove(obj);
    });
    self.scene.remove(self.objectList);
  }
  // create new object group
  self.objectList = new THREE.Object3D();
  self.scene.add(self.objectList);
  self.dist = 90;
  self.current_object_index = 0;
}

WebGLTimeTravel.prototype.deallocMesh = function deallocMesh(obj) {
  if (obj instanceof THREE.Mesh) {
    obj.texture && obj.texture.dispose();
    obj.material && obj.material.dispose();
    obj.geometry && obj.geometry.dispose();
    delete obj.img;
  } else if (obj.children) {
    obj.children.forEach(function(o) {
      deallocMesh(o);
    });
  }
}

WebGLTimeTravel.prototype.init = function init() {
  var self = this;
  window.addEventListener( 'resize', function() { self.onWindowResize.apply(self, arguments); }, false );

  if (window.WebGLRenderingContext)
    self.renderer = new THREE.WebGLRenderer( { alpha: true } );
  else
    self.renderer = new THREE.CanvasRenderer( { alpha: true } );

  // renderer.setClearColor( 0xeeeeee, 1);
  self.renderer.setClearColor( 0x000000, 0);
  self.renderer.setSize( window.innerWidth, window.innerHeight - self.STAGE_TOP );
  document.getElementById( 'stage' ).appendChild( self.renderer.domElement );

  self.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 3000 );
  self.camera.position.set(0, 80, 150);
  self.camera.lookAt(new THREE.Vector3( 0, 0, 0));

  self.scene = new THREE.Scene();

  self.scene.add(self.createPlane({ position: {z: /*-1480*/ 500}, rotation: {x:Math.PI/2}, color: 0xffffff, opacity: 1}));
  self.scene.add(self.createPlane({ width: 110, position: {z: 500, y: -2}, rotation: {x:Math.PI/2}, color: 0xeeeeee, opacity: 1}));
  self.scene.add(self.createPlane({ width: 120, position: {z: 500, y: -4}, rotation: {x:Math.PI/2}, color: 0xdddddd, opacity: 1}));
  self.scene.add(self.createPlane({ width: 135, position: {z: 500, y: -6}, rotation: {x:Math.PI/2}, color: 0xcccccc, opacity: 1}));
  // scene.add(createPlane({ width: 150, height: 20, position: {y:-10, z: 20 }, color: 0x318ce7}));

  // initialize object to perform world/screen calculations
  self.projector = new THREE.Projector();

  // when the mouse moves, call the given function
  document.addEventListener( 'mousemove', function() { self.onDocumentMouseMove.apply(self, arguments); }, false );

  // Start
  self.animate();
}

WebGLTimeTravel.prototype.onDocumentMouseMove = function onDocumentMouseMove( event )
{
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  // event.preventDefault();

  // update sprite position
  // updateInfoBox({ x: event.clientX, y: event.clientY });
  // sprite1.position.set( event.clientX, event.clientY - 20, 0 );

  // update the mouse variable
  this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
WebGLTimeTravel.prototype.onWindowResize = function onWindowResize() {
  var self = this;
  self.camera.aspect = window.innerWidth / window.innerHeight;
  self.camera.updateProjectionMatrix();

  self.renderer.setSize( window.innerWidth, window.innerHeight - this.STAGE_TOP);
}

WebGLTimeTravel.prototype.createCube = function createCube() {
  var self = this;
  var geometry = new THREE.BoxGeometry( 200, 200, 200 );

  var texture = THREE.ImageUtils.loadTexture( '/public/images/crate.gif' );
  texture.anisotropy = self.renderer.getMaxAnisotropy();

  var material = new THREE.MeshBasicMaterial( { map: texture } );

  mesh = new THREE.Mesh( geometry, material );
  return mesh;
}

WebGLTimeTravel.prototype.createPlane = function createPlane(params) {
  params = params || {};
  params.position = params.position || {};
  params.rotation = params.rotation || {};

  var geometry = new THREE.PlaneGeometry( params.width || 100, params.height || 3000 );
  var material = new THREE.MeshBasicMaterial( {color: params.color || 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: params.opacity || 1} );
  mesh = new THREE.Mesh( geometry, material );

  mesh.position.x = params.position.x || 0;
  mesh.position.y = params.position.y || 0;
  mesh.position.z = params.position.z || 0;

  mesh.rotation.x = params.rotation.x || 0;
  mesh.rotation.y = params.rotation.y || 0;
  mesh.rotation.z = params.rotation.z || 0;

  return mesh;
}

WebGLTimeTravel.prototype.createSprite = function createSprite(imgObj, params) {
  params = params || {};
  var texture;
  var sprite;
  var w = params.width || 50;
  var h = params.height || 50;

  var img = new Image();
  img.onload = function () {
    texture.needsUpdate = true;
  };
  texture = new THREE.Texture(img);
  // user image proxy if needed
  if (params.service)
    img.src = '/photo/'+params.service+'/'+encodeURIComponent(imgObj.UrlPreview);
  else
    img.src = imgObj.UrlPreview
  texture.needsUpdate = true;

  var material = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false, transparent: true } );
  sprite = new THREE.Sprite( material );
  sprite.scale.set(w, h, 1);
  sprite.position.y = h/2;
  sprite.name = params.name || '';
  sprite.imgObj = imgObj;
  sprite.img = img;
  sprite.texture = texture;
  return sprite;
}

WebGLTimeTravel.prototype.createTextMarker = function createTextMarker(str) {
  var group = new THREE.Object3D();
  var text = this.createText( str, {
      fontsize: 64,
      fontface: 'Abel',
      backgroundColor: {r:237, g:28, b:36, a:1.0},//0xed1c24
      borderColor: {r:237, g:28, b:36, a:1.0}//0xed1c24
    } );
  text.position.x = 37 - 24;
  text.position.y = -10 + 15;
  text.position.z = 0;

  var line = this.createPlane({ width: 100, height: 3, position: { x: 0, y: .1, z: 0 }, rotation: { x: Math.PI/2 }, color: 0x000000});

  group.add(text);
  group.add(line);
  return group;
}

WebGLTimeTravel.prototype.createText = function createText( message, parameters )
{
  if ( parameters === undefined ) parameters = {};

  var fontface = parameters.hasOwnProperty("fontface") ?
    parameters["fontface"] : "Arial";

  var fontsize = parameters.hasOwnProperty("fontsize") ?
    parameters["fontsize"] : 18;

  var borderThickness = parameters.hasOwnProperty("borderThickness") ?
    parameters["borderThickness"] : 4;

  var borderColor = parameters.hasOwnProperty("borderColor") ?
    parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

  var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
    parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

  var spriteAlignment = new THREE.Vector2(-1,-1); //THREE.SpriteAlignment.topLeft;

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = "Bold " + fontsize + "px " + fontface;

  // get size data (height depends only on font size)
  var metrics = context.measureText( message );
  var textWidth = metrics.width;

  // background color
  context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                  + backgroundColor.b + "," + backgroundColor.a + ")";
  // border color
  context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                  + borderColor.b + "," + borderColor.a + ")";

  context.lineWidth = borderThickness;
  // roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
  // 1.4 is extra height factor for text below baseline: g,j,p,q.

  // text color
  context.fillStyle = "rgba(0, 0, 0, 1.0)";

  context.fillText( message, borderThickness, fontsize + borderThickness);

  // canvas contents will be used for a texture
  var texture = new THREE.Texture(canvas)
  texture.needsUpdate = true;

  var spriteMaterial = new THREE.SpriteMaterial(
    { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
  var sprite = new THREE.Sprite( spriteMaterial );
  // sprite.scale.set(100,50,1.0);
  sprite.scale.set(50,25,1.0);
  sprite.rotation.set(Math.PI/2,0,0);
  return sprite;
}

WebGLTimeTravel.prototype.animate = function animate() {
  var self = this;
  requestAnimationFrame( function() {
    animate.call(self);
  } );

  self.renderer.render( self.scene, self.camera );

  self.keyUpdate();

  self.worldUpdate();
}

WebGLTimeTravel.prototype.keyUpdate = function keyUpdate() {
  // keyboard.update();
  if ( this.keyboard.pressed("up") ) {
    this.pressNextItem();
  }
  if ( this.keyboard.pressed("down") ) {
    this.pressPrevItem();
  }
}

// Move next/previous with limited repeat rate at 200ms
WebGLTimeTravel.prototype.pressNextItem = _.throttle(function() {
  this.speed = 0;
  this.startTween({
    z: this.objectList.position.z
  }, {
    z: this.getNextPos()+20
  });
}, 200, {trailing: false});

WebGLTimeTravel.prototype.pressPrevItem = _.throttle(function() {
  this.speed = 0;
  this.startTween({
    z: this.objectList.position.z
  }, {
    z: this.getPrevPos()+20
  });
}, 200, {trailing: false});

WebGLTimeTravel.prototype.getNextPos = function getNextPos() {
  var obj = this.objectList.children[this.current_object_index+1];
  if (!obj) {
    return -this.objectList.children[this.current_object_index].position.z;
  } else {
    this.current_object_index++;
    return -obj.position.z;
  }
}
WebGLTimeTravel.prototype.getPrevPos = function getPrevPos() {
  var obj = this.objectList.children[this.current_object_index-1];
  if (!obj) {
    return -this.objectList.children[this.current_object_index].position.z;
  } else {
    this.current_object_index--;
    return -obj.position.z;
  }
}

WebGLTimeTravel.prototype.startTween = function startTween(from, to) {
  var self = this;

  self.stopTween();
  self.tween = new TWEEN.Tween(from)
  .to(to, 500 )
  .easing( TWEEN.Easing.Quadratic.Out )
  .onUpdate( function () {
    self.objectList.position.z = this.z;
  } )
  .onComplete( function() {
    self.tween.isPlaying = false;
  })
  .start();

  self.tween.isPlaying = true;
}
WebGLTimeTravel.prototype.stopTween = function stopTween() {
  if (self.tween && self.tween.isPlaying) {
    // console.log('stop tweening')
    self.tween.stop();
    self.tween.isPlaying = false;
  }
}

WebGLTimeTravel.prototype.getCurrentObjectIndex = function getCurrentObjectIndex() {
  if (!this.objectList) return;
  var camPos = -this.objectList.position.z;
  var currentObj = this.objectList.children[this.current_object_index];
  if (!currentObj) return;
  var currentPos = currentObj.position.z;
  var currentDis = Math.abs(camPos - currentPos);

  var i = this.current_object_index, obj, dis;
  var dir = camPos > currentPos ? -1 : 1;
  while (true) {
    obj = this.objectList.children[i+dir];
    if (!obj) break;
    dis = Math.abs(obj.position.z - currentPos);
    if (dis < currentDis) {
      i = i+dir;
    } else {
      break;
    }
  }
  this.current_object_index = i;
}

WebGLTimeTravel.prototype.worldUpdate = function worldUpdate() {
  var self = this;
  if (self.speed !== 0) self.speed *= self.acc;
  if (Math.abs(self.speed) < 0.001) self.speed = 0;
  if (self.speed !== 0) {
    self.stopTween();
  }

  TWEEN.update();

  // calculate current object index if moving without tween
  if ((!self.tween || !self.tween.isPlaying) && self.speed !== 0) {
    if (!self._intervalCurrentIndex) {
      self._intervalCurrentIndex = setInterval(getCurrentObjectIndex, 100);
    }
  } else {
    if (self._intervalCurrentIndex) {
      clearInterval(self._intervalCurrentIndex);
      self._intervalCurrentIndex = null;
    }
  }

  if (self.objectList) {
    // move objects
    self.objectList.position.z += self.speed;

    // bounce on min/max distance
    if (self.objectList.position.z < 0) {
      self.objectList.position.z = 0;
      self.speed *= -0.5;
    }
    if (self.objectList.position.z > -self.dist-40) {
      self.objectList.position.z = -self.dist-40;
      self.speed *= -0.2;
    }

    var boxShowObj;
    self.objectList.children.forEach(function(obj) {
      // check if object near viewer
      var posz =  obj.position.z + self.objectList.position.z;
      var opacity = posz <= 0+self.fadeout_offset ? 1 : Math.max(0, 1-(posz-self.fadeout_offset)/self.FADEOUT_DISTANCE);
      // check if needed to update info box
      var updatebox = posz > self.INFOBOX_RANGE_CENTER_POSITION-self.infobox_offset && posz < self.INFOBOX_RANGE_CENTER_POSITION+self.infobox_offset ;
      // keep object to send image info to show in info box later at the bottom of this function
      if(updatebox && obj.imgObj){
        boxShowObj = obj;
      }
      var meshes;
      if (obj instanceof THREE.Sprite || obj instanceof THREE.Geometry){
        meshes = [obj];
      }else if (obj.children){
        meshes = obj.children;
      }

      // fade out
      meshes.forEach(function(mesh) {
        var material;
        if (mesh.material)
          mesh.material.opacity = opacity;
         if (mesh.materials)
          mesh.materials[0].opacity = opacity;
      });
    });

    // show image info
    if(boxShowObj){
      updateInfoBox({
        show: true,
        id: boxShowObj.imgObj.ImageId,
        title: boxShowObj.imgObj.Title,
        artist: boxShowObj.imgObj.Artist,
        caption: boxShowObj.imgObj.Caption
      });
    } else {
      updateInfoBox({
        show: false
      });
    }
  }
}

// END - WebGLTimeTravel





/*
 * Search
 */

$(function() {
  var requestId = null;
  var searchResults;
  var spin = new Spinner({color:'#666', left: '0', top: '10px', lines: 11, radius: 4, length: 2, width: 1.5});

  // controller buttons next/prev
  $('#controller')
  .on('click', '.next-btn', function(e) {
    e.preventDefault();
    TT.pressNextItem();
  })
  .on('click', '.prev-btn', function(e) {
    e.preventDefault();
    TT.pressPrevItem();
  });

  $('.toggle-year-range').on('click', function(e) {
    e.preventDefault();
    $('.ui').toggleClass('option-active');
  })

  // create slider with multihanders for year range search.
  var current_year = new Date().getFullYear();
  $('#year-range-slider').slider({
    range: true,
    // gettyimage has image created since 1753, but it makes our slider range too long, we change to later year.
    min: 1900,
    max: current_year,
    values: [ 1972, 2014],
    slide: function(event, ui){
      // showing total year range
      var text = ui.values[0] + ' - ' + ui.values[1];
      $('#startdate').val(ui.values[0]);
      $('#enddate').val(ui.values[1]);
      $('#year-range-text').text(text);
    }
  });
  $('#year-range-text').text( $('#year-range-slider').slider('values', 0 ) + ' - ' + $('#year-range-slider').slider('values', 1 ));

  $('#form-search').on('submit', function(e) {
    // hide old info. when search for new query
    updateInfoBox({ show: false });
    e.preventDefault();
    $('.spinner').removeClass('hidden');
    TT.resetTimeline();
    searchResults = [];

    countSearchResultUp(0, false);
    $('.loading-text').removeClass('hidden');
    spin.spin($('.status')[0]);
    $('.result-text').addClass('hidden');

    var masterdata = $('#form-search').serializeObject();
    masterdata.startdate = masterdata.startdate || $('#year-range-slider').slider('values',0)+'-01-01';
    masterdata.enddate = masterdata.enddate || $('#year-range-slider').slider('values',1)+'-01-01';
    var startyear = +masterdata.startdate.split('-')[0];
    var endyear = +masterdata.enddate.split('-')[0];
    var yearlist = [];
    // generate each year
    var range = endyear-startyear;
    var step = parseInt(range/5);
    for (var i=0; i<endyear-startyear; i+=step) {
      yearlist.push(startyear+i);
    }

    // event hit: search submit
    ga('send', 'event', 'search', 'submit', values(masterdata));

    // itemCount can be only --> 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 25, 30, 50, 60, 75
    // limited by gettyimage api
    var itemCount = step*5;
    var limitedCount = [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 25, 30, 50, 60, 75]
    for( var i =0, limitedLength = limitedCount.length;i<limitedLength;i++){
      if(limitedCount[i]>=itemCount){
        itemCount=limitedCount[i];
        break;
      }
    }
    var reqId = requestId = Math.random();
    var year_mark = null;
    async.mapSeries(yearlist,
      function(year, cb) {
        if (reqId != requestId) {
          // console.log('Cancel expired request')
          return cb();
        }

        var data = clone(masterdata);
        data.startdate = year+'-01-01';
        var nextstep = year+step-1;
        if(nextstep<endyear)
          data.enddate = nextstep+'-12-31';
        else data.enddate = endyear + '-12-31';

        data.itemperpage = itemCount;

        $.ajax({
          url: '/search',
          type: 'GET',
          dataType: 'json',
          data: data,
          resetForm : true
        })
        .done(function(data){
          if (reqId != requestId) return;

            var itemList = [];
            var imageArray = data.SearchForImagesResult&&data.SearchForImagesResult.Images||[];

            $.each(imageArray,function(index, image){
              var date = /\/Date\(([0-9]+).*\)\//g.exec(image.DateCreated);
              if (date && date[1]) image.date = new Date(+date[1]);
              itemList.push(image);
            });

            itemList.sort(function(a, b) {
              return +a.date < +b.date ? -1 : 1;
            });

            // photos
            itemList.forEach(function(image) {
              var year = image.date&&image.date.getFullYear();
              // year mark
              if (typeof year === 'number' && year != year_mark) {
                year_mark = year;
                TT.addOnTimeline(TT.createTextMarker(year), 90, 30);
              }

              var w = +image.MaxImageResolutionWidth || 50;
              var h = +image.MaxImageResolutionHeight || 50;
              var ratio = Math.min(w, h)/Math.max(w, h);
              var size = 60;
              w2 = w > h ? size : size * ratio;
              h2 = w > h ? size * ratio : size;
              TT.addOnTimeline(TT.createSprite(image, {width: w2, height: h2, service: 'getty'}));
            });

            searchResults = searchResults.concat(itemList);

            console.log('result', searchResults.length)
            countSearchResultUp(searchResults.length, true);
            // $('.result-text').spin({color:'#fff', lines: 12});
            // spin.spin($('.result-text')[0])
            // $('.loading-text').addClass('hidden');
            // $('.result-text').removeClass('hidden').find('.count').text(searchResults.length);
        })
        .fail(function(xhr, text, e){
          console.error(xhr);
          console.error(text);
          console.error(e);
        })
        .always(function() {
          cb();
        });
      },

      function(err, result) {
        if (reqId === requestId) {
          // $('.spinner').addClass('hidden');
          spin.stop();
          $('.loading-text').addClass('hidden');
          $('.result-text').removeClass('hidden');
          countSearchResultUp(searchResults.length, false);
        }
      }
    )
  });

  // submit once on pageload
  $('#form-search').trigger('submit');

  // focus on search box
  $('input[name="query"]').trigger('focus');

});

var countSearchResultUp_timer;
function countSearchResultUp(count, animate) {
  if (count > 0) {
    $('#controller').removeClass('hidden');
  }

  if (!animate) {
    $('.result-text').removeClass('hidden').find('.count').text(count);
    return;
  }

  var now = +$('.result-text .count').text();
  var dif = count - now;
  if (countSearchResultUp_timer) clearTimeout(countSearchResultUp_timer);
  countUp();
  $('.loading-text').addClass('hidden');
  $('.result-text').removeClass('hidden');

  function countUp() {
    if (now < count) $('.result-text .count').text(++now);
    if (now < count) countSearchResultUp_timer = setTimeout(countUp, Math.random()*40+10);
  }
}

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function values(obj) {
  return typeof obj !== 'object' ? '' : Object.keys(obj).map(function(key){ return obj[key]; }).join(',');
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
};





// BEGIN - NoWebGLTimeTravel
var NoWebGLTimeTravel = function() {
  console.info('Compatibility mode');

  var self = this;

  this.FADEOUT_DISTANCE = 30;
  this.INFOBOX_RANGE_CENTER_POSITION = 10;
  this.INFOBOX_RANGE_DISTANCE = 76;
  this.STAGE_TOP = 30;

  this.speed = 0;
  this.acc = 0.97;
  this.dist = 0;

  // this.keyboard = new THREEx.KeyboardState();
  // this.mouse = { x: 0, y: 0 };

  // this.camera
  // this.scene
  // this.renderer
  // this.projector
  // this.tween
  // this.objectList

  // this.current_object_index
  // this._intervalCurrentIndex

  this.fadeout_offset = this.FADEOUT_DISTANCE;
  this.infobox_offset = this.INFOBOX_RANGE_DISTANCE/2;
  $('html').addClass('no-webgl');
  var $stage = $('#stage');
  this.stage = $('<div class="container">');
  $stage.append(this.stage);


  $(window).on('keydown', function(e) {
    // Up
    if (e.keyCode === 38) {
      self.pressNextItem();
    }
    // Down
    if (e.keyCode === 40) {
      self.pressPrevItem();
    }
  });
};

NoWebGLTimeTravel.prototype.init = function() {
  this.objectList = [];
  this.pos = -1;
  this.prevFocuses = [];
  this.focus = null;

};

NoWebGLTimeTravel.prototype.resetTimeline = function resetTimeline() {
  this.init();
  // var self = this;
  // if (self.objectList) {
  //   self.objectList.children.forEach(function(obj) {
  //     self.deallocMesh(obj);
  //     self.scene.remove(obj);
  //   });
  //   self.scene.remove(self.objectList);
  // }
  // // create new object group
  // self.objectList = new THREE.Object3D();
  // self.scene.add(self.objectList);
  // self.dist = 90;
  // self.current_object_index = 0;
}

NoWebGLTimeTravel.prototype.addOnTimeline = function addOnTimeline(obj, d1, d2) {
  this.objectList.push(obj);

  if (this.objectList.length === 1) {
    this.pressNextItem();
  }
  // var self = this;
  // self.objectList.add(obj);
  // self.dist -= d1 || 60;
  // obj.position.z = this.dist;
  // self.dist -= d2 || 60;
}

NoWebGLTimeTravel.prototype.createSprite = function createSprite(imgObj, params) {

  return [ 'sprite', imgObj, params ];

  var sprite;

  sprite = $('<div class="sprite">');
  sprite.append(
    $('<img>').attr('src', imgObj.UrlPreview)
  );

  // params = params || {};
  // var texture;
  // var sprite;
  // var w = params.width || 50;
  // var h = params.height || 50;

  // var img = new Image();
  // img.onload = function () {
  //   texture.needsUpdate = true;
  // };
  // texture = new THREE.Texture(img);
  // // user image proxy if needed
  // if (params.service)
  //   img.src = '/photo/'+params.service+'/'+encodeURIComponent(imgObj.UrlPreview);
  // else
  //   img.src = imgObj.UrlPreview
  // texture.needsUpdate = true;

  // var material = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false, transparent: true } );
  // sprite = new THREE.Sprite( material );
  // sprite.scale.set(w, h, 1);
  // sprite.position.y = h/2;
  // sprite.name = params.name || '';
  // sprite.imgObj = imgObj;
  // sprite.img = img;
  // sprite.texture = texture;
  return sprite;
}

NoWebGLTimeTravel.prototype.createTextMarker = function createTextMarker(str) {

  return [ 'text', str ];

  var group;

  group = $('<div class="textmarker">');
  group.append(
    $('<span>').text(str)
  );

  // var group = new THREE.Object3D();
  // var text = this.createText( str, {
  //     fontsize: 64,
  //     fontface: 'Abel',
  //     backgroundColor: {r:237, g:28, b:36, a:1.0},//0xed1c24
  //     borderColor: {r:237, g:28, b:36, a:1.0},//0xed1c24
  //   } );
  // text.position.x = 37 - 24;
  // text.position.y = -10 + 15;
  // text.position.z = 0;

  // var line = this.createPlane({ width: 100, height: 3, position: { x: 0, y: .1, z: 0 }, rotation: { x: Math.PI/2 }, color: 0x000000});

  // group.add(text);
  // group.add(line);
  return group;
}

NoWebGLTimeTravel.prototype.createElement = function(type, data, params) {
  var el, img;
  if (type === 'sprite') {

    el = $('<div class="tt-item sprite">');
    img = $('<img/>').css('opacity', 0);
    el.append(img);

    setTimeout(function() {
      img.imageLoad(function() {
        $(this)
        .animate({
          opacity: 1
        }, 100)
        .parent().css({
          marginLeft: -this.width/2 + 'px',
          marginTop: -this.height+'px'
        });
      })
      .attr('src', data.UrlPreview)
    }, 1);

  } else if (type === 'text') {

    el = $('<div class="tt-item textmarker">'+data+'</div>');

    setTimeout(function() {
      el.css({
        marginLeft: -el.width()/2 + 'px',
        marginTop: -el.height() + 'px'
      });
    }, 1);

  }
  return el;
}

$.fn.imageLoad = function(fn){
    this.load(fn);
    this.each( function() {
        if ( this.complete && this.naturalWidth !== 0 ) {
            $(this).trigger('load');
        }
    });
    return this;
}

// Move next/previous with limited repeat rate at 200ms
NoWebGLTimeTravel.prototype.pressNextItem = _.throttle(function() {
  var self = this;
  if (self.pos >= self.objectList.length - 1) return;
  if (self.focus) self.prevFocuses.push(self.focus);

  self.pos++;
  var item = self.objectList[self.pos];

  self.focus = {
    id: self.pos,
    type: item[0],
    data: item[1],
    options: item[2],
    el: self.createElement(item[0], item[1], item[2])
  };

  self.stage.append(self.focus.el);

  // Insert new one
  self.focus.el.css({
    top: 0
  })
  .animate({
    top: '65%'
  }, 100, function() {

    // show image info
    if(self.focus.type === 'sprite'){
      updateInfoBox({
        show: true,
        id: self.focus.data.ImageId,
        title: self.focus.data.Title,
        artist: self.focus.data.Artist,
        caption: self.focus.data.Caption
      });
    }

  });

  // Remove old ones
  for (var i in self.prevFocuses) {
    var p = self.prevFocuses[i];
    p.el && p.el.animate({
      top: 100*(self.prevFocuses.length-i+1)+'%'
    }, 100, (function(el) {
      return function() {
        el && el.remove();
        setTimeout(function() {
          self.prevFocuses.length = 0;
        })
      };
    })(p.el));
  }

  updateInfoBox({
    show: false
  });
}, 50, {trailing: false});

NoWebGLTimeTravel.prototype.pressPrevItem = _.throttle(function() {
  var self = this;
  if (self.pos <= 0) return;
  if (self.focus) self.prevFocuses.push(self.focus);

  self.pos--;
  var item = self.objectList[self.pos];

  self.focus = {
    id: self.pos,
    type: item[0],
    data: item[1],
    options: item[2],
    el: self.createElement(item[0], item[1], item[2])
  };

  self.stage.append(self.focus.el);

  // Insert new one
  self.focus.el.css({
    top: '200%'
  })
  .animate({
    top: '65%'
  }, 100, function() {

    // show image info
    if(self.focus.type === 'sprite'){
      updateInfoBox({
        show: true,
        id: self.focus.data.ImageId,
        title: self.focus.data.Title,
        artist: self.focus.data.Artist,
        caption: self.focus.data.Caption
      });
    }

  });

  // Remove old ones
  for (var i in self.prevFocuses) {
    var p = self.prevFocuses[i];
    p.el && p.el.animate({
      top: 100*(-i)+'%'
    }, 100, (function(el) {
      return function() {
        el && el.remove();
        setTimeout(function() {
          self.prevFocuses.length = 0;
        })
      };
    })(p.el));
  }

  updateInfoBox({
    show: false
  });
}, 50, {trailing: false});


// END - NoWebGLTimeTravel




// Start App
var TT;
if (!document.addEventListener || $('html').is('.ie8') || location.search.indexOf('mode=old') >= 0) {
  TT = new NoWebGLTimeTravel();
} else {
  TT = new WebGLTimeTravel();
}

TT.init();

