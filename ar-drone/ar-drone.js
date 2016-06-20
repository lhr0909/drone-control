'use strict';

var arDrone = require('ar-drone');
var CV = require('opencv');

function landDrone(client) {
  client.land(function() {
    console.log("landed");
    process.exit(0);
  });
}

var client = arDrone.createClient({
  frameRate: 10
});

var sequence = function() {
  var landing = false;
  client.on('navdata', function(navData) {
    if (navData.demo) {
      var altitude = navData.demo.altitudeMeters;
      if (altitude < 5 && !landing) {
        client.up(1);
      } else {
        if (!landing) {
          landing = landDrone(client);
        }
      }
    }
  });
};

client.takeoff(sequence);

process.on('SIGINT', function() {
  console.log("interrupted, landing");
  landDrone(client);
});
