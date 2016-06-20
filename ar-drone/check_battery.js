var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.on('navdata', function(data) {
  if (data.demo) {
    console.log(data.demo.batteryPercentage);
    process.exit(0);
  }
});
