'use strict';

var chokidar = require('chokidar');
var fs = require('fs');

var Drone = require('rolling-spider');
var d = new Drone({
  // uuid: "Travis_070557",
  logger: console.log
});

d.connect(function (connectError) {
  if (connectError) {
    console.log("Connect Error!");
    return;
  }

  d.setup(function (setupError) {
    if (setupError) {
      console.log("Setup Error!");
      return;
    }

    d.flatTrim();
    d.startPing();
    d.flatTrim();

    console.log("drone ready");
  });
});

var watcher = chokidar.watch('/tmp/drone_server.txt', {
  persistent: true
});

watcher.on('all', function(event, path) {
  console.log(event);
  if (!path) {
    return;
  }

  var data = fs.readFileSync(path, {
    encoding: 'utf-8'
  });
  console.log(data);
  if (data.indexOf("起飞") > -1) {
    console.log("taking off");
    try {
      d.takeoff();
    } catch (e) {
      console.log(e);
    }
  }
  if (data.indexOf("降落") > -1) {
    console.log("landing");
    d.land();
  }
  if (data.indexOf("上") > -1) {
    console.log("flying up");
    d.up({
      speed: 40,
      steps: 20
    });
  }
  if (data.indexOf("下") > -1) {
    console.log("flying down");
    d.down({
      speed: 40,
      steps: 20
    });
  }
  if (data.indexOf("前") > -1) {
    console.log("flying forward");
    d.forward({
      speed: 40,
      steps: 20
    });
  }
  if (data.indexOf("后") > -1) {
    console.log("flying backward");
    d.backward({
      speed: 40,
      steps: 20
    });
  }
  if (data.indexOf("左") > -1) {
    console.log("flying backward");
    d.left({
      speed: 40,
      steps: 20
    });
  }
  if (data.indexOf("右") > -1) {
    console.log("flying backward");
    d.right({
      speed: 40,
      steps: 20
    });
  }
  if (data.indexOf("圈") > -1) {
    console.log("spinning");
    d.clockwise({
      speed: 40,
      steps: 100
    });
  }
  if (data.indexOf("空翻") > -1) {
    console.log("flipping");
    d.backFlip(function() {
      setTimeout(function() {
        d.land(function() {
          process.exit(0);
        });
      }, 3000);
    });
  }
});

console.log("watching file...");

var quitting = false;

process.on('SIGINT', function() {
  if (!quitting) {
    d.land();
    console.log("press Ctrl + C again to exit");
    quitting = true;
  } else {
    process.exit();
  }
});
