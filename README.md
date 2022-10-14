# strollerPi
Baby stroller made for foundation "Rodzic w mieście", equiped with safety systems, camera, brakes, termometer etc

# overview
There are 2 prototypes of strollers - strollerPi2 & strollCancel changeserPi2. The main difference is use of different ultrasonic sensors/ and. Every stroller consists of 
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

##hardware
- camera: adrucam 0v5647
- ultrasonic sensors:
  - front dfrobot-sen0312 23-450 cm
  - rear/side: sn1 4x uart DFRobot SEN0313
             : sn2 4x analog LV-EZ0Maxbotix Ultrasonic Rangefinder LV-EZ0
- microcontroller: arduino mega 2560 + grove mega shield 1.2
- microcomputer: rpi 4b + rpi port extander
- others: switch relay, thermometer



##running, accessing

You can access raspberry Pi via log in to wifi - (strollerPi1 or 2) with password **skoda123**, then VNC to 192.168.4.1 with password _skoda123_. RPI is a wifi host, If You want to 
provide intertnet to rpi, connect it via ethernet. 

All of production files are placed on desktop, and run in terminal with script start.sh on startup.

**Important** - in strollerPi1 disconnect first sensor from board on Arduino at start.

