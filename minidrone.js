'use strict';

var Drone = require('rolling-spider');
var d = new Drone({
  uuid: "Travis_070557",
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

    d.takeoff(function() {
      d.up({
        speed: 30,
        steps: 30
      }, function() {
        setTimeout(function() {
          d.forward({
            speed: 40,
            steps: 50
          }, function() {
            setTimeout(function () {
              d.backFlip(function() {
                setTimeout(function() {
                  d.land(function() {
                    process.exit(0);
                  });
                }, 3000);
              });
            }, 2000);
          });
        }, 2000);
      });
    });
  });
});
