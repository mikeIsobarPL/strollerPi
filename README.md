# strollerPi
Baby stroller made for Skoda, equiped with safety systems, camera, brakes, termometer etc

# overview
There are 2 prototypes of strollers - strollerPi2 & strollerPi2. The main difference is use of different ultrasonic sensors/ and. Every stroller consists of 
frame with brakes, raspberryPi, arduino mega and iPad mini. To interact with each stroller, You have to log in to wifi - (strollerPi1 or 2) with password **skoda123**. 
Launch the app strollerPi on iPad or any device type in _http://strollerpi:9000/_ to enter GUI or _http://strollerpi:9001/_ to enter controller mode. On iOS http://strollerPi.local.

##system

Whole system consists off actors with roles:
- SERVER - js - node main point, communication with clients, stroller logic, brakes, sensor data distibution, managing states
- RPI - js / c - handling brakes, translating communication with arduino, reading sensors  
- GUI - ts - slave mode - graphical end with camera view, sensors visuatlisation, options etc on port 9000
- CONTROLLER - ts - master mode - optional view to take controll of all sensors data, set and get new values, activate brakes, traffic controll etc on port 9001 
- TERMO - js -thermometer 
- FRONT-SENSOR - python - data from front sensor
- CAMERA - js / python - streaming video to server on port 8080

Every client is connected to server strollerPi (samba) via WebSockets and dedicated evets:

- SENSOR_DATA
- BRAKE_DATA
- TEMP_DATA
- FRONT_DATA

System has two modes to set

- FRONT_ASSIST_ENABLED - set to analyze traffic going from sides
- REMOTE_ENABLED - is system being in remote control mode via CONTROLLER

##running, accessing

You can access raspberry Pi via log in to wifi - (strollerPi1 or 2) with password **skoda123**, then VNC to 192.168.4.1 with password _skoda123_. RPI is a wifi host, If You want to 
provide intertnet to rpi, connect it via ethernet. 

All of production files are placed on desktop, and run in terminal with script start.sh on startup.


