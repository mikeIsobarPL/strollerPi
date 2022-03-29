"use strict";

const path = require( 'path' );
const express = require( 'express' );
const socketIO = require( 'socket.io' );


const RPILogic = require('./RPILogic.js');






// import LED control API
//const { toggle } = require( './led-control' );

// create an express app
/*const app = express();

// send `index.html` from the current directory
// when `http://<ip>:9000/` route is accessed using `GET` method
app.get( '/', ( request, response ) => {
    response.sendFile( path.resolve( __dirname, 'web-app/index.html' ), {
        headers: {
            'Content-Type': 'text/html',
        }
    } );
} );*/

const app = express();

// send `index.html` from the current directory
// when `http://<ip>:9000/` route is accessed using `GET` method
app.get( '/', ( request, response ) => {
    response.sendFile( path.resolve( __dirname, 'web-app/index.html' ), {
        headers: {
            'Content-Type': 'text/html',
        }
    } );
} );

const server = app.listen( 9002, () => console.log( 'Skoda Stroller rpi vid started!' ) );

var rpiLogic = new RPILogic();

/*const ws = socketIO( server, {
    cors: {
        origin: "http://127.0.0.1:8081",
        methods: ["GET", "POST"]
    },
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});




var raspividStream = require('raspivid-stream');
 
var stream = raspividStream();
 
// To stream over websockets:
stream.on('data', (data) => {
    ws.send(data, { binary: true });
});

stream.on('connect', () => {
    console.log("connection");
});*/

