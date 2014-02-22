
var camera, scene, renderer;
var cube;
var controls;

var offset = 0;
var speed = 0;
var acc = 0.97;

var keyboard = new KeyboardState();
var projector, mouse = { x: 0, y: 0 }, INTERSECTED;

var objectList;
var dist = 0;

init();
animate();

const FADEOUT_DISTANCE = 30;

function compareImageDate(a,b){
  var dateA = a.imgObj.DateCreated;
  var dateB = b.imgObj.DateCreated;

}

function addOnTimeline(obj, d1, d2) {
  objectList.add(obj);
  dist -= d1 || 60;
  obj.position.z = dist;
  dist -= d2 || 60;
}
function resetTimeline() {
  if (objectList) {
    objectList.children.forEach(function(obj) {
      deallocMesh(obj);
      scene.remove(obj);
    });
    scene.remove(objectList);
  }
  // create new object group
  objectList = new THREE.Object3D();
  scene.add(objectList);
  dist = 60;
}

function deallocMesh(obj) {
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

function init() {

  window.addEventListener( 'resize', onWindowResize, false );

  renderer = new THREE.WebGLRenderer( { alpha: true } );
  // renderer.setClearColor( 0xeeeeee, 1);
  renderer.setClearColor( 0x000000, 0);
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.getElementById( 'stage' ).appendChild( renderer.domElement );

  //

  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.set(0, 80, 150);
  // camera.translateY(-50);
  // camera.rotation.x = 1;
  // camera.target = new THREE.Vector3( 0, -50, 50);
  // camera.up = new THREE.Vector3(0,0,1);
  // camera.lookAt(new THREE.Vector3( 100, 100, 0));

  // camera.updateMatrix();
  // camera.updateProjectionMatrix();

  // // EVENTS
  // THREEx.WindowResize(renderer, camera);
  // THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });

  // CONTROLS
  controls = new THREE.OrbitControls( camera, renderer.domElement );

  scene = new THREE.Scene();

  scene.add(createPlane({ position: {z: /*-1480*/ 500}, rotation: {x:Math.PI/2}, color: 0xffffff, opacity: 1}));
  scene.add(createPlane({ width: 110, position: {z: 500, y: -2}, rotation: {x:Math.PI/2}, color: 0xeeeeee, opacity: 1}));
  scene.add(createPlane({ width: 120, position: {z: 500, y: -4}, rotation: {x:Math.PI/2}, color: 0xdddddd, opacity: 1}));
  scene.add(createPlane({ width: 135, position: {z: 500, y: -6}, rotation: {x:Math.PI/2}, color: 0xcccccc, opacity: 1}));
  // scene.add(createPlane({ width: 150, height: 20, position: {y:-10, z: 20 }, color: 0x318ce7}));


  // Add objects
  // addOnTimeline(createTextMarker( "December 2013 " ), 30);
  // addOnTimeline(createSprite( '/public/images/test3.jpg', { name: 'test3'}));
  // addOnTimeline(createSprite( '/public/images/test1.jpg', { name: 'test1'}));
  // addOnTimeline(createSprite( '/public/images/test2.jpg', { name: 'test2'}));

  // addOnTimeline(createTextMarker( "January 2014 " ), 30);
  // addOnTimeline(createSprite( '/public/images/test1.jpg'));
  // addOnTimeline(createSprite( '/public/images/test2.jpg'));
  // addOnTimeline(createSprite( '/public/images/test3.jpg'));

  // addOnTimeline(createTextMarker( "February 2014 " ), 30);
  // addOnTimeline(createSprite( '/public/images/test2.jpg'));
  // addOnTimeline(createSprite( '/public/images/test1.jpg'));
  // addOnTimeline(createSprite( '/public/images/test3.jpg'));

  // initialize object to perform world/screen calculations
  projector = new THREE.Projector();

  // when the mouse moves, call the given function
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

}

function onDocumentMouseMove( event )
{
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  // event.preventDefault();

  // update sprite position
  updateInfoBox({ x: event.clientX, y: event.clientY });
  // sprite1.position.set( event.clientX, event.clientY - 20, 0 );

  // update the mouse variable
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}


function createCube() {

  var geometry = new THREE.BoxGeometry( 200, 200, 200 );

  var texture = THREE.ImageUtils.loadTexture( '/public/images/crate.gif' );
  texture.anisotropy = renderer.getMaxAnisotropy();

  var material = new THREE.MeshBasicMaterial( { map: texture } );

  mesh = new THREE.Mesh( geometry, material );
  return mesh;
}

function createPlane(params) {
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

function createSprite(imgObj, params) {
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
  img.src = imgObj.UrlPreview;
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

function createTextMarker(str) {
  var group = new THREE.Object3D();
  var text = createText( str, {
      fontsize: 32,
      fontface: 'Arial Rounded MT Bold',
      backgroundColor: {r:49, g:140, b:231, a:1.0},//0x318ce7
      borderColor: {r:49, g:140, b:231, a:1.0}//{r:0, g:0, b:255, a:1.0}
    } );
  text.position.x = 37;
  text.position.y = -10;
  text.position.z = 0;
  var line = createPlane({ width: 100, height: 5, position: { x: 0, y: .1, z: 0 }, rotation: { x: Math.PI/2 }, color: 0x92dde0});

  group.add(text);
  group.add(line);
  return group;
}

function createText( message, parameters )
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
  sprite.scale.set(100,50,1.0);
  return sprite;
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  // cube.rotation.x += 0.005;
  // cube.rotation.y += 0.01;

  renderer.render( scene, camera );

  keyUpdate();

  mouseUpdate();

  controls.update();

  worldUpdate();
}

function mouseUpdate() {

  // find intersections
  var targetList = objectList&&objectList.children || [];

  // create a Ray with origin at the mouse position
  //   and direction into the scene (camera direction)
  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  projector.unprojectVector( vector, camera );
  var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

  // create an array containing all objects in the scene with which the ray intersects
  var intersects = ray.intersectObjects( targetList );

  // INTERSECTED = the object in the scene currently closest to the camera
  //    and intersected by the Ray projected from the mouse position

  // if there is one (or more) intersections
  if ( intersects.length > 0 )
  {
    // if the closest object intersected is not the currently stored intersection object
    if ( intersects[ 0 ].object != INTERSECTED )
    {
        // restore previous intersection object (if it exists) to its original color
      if ( INTERSECTED ) {
        updateInfoBox({
          show: false
        });
      }
      // store reference to closest object as current intersection object
      INTERSECTED = intersects[ 0 ].object;
      // update sprite position
      if (INTERSECTED.imgObj) {
        updateInfoBox({
          show: true,
          title: INTERSECTED.imgObj.Title,
          artist: INTERSECTED.imgObj.Artist,
          caption: INTERSECTED.imgObj.Caption
        });
      }
    }
  }
  else // there are no intersections
  {
    // restore previous intersection object (if it exists) to its original color
    if ( INTERSECTED ) {
      updateInfoBox({
        show: false
      });
    }
    // remove previous intersection object reference
    //     by setting current intersection object to "nothing"
    INTERSECTED = null;
  }

}

function keyUpdate() {

  keyboard.update();


  if ( keyboard.pressed("up") )
    speed += 0.4;
  if ( keyboard.pressed("down") )
    speed -= 0.4;

  // if ( keyboard.pressed("W") )
  //   camera.translateY(1);
  // if ( keyboard.pressed("S") )
  //   camera.translateY(-1);

  // if ( keyboard.pressed("A") )
  //   camera.target.position.copy( new THREE.Vector3(0, 100, 0) );
    // camera.lookAt( camera.target.add(new THREE.Vector3(0,1,0) ) );
  // if ( keyboard.pressed("D") )
  //   camera.lookAt( camera.target.add(new THREE.Vector3(0,-1,0) ) );
}

var fadeout_offset = FADEOUT_DISTANCE/2;
function worldUpdate() {
  speed *= acc;
  if (Math.abs(speed) < 0.001) speed = 0;

  if (objectList) {

    // move objects
    objectList.position.z += speed;
    objectList.children.forEach(function(obj) {
      var posz =  obj.position.z + objectList.position.z;
      var opacity = posz <= 0+fadeout_offset ? 1 : Math.max(0, 1-(posz-fadeout_offset)/FADEOUT_DISTANCE);

      var meshes;
      if (obj instanceof THREE.Sprite || obj instanceof THREE.Geometry)
        meshes = [obj];
      else if (obj.children)
        meshes = obj.children;

      meshes.forEach(function(mesh) {
        var material;
        if (mesh.material)
          mesh.material.opacity = opacity;
         if (mesh.materials)
          mesh.materials[0].opacity = opacity;
      });
    });
  }
}
