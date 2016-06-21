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
var FACE_ERROR = 5;

var X_SCALE = 0.005;
var Y_SCALE = 0.005;
var Z_SCALE = 0.005;

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

function goByFace(face, currentState, count) {
  var faceSizeDiff = calcFaceDiff(face);
  var faceCenterDelta = calcDeltaPoint(IMG_CENTER, face.center);

  var newState = Object.assign({}, currentState, {
    x: currentState.x + faceSizeDiff * X_SCALE,
    y: currentState.y + faceCenterDelta.y * Y_SCALE,
    z: currentState.z + faceCenterDelta.z * Z_SCALE
  });

  if (count) {
    var payload = {
      face: face,
      state: currentState,
      x: faceSizeDiff,
      y: faceCenterDelta.y,
      z: faceCenterDelta.z,
      count: count
    };
    console.log(payload);
    jsonfile.writeFile('./raw_data/drone' + count + '.json', payload);
  }

  return newState;
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
        var s = goByFace(biggestFace, controller.state(), count);
        controller.go(s);

        mat.rectangle([face.x, face.y], [face.width, face.height], [0, 255, 0], 2);
        mat.rectangle(
          [IMG_CENTER.x - FACE_SIZE / 2, IMG_CENTER.y - FACE_SIZE / 2],
          [FACE_SIZE, FACE_SIZE],
          [0, 0, 255], 2
        );

        mat.save('./raw_data/drone' + (count++) + '.png');
      } else {
        goByFace(biggestFace, controller.state());
      }
    }
  });
});
