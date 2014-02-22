
var posx = 0;
var scale = 1;
var speed = 0; // share with render.js
var acc = 0.97; // share with render.js

Leap.loop({enableGestures: true}, function(frame) {
  var ids = {};
  var hands = frame.hands;
  var pointables = frame.pointables;
  var gestures = frame.gestures;

  gestures && gestures.forEach(function(gesture) {
    switch (gesture.type) {
      case 'circle':
        // {"center":[127.455,273.834,-27.4837],"normal":[0.168118,-0.822255,0.543721],"progress":0.898433,"radius":10.2592,"id":1926,"handIds":[16],"pointableIds":[56],"duration":255757,"state":"start","type":"circle"}
        // {"center":[127.807,275.053,-26.6459],"normal":[0.112556,-0.856655,0.503461],"progress":0.926437,"radius":9.54046,"id":1926,"handIds":[16],"pointableIds":[56],"duration":275478,"state":"update","type":"circle"}
        // {"center":[127.807,275.053,-26.6459],"normal":[0.112556,-0.856655,0.503461],"progress":0.926437,"radius":9.54046,"id":1926,"handIds":[16],"pointableIds":[56],"duration":275478,"state":"stop","type":"circle"}
        speed += 0.02 * getGestureCircleDirection(frame, gesture) * range(gesture.radius, [5,100], [1,10]);
        break;
      // case 'swipe':
      //   // {"startPosition":[172.027,265.269,-33.5395],"position":[32.7692,194.899,-80.61],"direction":[-0.854482,-0.431789,-0.288824],"speed":2358.3,"id":1937,"handIds":[71],"pointableIds":[72],"duration":0,"state":"start","type":"swipe"}
      //   // {"startPosition":[172.027,265.269,-33.5395],"position":[8.47858,183.49,-77.0836],"direction":[-0.893017,-0.417907,-0.166956],"speed":2064.49,"id":1937,"handIds":[71],"pointableIds":[72],"duration":9947,"state":"update","type":"swipe"}
      //   // {"startPosition":[172.027,265.269,-33.5395],"position":[-43.69,164.985,-43.7101],"direction":[-0.905727,-0.37155,0.203985],"speed":1238.15,"id":1937,"handIds":[71],"pointableIds":[72],"duration":49745,"state":"stop","type":"swipe"}
      //   if (gesture.state === 'stop') {
      //     console.log('swipe');
      //     speed += gesture.position[0] - gesture.startPosition[0] >= 0 ? 3 : -3;
      //   }
      //   break;
      // case 'keyTap':
      //   // {"position":[41.8939,188.764,4.5157],"direction":[-0.0656967,-0.993316,-0.094905],"progress":1,"id":1936,"handIds":[],"pointableIds":[72],"duration":118026,"state":"stop","type":"keyTap"}
      //   if (gesture.state === 'stop') {
      //     console.log('keyTap');
      //     speed += 1;
      //   }
      //   break;
      // case 'screenTap':
      //   // {"position":[36.9025,205.592,-37.3925],"direction":[-0.204514,-0.657758,-0.724933],"progress":1,"id":1935,"handIds":[],"pointableIds":[72],"duration":78731,"state":"stop","type":"screenTap"}
      //   if (gesture.state === 'stop') {
      //     console.log('screenTap');
      //   }
      //   break;
    }
  });

  render();

});

function range(num, rin, rout) {
  return Math.max(rout[0], Math.min(rout[1], rout[0] + (rout[1]-rout[0]) * (num - rin[0])/(rin[1]-rin[0])));
}

function getGestureCircleDirection(frame, gesture) {
  var pointable = frame.pointable(gesture.pointableIds[0]);
  if (!pointable || !pointable.valid) return 0;
  var direction = pointable.direction;//frame.pointable(pointableID).direction;
  var dotProduct = Leap.vec3.dot(direction, gesture.normal);
  return dotProduct  >  0 ? 1 : -1;
}

function render() {

}
