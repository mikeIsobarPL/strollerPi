//const SerialPort = require('serialport');
//const Readline = require('@serialport/parser-readline');
const SerialMsgService = require("./src/SerialMsgService");
const SensorData = require("./src/SensorData");
const util = require('util')
const EventEmitter = require('events').EventEmitter


class ArduinoExchange {

    static SERIAL_EVENT = "SERIAL_EVENT";

    constructor() {
        console.log("connecting ARduino");

       // this.connect();
    }

    connect()
    {
        this.port = new SerialPort('COM7', { baudRate: 57600 });
        this.parser = this.port.pipe(new Readline({ delimiter: '\n' }));

        this.port.on("open", () => {
            console.log('serial port open');
        });
        this.parser.on('data', data =>{
            this.parseData(data);
        });
    }


    parseData(data) {
       // console.log("parsing data : " + data + ", " + data.length);
        //this.sendData("hello from Node");
      //  this.msg.onSerial(data);
        this.emit(ArduinoExchange.SERIAL_EVENT, data);
    }

    sendData(helloFromNode) {
        this.port.write('hello from node\n\0', (err) => {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
            console.log('message written to AR');
        });
    }


}

util.inherits(ArduinoExchange, EventEmitter);
module.exports = ArduinoExchange
