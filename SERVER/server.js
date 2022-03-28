const path = require( 'path' );
const express = require( 'express' );
const socketIO = require( 'socket.io' );
const StrollerLogic = require('./StrollerLogic.js');


// create an express app
const app = express();

// send `index.html` from the current directory
// when `http://<ip>:9000/` route is accessed using `GET` method
app.get( '/', ( request, response ) => {
  response.sendFile( path.resolve( __dirname, '../GUI/dist/index.html' ), {
    headers: {
      'Content-Type': 'text/html',
    }
  } );
} );



// send asset files

app.use( '/assets/', express.static( path.resolve( __dirname, '../GUI/dist/assets' ) ) );
app.use( '/', express.static( path.resolve( __dirname, '../GUI/dist' ) ) );



// server listens on `9000` port
const server = app.listen( 9000, () => console.log( 'Skoda Stroller server started!' ) );

const appControll = express();

// send `index.html` from the current directory
// when `http://<ip>:9000/` route is accessed using `GET` method
appControll.get( '/', ( request, response ) => {
  response.sendFile( path.resolve( __dirname, '../CONTROLLER/dist/index.html' ), {
    headers: {
      'Content-Type': 'text/html',
    }
  } );
} );



// send asset files

appControll.use( '/assets/', express.static( path.resolve( __dirname, '../CONTROLLER/dist/assets' ) ) );
appControll.use( '/', express.static( path.resolve( __dirname, '../CONTROLLER/dist' ) ) );



// server listens on `9000` port
const server2 = appControll.listen( 9001, () => console.log( 'Skoda Stroller server CONTROLLER started!' ) );


// create a WebSocket server
const io = socketIO( server, {
    cors: {
        origin: "http://127.0.0.1:8081",
        methods: ["GET", "POST"]
    },
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});



var clientsList = {};
var logic =  new StrollerLogic();
var sensorDataArr = [{realValue:-1}, {realValue:-1}, {realValue:-1}, {realValue:-1}, {realValue:-1}, {realValue:-1}, {realValue:-1}];
var frontSensorID = 5; //sensory od zera w Arduino w RPILogic id+1, w python bez +1
var tempValue = 0;
const MAX_DIFF = 1;
const HAND_BRAKE_ID = 6;
const DISPATCH_LIMIT = false; //czyli zeby nie publikowac najblizszych wartosci out lub under

// listen for connection
io.on( 'connection', ( client ) => {
    console.log( 'SOCKET: ', 'A client connected', client.id );


    client.on( 'SENSOR_DATA', ( data ) => {
        
        if(data.id == HAND_BRAKE_ID)
        {
            
            data2 = {};
            if(data.realValue > 0)
                data2.activated = true;
            else
                data2.activated = false;
                
            if(logic.activateHandBrake(data2))
            {
                 console.log(data.realValue  +" HAND BRAKE " + data2.activated);
                 io.sockets.emit(StrollerLogic.EVENT.HAND_BRAKE_DATA, data2 );
            }
                 
        }else if(logic.isRemoteEnabled() && client.id == clientsList["MASTER"]){
            //console.log("master");
            io.sockets.emit("SENSOR_DATA", data );
        }
        //else if(!logic.isRemoteEnabled() && (( client.id == clientsList["RPI"] && data.id != frontSensorID) || client.id == clientsList["FRONT_SENSOR"]) ){ //zeby nie emitowac sensora 5 a arduino
        else if(!logic.isRemoteEnabled() ){
            if (data.value >= 0) //zeby nie emitowac bledow dac >= 0 !!
            {
                
                try{
                    
                    
                    if(Math.abs(data.realValue - sensorDataArr[data.id].realValue) >= MAX_DIFF && ( DISPATCH_LIMIT || data.value > 0 ) )//todo:try catch
                    {
                        sensorDataArr[data.id] = data;
                        console.log( 'sensor data retransmitting : '+ data.id + " : " + data.value + ", " +data.realValue);
                        io.sockets.emit("SENSOR_DATA", data);
                    }
                }catch(e)
                {
                    console.log(data.id + " error in sensor data" + e);
                }
            }
        }
        
        //reartraffic enabling
        if(logic.frontAssistEnabled && !logic.frontAssistActivated)
        {
            
            if((data.id == 3 || data.id == 4))
            {
                if(logic.collectFrontData(data))
                {
                    console.log("FRONT ACTIVATED " );
                    logic.frontAssistActivated = true;
                    data2 = {};
                    data2.activated = true;
                    io.sockets.emit(StrollerLogic.EVENT.BRAKE_DATA, data2 );   
                }
                
            }
            
          
        }
        
        //handBrake
        
       
            
    
     } );

    client.on( StrollerLogic.SYSTEM_SET.FRONT, ( data ) => {
        console.log( 'front assist '+ data.activated);
        io.sockets.emit(StrollerLogic.SYSTEM_SET.FRONT, data );
        if(data.activated)
            logic.enableFrontAssist(true);
        else
            logic.enableFrontAssist(false);

    } );

    client.on( StrollerLogic.SYSTEM_SET.REMOTE, ( data ) => {
        console.log( 'remote assist '+ data.activated + ", emit : " + StrollerLogic.SYSTEM_SET.REMOTE);
        io.sockets.emit(StrollerLogic.SYSTEM_SET.REMOTE, data );
        if(data.activated)
            logic.remoteEnabled = true;
        else
            logic.remoteEnabled = false;

    } );

    client.on( StrollerLogic.EVENT.BRAKE_DATA, ( data ) => {
        console.log( 'brakes '+ data.activated);
        io.sockets.emit(StrollerLogic.EVENT.BRAKE_DATA, data );
        logic.activateBrakes(data);

    } );
    
    client.on( StrollerLogic.EVENT.TEMP_DATA, ( data ) => {
            //console.log( 'temp '+ data);
        if(data != tempValue && data != null)
        {
            console.log( 'temp retransmit : '+ data);
            io.sockets.emit(StrollerLogic.EVENT.TEMP_DATA, data );
            tempValue = data;
        }
        

    } );

    client.on( StrollerLogic.EVENT.FRONT_DATA, ( data ) => {
        console.log( 'front '+ data.activated);
        io.sockets.emit(StrollerLogic.EVENT.FRONT_DATA, data );
        logic.activateFront(data);

    } );

    client.on( 'HELLO_WORLD', ( data ) => {
        console.log( 'hello world received '+ data.role );
        clientsList[data.role] = client.id;
        //client.emit("HELLO !", {})
        client.emit("HELLO_WORLD", {role:data.role, id:client.id});
        console.log("new role " + data.role + " ; " + clientsList[data.role] );

    } );



} );
