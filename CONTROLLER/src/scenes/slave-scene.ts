import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';

import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { StrollerSlider } from '../ui/StrollerSlider';

import { io, Socket } from 'socket.io-client';
import { WSConnector } from '../io/WSConnector';
import { EVENT, ROLES, SYSTEM_SET } from '../io/IOhelpers';
import { MenuButton } from '../ui/menu-button';


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Slave',
};

export class SlaveScene extends Phaser.Scene {

  private COLOR_PRIMARY = 0x024204;
  private COLOR_LIGHT = 0x7b5e57;
  private COLOR_DARK = 0x212421;

  private slider1:StrollerSlider;
  private wsc:WSConnector;

  slider2: StrollerSlider;
  slider3: StrollerSlider;
  slider4: StrollerSlider;
  slider5: StrollerSlider;

  private controllButtons: any;
  private labels:any = {}
  private cameraOn: boolean = true;

  constructor() {
    super(sceneConfig);
    this.wsc = new WSConnector(ROLES.SLAVE, () => this.onConnect());
  }

  public create(): void {

    this.wsc.connect();

    this.add.text(50, 30, 'slave mode').setFontSize(40);

    this.initSliders();
    this.initButtons();
    //this.onSystemData(this.labels.remoteEnabled, {activated:true})
   // this.initVideo();
    this.initBack();
   // this.switchCamera();
    }

  private onConnect()
  {
    console.log("connected slave in scene ");

    this.wsc.addListener(SYSTEM_SET.REMOTE, (data) => this.onSystemData(SYSTEM_SET.REMOTE, data)); // zmieniono tryb remote
    this.wsc.addListener(SYSTEM_SET.FRONT_ALERT, (data) => this.onSystemData(SYSTEM_SET.FRONT_ALERT, data)); // de/aktywowano front rear assist
    this.wsc.addListener(EVENT.BRAKE_DATA, (data) => this.onSystemData(EVENT.BRAKE_DATA, data)); // włączono/wyłączono hamulce
    this.wsc.addListener(EVENT.FRONT_DATA, (data) => this.onSystemData(EVENT.FRONT_DATA, data)); // dwe/aktywowano alert rear assist

    this.wsc.addListener("SENSOR_DATA", (data) => this.onSensorData(data));
    // this.create();
  }

  private onSensorData(data) {


    if(this["slider"+data.id] != undefined)
      this["slider"+data.id].setValue(data.realValue);
  }

  private onSystemData(id:string, data) {
     this.controllButtons.setData(id, data.activated);

  }

  private initSliders()
  {
    let maxRange:number = 450;
    this.slider1 = new StrollerSlider(this, 1,150,300, maxRange, (data) => {});
    this.slider2 = new StrollerSlider(this, 2,550,300, maxRange, (data) => {});
    this.slider3 = new StrollerSlider(this, 3,150,220, maxRange, (data) => {});
    this.slider4 = new StrollerSlider(this, 4,550,220, maxRange, (data) => {});
    this.slider5 = new StrollerSlider(this, 5,350,150, maxRange, (data) => {});
  }

  private onHelloWorld(data: any) {
    console.log("I am live and kicking " + data.role + " , " + data.id);
  }

  private initButtons() {
    this.labels.frontEnabled = SYSTEM_SET.FRONT_ALERT;
    this.labels.remoteEnabled = SYSTEM_SET.REMOTE;
    this.labels.brakeActivated = EVENT.BRAKE_DATA
    this.labels.frontActivated = EVENT.FRONT_DATA;

    const CheckboxesMode = true; // False = radio mode


    var buttons = this['rexUI'].add
      .buttons({
        x: 200,
        y: 450,

        orientation: 'y',

        background: this['rexUI'].add.roundRectangle(0, 0, 0, 0, 0, this.COLOR_PRIMARY),
        buttons: [
          this.createButton(this, 'FRONT ASSIST ENABLED', this.labels.frontEnabled),
          this.createButton(this, 'REMOTE MODE ENABLED', this.labels.remoteEnabled),
          this.createButton(this, 'BRAKE ACTIVATED', this.labels.brakeActivated),
          this.createButton(this, 'FRONT ASSIST ACTIVATED', this.labels.frontActivated)
        ],

        type: CheckboxesMode ? 'checkboxes' : 'radio',
        setValueCallback: function (button, value) {
          button.getElement('icon').setFillStyle(value ? 0xacfcac : undefined);
          button.acivated = value;
        },
      })
      .layout();

    const dumpButtonStates = function () {
      if (CheckboxesMode) {
        // checkboxes
        let s = '';
        buttons.data.each(function (buttons, key, value) {
          s += `${key}:${value}\n`;
        });
        //print.setText(s);
      } else {
        // radio
        //print.setText(buttons.value);
      }
    };
    buttons.on('button.click', dumpButtonStates);

    dumpButtonStates();

    this.controllButtons = buttons;

    new MenuButton(this, 50, 600, 'CAMERA', () => {
      this.switchCamera();
    });
  }

  private createButton(scene, text, name) {
    const button = scene['rexUI'].add.label({
      width: 100,
      height: 40,
      text: scene.add.text(0, 0, text, {
        fontSize: 18,
      }),
      icon: scene.add.circle(0, 0, 10).setStrokeStyle(1, this.COLOR_DARK),
      space: {
        left: 10,
        right: 10,
        icon: 10,
      },

      name: name,
    });

    return button;
  }

  private initVideo() {

        /*var jsmpeg = require('jsmpeg');
        var canvas = document.getElementById('videoCanvas');
        var player = new jsmpeg('file.mpeg', {canvas: canvas, autoplay: true, loop: true});*/

    // Show loading notice
    // @ts-ignore
    var canvas = document.getElementById('videoCanvas');
    // @ts-ignore
    var ctx = canvas.getContext('2d');
    // @ts-ignore
    ctx.fillStyle = '#444';
    // @ts-ignore
    ctx.fillText('Loading...', canvas.width/2-30, canvas.height/3);

    // Setup the WebSocket connection and start the player
    var jsmpeg = require('jsmpeg');
    var client = new WebSocket('ws://' +"192.168.1.49" + ':8084/');
    var player = new jsmpeg(client, {canvas:canvas});
    player.play();

    /*var width = window.innerWidth, height = window.innerHeight;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';*/

    //  player.pause();
    //player.play();
    //player.stop();
  }

  private initBack() {
    var div = document.getElementById('videoHolder');
    console.log("DIV " + div);

    div.style.background = 'url(assets/sprites/anna.png)';


  }

  private switchCamera() {
    this.cameraOn = !this.cameraOn;
    if(this.cameraOn)
      document.getElementById("videoHolder").style.display = "inline";
    else
      document.getElementById("videoHolder").style.display = "none";
  }
}
