'use strict';

var arDrone = require('ar-drone');
var arController = require('ardrone-autonomy').Controller;
var cv = require('opencv');
var jsonfile = require('jsonfile');

var IMG_WIDTH = 640;
var IMG_HEIGHT = 360;

var IMG_CENTER = {
  x: IMG_WIDTH / 2,
  y: IMG_HEIGHT / 2
};

var FACE_SIZE = 80;
var FACE_ERROR = 20;

var X_SCALE = 0.002;
var Y_SCALE = 0.002;
var Z_SCALE = 0.002;

var LANDING = false;

function landDrone(client) {
  LANDING = client.land(function() {
    console.log("landed");
    process.exit(0);
  });
}

function getBiggestFace(matches) {
  var biggestFaceArea = 0;
  var biggestFace;
  for (var i = 0; i < matches.length; i++) {
    var face = matches[i];
    var faceArea = face.width * face.height;
    if (faceArea > biggestFaceArea) {
      biggestFaceArea = faceArea;
      biggestFace = Object.assign({}, face, {
        center: {
          x: face.x + face.width / 2,
          y: face.y + face.height / 2
        }
      });
    }
  }
  return biggestFace;
}

function calcDeltaPoint(p1, p2) {
  return {
    y: p2.x - p1.x,
    z: p1.y - p2.y
  };
}

function calcFaceDiff(face) {
  var faceWidthDiff = FACE_SIZE - face.width;
  var faceHeightDiff = FACE_SIZE - face.height;

  return (faceWidthDiff + faceHeightDiff) / 2;
}

function goByFace(face) {
  var faceSizeDiff = calcFaceDiff(face);
  var faceCenterDelta = calcDeltaPoint(IMG_CENTER, face.center);

  return Object.assign({}, {
    x: faceSizeDiff,
    y: faceCenterDelta.y,
    z: faceCenterDelta.z
  });
}

var client = arDrone.createClient({
  frameRate: 15
});

var controller = new arController(client);

// access the head camera
client.config('video:video_channel', 0);

// access the bottom camera
// client.config('video:video_channel', 3);

var sequence = function() {
  controller.zero();
  // controller.hover();

  setTimeout(function() {
    landDrone(client);
  }, 1000);

  pngStream.pipe(cvImageStream);
};

client.takeoff(sequence);

console.log('Connecting png stream ...');

var pngStream = client.getPngStream();
var cvImageStream = new cv.ImageStream();

var count = 0;

cvImageStream.on('data', function(mat) {
  mat.detectObject(cv.FACE_CASCADE, {}, function(err, matches) {
    if (err) {
      console.log("error!");
      landDrone(client);
    }

    if (matches && matches.length > 0) {

      var biggestFace = getBiggestFace(matches);

      if (!LANDING) {
        var direction = goByFace(biggestFace);
        // console.log(direction);
        if (direction.z > FACE_ERROR) {
          client.down(0.5);
          console.log('down');
        } else if (direction.z < -FACE_ERROR) {
          console.log('up');
          client.up(0.5);
        } else {
          client.stop();
          console.log('stop');
        }

        if (direction.y > FACE_ERROR) {
          console.log('right');
          // client.right(0.5);
          client.clockwise(0.5);
        } else if (direction.y < -FACE_ERROR) {
          console.log('left');
          // client.left(0.5);
          client.counterClockwise(0.5);
        } else {
          console.log('stop');
          client.stop();
        }
        //
        // if (direction.x > FACE_ERROR) {
        //   console.log('front');
        //   client.front(0.5);
        // } else if (direction.x < -FACE_ERROR) {
        //   console.log('back');
        //   client.back(0.5);
        // } else {
        //   console.log('stop');
        //   client.stop();
        // }

        mat.rectangle(
          [biggestFace.x, biggestFace.y],
          [biggestFace.width, biggestFace.height],
          [0, 255, 0], 2
        );
        mat.rectangle(
          [IMG_CENTER.x - FACE_SIZE / 2, IMG_CENTER.y - FACE_SIZE / 2],
          [FACE_SIZE, FACE_SIZE],
          [0, 0, 255], 2
        );

        // mat.save('./raw_data/drone' + (count++) + '.png');
        mat.save('./drone.png');
      } else {
        goByFace(biggestFace, controller.state());
      }
    } else {
      console.log('no match');
      client.stop();
    }
  });
});
