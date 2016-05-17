'use strict';

var RollingSpider = require('rolling-spider');
var temporal = require('temporal');
var rollingSpider = new RollingSpider({
  uuid: "Travis_070557",
  logger: console.log
});

rollingSpider.connect(function (connectError) {
  if (connectError) {
    console.log("Connect Error!");
    return;
  }

  rollingSpider.setup(function (setupError) {
    if (setupError) {
      console.log("Setup Error!");
      return;
    }

    rollingSpider.flatTrim();
    rollingSpider.startPing();
    rollingSpider.flatTrim();

    var r = rollingSpider;

    r.takeoff(function() {
      r.up({
        speed: 20,
        steps: 20
      }, function() {
        r.backFlip(function() {
          r.land(function() {
            process.exit(0);
          });
        });
      });
    });
  });
});
