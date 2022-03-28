class SensorData {


    //internal SensorData, wymaga przekształceń
    constructor(id, value, realValue) {
        this.id = id;
        this.value = value;
        this.realValue = realValue;
    }

    print()
    {
        console.log("ID " + this. id + "; " + this.value);
    }

}

module.exports = SensorData
