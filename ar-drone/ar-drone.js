'use strict';

var arDrone = require('ar-drone');
var arController = require('ardrone-autonomy').Controller;
var cv = require('opencv');

function landDrone(client) {
  client.land(function() {
    console.log("landed");
    process.exit(0);
  });
}

var client = arDrone.createClient({
  frameRate: 2
});

var controller = new arController(client);

// access the head camera
client.config('video:video_channel', 0);

// access the bottom camera
// client.config('video:video_channel', 3);

var sequence = function() {
  controller.zero();
  controller.hover();
  setTimeout(function() {
    landDrone(client);
  }, 10000);
};

// var sequence = function() {
//   var landing = false;
//   client.on('navdata', function(navData) {
//     if (navData.demo) {
//       var altitude = navData.demo.altitudeMeters;
//       if (altitude < 5 && !landing) {
//         client.up(1);
//       } else {
//         if (!landing) {
//           landing = landDrone(client);
//         }
//       }
//     }
//   });
// };

client.takeoff(sequence);

// console.log('Connecting png stream ...');
//
// var pngStream = client.getPngStream();
// var cvImageStream = new cv.ImageStream();
//
// var count = 0;
//
// cvImageStream.on('data', function(mat) {
//   mat.detectObject(cv.FACE_CASCADE, {}, function(err, matches) {
//     if (err) {
//       console.log("error!");
//       landDrone(client);
//     }
//
//     if (matches && matches.length > 0) {
//       console.log({
//         matches: matches,
//         state: controller.state()
//       });
//       for (var i = 0; i < matches.length; i++) {
//         var face = matches[i];
//         mat.rectangle([face.x, face.y], [face.width, face.height], [0, 255, 0], 2);
//       }
//       mat.save('./drone' + (count++) + '.png');
//     }
//   });
// });
//
// pngStream.pipe(cvImageStream);
