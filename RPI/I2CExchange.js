
//const SerialPort = require('serialport');
//const Readline = require('@serialport/parser-readline');
const SerialMsgService = require("./src/SerialMsgService");
const SensorData = require("./src/SensorData");
const util = require('util')
const EventEmitter = require('events').EventEmitter
const i2c = require('i2c-bus');


class I2CExchange {

    static DATA_EVENT = "I2C_DATA_EVENT";
    
    constructor() {
        
        this.ARDUINO = 0x08; //adres Arduino
        this.brakesActive = 0x01;
        
        //this.wbuf = Buffer.from([this.brakeOrNot]);
        this.rbuf = Buffer.alloc(6);
        
        console.log("connecting ARduino i2c " + this.ARDUINO);

        this.connect();
    }
    
    
    brakeNow(activate)
    {
        if(activate)
            this.brakesActive = 0x00;
        else
            this.brakesActive = 0x01;
    }
    
    sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    connect()
    {
        let instance = this;
        
        const i2c1 = i2c.open(1, err => {
            console.log("opened i2c " +instance.ARDUINO);
            if (err) throw err;
 
             setInterval(function () {
                 
                i2c1.readI2cBlock(instance.ARDUINO, instance.brakesActive, 6, instance.rbuf, (err, rawData) => {
 
                    if (err)
                        console.log("err : " + err);
                    else
                        instance.parseData(instance.rbuf);

             
                });
            }, 100);

        });
    }


    parseData(data) {
     //  console.log("parsing data : " + data + ", " + data.length);
        //this.sendData("hello from Node");
      //  this.msg.onSerial(data);
        this.emit(I2CExchange.DATA_EVENT, data);
    }

}

util.inherits(I2CExchange, EventEmitter);
module.exports = I2CExchange
