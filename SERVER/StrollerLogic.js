

class StrollerLogic {
    static MODE = {SLAVE:"SLAVE", MASTER:"MASTER", GUI:"GUI", STROLLER:"STROLLER" };
    static EVENT = {SENSOR_DATA:"SENSOR_DATA", BRAKE_DATA:"BRAKE_DATA", HAND_BRAKE_DATA:"HAND_BRAKE_DATA", TEMP_DATA:"TEMP_DATA", FRONT_DATA:"FRONT_ASSIST_ACTIVATED"};
    static SYSTEM_SET = {FRONT:"FRONT_ASSIST_ENABLED", REMOTE:"REMOTE_ENABLED"};
    static ROLES = {MASTER:"MASTER", SLAVE:"SLAVE", RPI:"RPI", GUI:"GUI", TERMO:"TERMO", FRONT_SENSOR:"FRONT_SENSOR"};
    static DANGER_LEVEL = 6;

    constructor() {
        this.frontAssistEnabled = false;
        this.frontAssistActivated = false;
        this.remoteEnabled = false;

        this.sArr3 = [{"value":1}, {"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1}];
        this.sArr4 = [{"value":1}, {"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1}];

        this.fixDistance3 = 0;
        this.fixDistance4 = 0;

        this.resetDists();

        this.frontData = {};
        this.brakeData = {};
        this.handBrakeData = {activated:false};

    }

    activateBrakes(data) {
        this.brakeData = data;
        if(data.activated == false)
        {
            this.frontAssistActivated = false; //todo
            this.frontAssistEnabled = false; //todo
        }
    }

    activateHandBrake(data){
       // console.log("checking hand brake " + data.activated);
        if(data.activated != this.handBrakeData.activated)
        {
            this.handBrakeData = data;
            return true;
        }else
        {
            this.handBrakeData = data;
            return false;
        }

    }

    activateFront(data) {
        this.frontData = data;
    }

    isRemoteEnabled()
    {
       // console.log("is remote enabled check " + this.remoteEnabled);
        return this.remoteEnabled;
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

    enableFrontAssist(state)
    {
        this.frontAssistEnabled = state;
        this.resetDists();
    }

     collectFrontData(data)
    {


        if(data.value >=0 && data.value <= 1)
        {
            let arr = this["sArr"+data.id];

            if(this["fixDistance"+data.id] == -1)
            {
                if( data.value < 0.4)
                    this["fixDistance"+data.id] = data.value;
                else
                    this["fixDistance"+data.id]= 0.4;
            }

            let dangerDist = this["fixDistance"+data.id] - data.value;

            console.log( data.realValue + " !!! " + data.id + " , "  + data.value + " ? " +this["fixDistance"+data.id] + " :dangerEst " + dangerDist);

             let danger = true;

              arr.unshift(data);
              arr.pop();
              let prevValue = 0;

              let i = 0;

                for(i = 0; i < arr.length; i++)
                {
                     dangerDist = this["fixDistance"+data.id] - arr[i].value;

                     if(dangerDist > 0.2 || data.value < 0.1)
                     {
                        // danger = true;
                       // this.resetDists();
                    }else
                    {
                        break;
                    }

                }

                if(i >= 3) //czyli trzy wartosci
                {
                    danger = true;
                    this.resetDists();
                }else
                    danger = false;

            return danger;
        }else
        {
            return false;
        }

    }

    resetDists()
    {
        this.fixDistance3 = -1;
        this.fixDistance4 = -1;

        this.sArr3 = [{"value":1}, {"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1}];
        this.sArr4 = [{"value":1}, {"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1},{"value":1}];
    }


    collectFrontDataOncePrev(data)
    {
        let arr = this["sArr"+data.id];

        //todo try catch fix

        arr.unshift(data);
        arr.pop();
        let prevValue = 0;
        let danger = true;
        let i = 0

        for(i = 0; i < arr.length; i++)
        {
            if(arr[i].value > prevValue)
            {
                prevValue = arr[i].value;
            }else
            {
                danger = false;
                break;
            }
        }

        console.log("!!! " + i + ", " +  arr[0].value);

        if(i >= StrollerLogic.DANGER_LEVEL && arr[0].value < 0.2)
            danger = true;
        else
            danger = false;

        return danger;

    }
}

module.exports = StrollerLogic
