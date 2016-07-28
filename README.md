# drone-control
Controlling the Parrot Minidrone Air Cargo (Travis), and ARDrone 2.0 with nodejs.

While the Minidrone has a camera, there is currently no API found for retrieving photos live while flying (`node-rolling-spider` does not include such method), and it is use BLE for communication.

ARDrone 2.0 offers two cameras and its protocol is via WiFi. I can get a PNG Stream for about 15 fps without much lag.

# Installation

Needs to install OpenCV (and its dependency for it to build and link, such as libpng), ffmpeg before being able to run. The fastest way is to install via homebrew (with homebrew-science):

    brew tap homebrew/science
    brew install opencv
    brew install ffmpeg

This should pull most of the dependencies and build recursively. Then you will need to run `npm install` to get the nodejs dependencies pulled down as well.

# Swarm Fix

Need to copy [this](https://github.com/virgilvox/node-rolling-spider/blob/master/lib/swarm.js) into node-rolling-spider node_module, in order to control the new Parrot drones.

# References

* [node-ar-drone](https://github.com/felixge/node-ar-drone)
* [node-rolling-spider](https://github.com/voodootikigod/node-rolling-spider)
* [node-opencv](https://github.com/peterbraden/node-opencv)
* [ardrone-autonomy](https://github.com/eschnou/ardrone-autonomy)
  * http://eschnou.github.io/ardrone-autonomy/
  * www.slideshare.net/eschnou/20130807-advanced-programming-with-nodecopter
