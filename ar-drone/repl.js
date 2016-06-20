var arDrone = require('ar-drone');
var client  = arDrone.createClient();
client.land(
  function() {
    client.createRepl();
  }
);
