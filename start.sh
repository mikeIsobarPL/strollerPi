#!/bin/sh
"$@"
x-terminal-emulator -t CAMERA --working-directory=/home/pi/Desktop/RPICAM -e python3 /home/pi/Desktop/RPICAM/server.py
x-terminal-emulator -t FRONT_SENSOR --working-directory=//home/pi/Desktop/FRONT_SENSOR/DFRobot_RaspberryPi_A02YYUW-master/raspberry -e python3 /home/pi/Desktop/FRONT_SENSOR/DFRobot_RaspberryPi_A02YYUW-master/raspberry/socketClient.py
x-terminal-emulator -t SERVERS -e node /home/pi/Desktop/SERVER/server.js --working-directory=/home/pi/Desktop/SERVER
x-terminal-emulator -t RPILOGIC -e node /home/pi/Desktop/RPI/main.js
x-terminal-emulator -t TERMOMETER -e node /home/pi/Desktop/RPI_TEMP/mainTemp.js



