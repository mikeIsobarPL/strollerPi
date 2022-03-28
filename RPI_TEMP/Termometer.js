const io = require( 'socket.io-client' );
//const ArduinoExchange = require('./ArduinoExchange.js');

const sensor = require('ds18b20-raspi');

class Termometer {

    static MODE = {SLAVE:"SLAVE", MASTER:"MASTER", GUI:"GUI", STROLLER:"STROLLER" };
    static EVENT = {SENSOR_DATA:"SENSOR_DATA", BRAKE_DATA:"BRAKE_DATA", TEMP_DATA:"TEMP_DATA", FRONT_DATA:"FRONT_ASSIST_ACTIVATED"};
    static SYSTEM_SET = {FRONT:"FRONT_ASSIST_ENABLED", REMOTE:"REMOTE_ENABLED"};
    static ROLES = {MASTER:"MASTER", SLAVE:"SLAVE", RPI:"RPI", GUI:"GUI", TERMO:"TERMO"};
    //static SERVER_URL = "http://192.168.1.41:9000";
    //static SERVER_URL = "http://192.168.1.49:9000";
    static SERVER_URL = "http://strollerPi:9000";
        

    constructor() {
       
        this.role = Termometer.ROLES.TERMO;
        this.temp = 22;
          

        this.connection = io(Termometer.SERVER_URL);

        console.log("connecting Termometer");

        this.connection.on("HELLO_WORLD", (data) => {
            console.log("hello world in controller " + this.connection);
           this.onHelloWorld(data);
        });

        this.connection.on('connect', () => {
            this.isConnectionActive = true;
            this.connection.emit("HELLO_WORLD", {role: this.role});
        });

        this.connection.on('disconnect', () => {
            this.isConnectionActive = false;
            console.log("!!! disconnected")
        });
                
       // this.startTempSensor();
    }
    
    startTempSensor()
    {
        this.readTemp();
        this.tempInterval = setInterval(() => {
            this.readTemp();
            this.sendTempData();
        }, 3000);
    }
            
    readTemp()
    {
        
        this.temp = sensor.readSimpleC(1);
        console.log("TEMP : " + this.temp);
        
    }

    

    onHelloWorld(data) {

       // this.msg.on(SerialMsgService.SENSOR_EVENT, (data) => this.onSensorData(data));

        this.startTempSensor();
    }


    sendTempData() { 
       this.connection.emit(Termometer.EVENT.TEMP_DATA, this.temp);
        
    }
}

module.exports = Termometer
