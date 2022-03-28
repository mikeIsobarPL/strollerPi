"use strict";

const path = require( 'path' );
const express = require( 'express' );
const socketIO = require( 'socket.io' );


const Termometer = require('./Termometer.js');


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

const server = app.listen( 9003, () => console.log( 'Skoda Stroller rpi vid started!' ) );

var term = new Termometer();

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

