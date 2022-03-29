const SensorData = require("./SensorData")
const util = require('util')
const EventEmitter = require('events').EventEmitter

class SerialMsgService
{
    static SENSOR_EVENT = "sEvent";


    constructor() {
        console.log("serial msg service started");
        this.msg = "";
    }

   checkForSentence()
    {
        //string msg = "123gx=234;gy=-123;gz=89000;!asdfasdfadsf";

        //console.log("<!@#> checking in sentence : " + this.msg);

        let s = this.msg.indexOf("ss");
        let e = this.msg.indexOf(";");

        // console.log("<!@#> s " + s + ", e " + e);

        if (s >= 0 && e >= 0)
        {
            if (e > s)
            {
                let m = this.msg.substring(s, e - s + 1);
                this.tryParse(m);

                let restCharsInMsg = this.msg.length - (e + 1);

              //  console.log("<!@#> ---- rest chars in msg " + restCharsInMsg);
               // console.log("<!@#> ---- rest chars in msg " + this.msg);

                if (restCharsInMsg > 0)
                {
                    let ss = e + 1;
                    let ee = this.msg.length;
                    let len = ee - ss;
                    //console.log(ss + " --- " + ee + " --- " + len);
                    this.msg = this.msg.substring(ss);//, len);
                    this.checkForSentence();
                }
                else {
                    this.msg = "";
                   // console.log("MSG " + this.msg.length);
                }
            }
        }
    }

    onSerial( partMsg )
    {
        //console.log("<!@#> serial " + partMsg + ", this.msg.length "+ partMsg.length);

        //this.msg += "gx=666;gy=-1234;gz=890004;!qwerty";
       // console.log("********* code at" + this.msg.charCodeAt(0) +"!");
        if(this.msg.charCodeAt(0) <= 13)
            this.msg = partMsg;
        else
            this.msg += partMsg;

        if (this.msg.length > 50)
        {
           // console.log("<!@#> !@#!@# made it short");
            this.msg = partMsg;
        }

        this.checkForSentence();
    }

    tryParse(msg)
    {
        //gx=12;gy=13;gx=14;
      //  console.log("<!@#> parsing " + msg + ", " + msg.length );
        let cState;
        let cNum;


        let s = msg.indexOf("ss") + 3;
        let e = msg.indexOf(";", s);
        let len = e - s;
      //  console.log("<!@#> parsing " + msg + ", " + len + " - " +  e + " - " + s);

        let cNumString = msg.substring(s, 1);
       // console.log("<!@#> cNumString " + cNumString);

        let cString = msg.substr(s+1, len-1);
       // console.log("<!@#> cString " + cString);
        //let event = new Event(new Event(SerialMsgService.SENSOR_EVENT, new SensorData(cNumString, cString)));
        this.emit(SerialMsgService.SENSOR_EVENT, new SensorData(cNumString, cString, cString));

    }
}

util.inherits(SerialMsgService, EventEmitter);
module.exports = SerialMsgService
