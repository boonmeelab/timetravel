
var posx = 0;
var scale = 1;
var speed = 0; // share with render.js
var acc = 0.97; // share with render.js
var handState={};
var walkState='UP';
var walkCount=0;
Leap.loop({enableGestures: true}, function(frame) {
  var ids = {};
  var hands = frame.hands;
  var pointables = frame.pointables;
  var gestures = frame.gestures;

  gestures && gestures.forEach(function(gesture) {
    switch (gesture.type) {
      case 'circle':
        speed += 0.02 * getGestureCircleDirection(frame, gesture) * range(gesture.radius, [5,100], [1,10]);
        break;
      case 'swipe':
        gHandIds = gesture.handIds;
        for(var i=0, handCount = gHandIds.length; i < handCount;i++){
          var hand = frame.hand(gHandIds[i]);
          if(!(gHandIds[i] in handState)){
            if(gesture.state==='start'){
              var pos = gesture.position;
              handState[gHandIds]={ state: 'start', position: pos};
            }
          }else {
            if(gesture.state==='stop' && handState[gHandIds].state==='start'){
              if(handState[gHandIds].position > gesture.position){
                if(walkState==='DOWN'){
                  walkCount++;
                  speed += 1;
                  walkState='UP';
                }
              }else{
                if(walkState==='UP'){
                  walkCount++;
                  speed += 1;
                  walkState='DOWN';
                }
              }
              console.log(walkCount);
              delete handState[gHandIds[i]];
            }
          }
        }
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
  var direction = pointable.direction;
  var dotProduct = Leap.vec3.dot(direction, gesture.normal);
  return dotProduct  >  0 ? 1 : -1;
}

function render() {
}
