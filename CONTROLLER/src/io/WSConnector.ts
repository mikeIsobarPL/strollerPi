import { io, Socket } from 'socket.io-client';
import * as os from 'os';




export class WSConnector {

  static setURL():string
  {
    var opsys = window.location.hostname;
    console.log("!---- OPSYS " + window.location.hostname);

    if (opsys.indexOf("local") > 0) {

      return "http://strollerPi.local:9000";
    } else{
      return "http://strollerPi:9000";
    }

  }

  static SERVER_URL = WSConnector.setURL();

  public role: string;
  public id: string;
  private target: any;
  private connection: Socket;
  private isConnectionActive: boolean;
  private onConnect;


  constructor(role: string, onConnect?: () => void) {
    //this.target = target;
    this.role =  role;
    this.onConnect = onConnect;
  }

  public connect()
  {

    this.connection = io( WSConnector.SERVER_URL);

    console.log("connecting");
    this.connection.on( 'connect', this.onConnect);

    this.connection.on("HELLO_WORLD", (data) => {
      console.log("hello world in controller " + this.connection);
      this.onHelloWorld(data);
    });

    this.connection.on( 'connect', () => {
      this.isConnectionActive = true;
      this.connection.emit("HELLO_WORLD", {role:this.role});
    });

    this.connection.on( 'disconnect', () => {
      this.isConnectionActive = false;
      console.log("!!! disconnected")
    } );
  }


  private onHelloWorld(data: any) {

  }

  public addListener(id:string, handler:any)
  {
    console.log("adding Listener " + id);
    this.connection.on(id, (data) => handler(data));
  }

  public emit(id: string, data: Object) {
    console.log("wsc emiiting " + id);
    this.connection.emit(id, data);
  }
}
