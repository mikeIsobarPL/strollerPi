const io = require( 'socket.io-client' );
//const ArduinoExchange = require('./ArduinoExchange.js');
const SerialMsgService = require("./src/SerialMsgService.js");
const SensorData = require("./src/SensorData.js");
const I2CExchange =require("./I2CExchange.js");
const sensor = require('ds18b20-raspi');

class RPILogic {

    static MODE = {SLAVE:"SLAVE", MASTER:"MASTER", GUI:"GUI", STROLLER:"STROLLER" };
    static EVENT = {SENSOR_DATA:"SENSOR_DATA", BRAKE_DATA:"BRAKE_DATA", TEMP_DATA:"TEMP_DATA", FRONT_DATA:"FRONT_ASSIST_ACTIVATED"};
    static SYSTEM_SET = {FRONT:"FRONT_ASSIST_ENABLED", REMOTE:"REMOTE_ENABLED"};
    static ROLES = {MASTER:"MASTER", SLAVE:"SLAVE", RPI:"RPI", GUI:"GUI"};
    //static SERVER_URL = "http://192.168.1.41:9000";
    //static SERVER_URL = "http://192.168.1.49:9000";
    static SERVER_URL = "http://strollerPi:9000";
    
    static RANGES= [500, 500, 500, 500, 300, 500];

    constructor() {
        this.frontAssistEnabled = false;
        this.remoteEnabled = false;
        this.isConnectionActive = false;

        this.frontData = {};
        this.brakeData = {};
        this.role = RPILogic.ROLES.RPI;
        
        this.sensorDataArr = [{realValue:-1}, {realValue:-1}, {realValue:-1}, {realValue:-1}, {realValue:-1}, {realValue:-1}, {realValue:-1}];
        
        //handBrakesData to solve
        this.handBrakeArr = [0,0,0,0,0,0,0,0];
        this.handBrakeStatus = 0;
        this.handBrakeID = 6;

        this.connection = io(RPILogic.SERVER_URL);

        console.log("connecting RPI");

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
        
        
        this.connection.on(RPILogic.EVENT.BRAKE_DATA, (data) => {
            this.activateBrakes(data);
            
        });

        //this.msg = new SerialMsgService();
        //this.arduino = new ArduinoExchange();
        this.arduino = new I2CExchange();
        
    
    }
    
    startTempSensor()
    {
        this.readTemp();
        this.tempInterval = setInterval(() => {
            this.readTemp();
        }, 60000);
    }
    
    readTemp()
    {
        sensor.readSimpleC((err, temp) => {
            if (err) {
                console.log(err);
                this.temp = temp;
            } else {
            console.log(`${temp} degC`);
            }
        });
    }


    activateBrakes(data) {
        console.log("!!! activating brakes !!!")
        this.brakeData = data;
        this.arduino.brakeNow(data.activated);
    }

    activateFront(data) {
        this.frontData = data;
    }

    onHelloWorld(data) {

       this.arduino.on(I2CExchange.DATA_EVENT, (data) => this.onBlockData(data));
    }
    
    doubleCheckHandBrakes(breakData)
    {
        this.newBrakeStatus = breakData;
        this.handBrakeArr.unshift(breakData);
        this.handBrakeArr.pop();
        
        if(this.newBrakeStatus != this.handBrakeStatus)
        {
            let changeStatus = true;
            for(let i = 0; i < this.handBrakeArr.length; i++)
            {
                if(this.handBrakeArr[i] != this.newBrakeStatus)
                {
                    changeStatus = false;
                    break;
                }
            }
            
            if(changeStatus)
            {
                this.handBrakeStatus = this.newBrakeStatus;
                let dataToSend = {};
                dataToSend.id = this.handBrakeID.toString(); //!
                dataToSend.value = this.handBrakeStatus;
                dataToSend.realValue = this.handBrakeStatus;
                        
                console.log( dataToSend.id  +" sending new brake status : " + dataToSend.value + " , " + dataToSend.realValue);
                this.connection.emit(RPILogic.EVENT.SENSOR_DATA, dataToSend);
            }
        }
                    
    }

    onBlockData(data) { //tu przychodzi blok z bajtami danych z sensorów i z hamulca ręcznego
       
        let dataToSend = {};
        
        //sensory
        
        this.doubleCheckHandBrakes(data[data.length - 1]);
         
        //sensory
        for(let i = 0; i <data.length - 1; i++)
        {
             dataToSend = {};
             dataToSend.id = (i +1).toString(); //!
             dataToSend.value = parseInt(data[i],16)*2; // czyli zakres 0- 1
             dataToSend.realValue = dataToSend.value; //czyli ile faktycznie cm
             
             
             if(dataToSend.value > RPILogic.RANGES[i])
                dataToSend.value = 1;
             else if(dataToSend.value <= 0) //czyli error
                dataToSend.value = -1;
             else if(dataToSend.value == 2) //czyli below lower limit{
             {
                dataToSend.value = 0;
                
             }
             else
                dataToSend.value = dataToSend.value /RPILogic.RANGES[i] ;
                        

            if(dataToSend.realValue != this.sensorDataArr[i].realValue)
            {
                this.sensorDataArr[i] = dataToSend;
                
                console.log( dataToSend.id  +" sending " + data[i] + ":, " + dataToSend.value + " , " + dataToSend.realValue);
                this.connection.emit(RPILogic.EVENT.SENSOR_DATA, dataToSend);
                
            }
            
        }
    }
}

module.exports = RPILogic
