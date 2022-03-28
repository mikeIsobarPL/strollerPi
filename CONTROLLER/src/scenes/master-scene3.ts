import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';

import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { StrollerSlider } from '../ui/StrollerSlider';
import { WSConnector } from '../io/WSConnector';
import { EVENT, SYSTEM_SET } from '../io/IOhelpers';
import { MenuButton } from '../ui/menu-button';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Master',
};

export class MasterScene extends Phaser.Scene {
  public speed = 100;
  private counter = 0;

  private slider1: StrollerSlider;
  //private connection: Socket;
  private wsc: WSConnector;
  slider2: StrollerSlider;
  slider3: StrollerSlider;
  slider4: StrollerSlider;
  slider5: StrollerSlider;

  private COLOR_PRIMARY = 0x024204;
  private COLOR_LIGHT = 0x7b5e57;
  private COLOR_DARK = 0x212421;
  private controllButtons: any;
  private labels:any = {}
  private cameraOn: boolean = true;

  constructor() {
    super(sceneConfig);
    this.wsc = new WSConnector('MASTER', () => this.onConnect());
    // this.wsc.onConnect = this.onConnect;


    //this.create();
  }

  private onConnect() {
    console.log('connected master in scene ' + this.speed);
    // this.create();
  }

  private onData(data) {}

  public create(): void {
    this.wsc.connect();

    this.add.text(50, 30, 'master mode').setFontSize(40);

    this.initSliders();
    this.initButtons();

    this.controllButtons.on('button.click', function(button, index, pointer, event) {
      console.log("index ", button.name, button.acivated);
      this.emitButton(button.name, button.acivated);
    }, this);
  }

  private emitButton(name: string, acivated: boolean) {
    console.log("emitting buttton " + name +  ", " + this.labels.remoteEnabled);
    switch (name)
    {
      case this.labels.brakeActivated:
        console.log("remote enabled");
        this.wsc.emit(EVENT.BRAKE_DATA, {activated:acivated});
        break;

      case this.labels.frontActivated:
        this.wsc.emit(EVENT.FRONT_DATA, {activated:acivated});
        break;

      case this.labels.frontEnabled:
        this.wsc.emit(SYSTEM_SET.FRONT_ALERT, {activated:acivated});
        break;

      case this.labels.remoteEnabled:
        this.wsc.emit(SYSTEM_SET.REMOTE, {activated:acivated});
        break;

    }
  }

  private initSliders() {



    this.slider1 = new StrollerSlider(this, 1, 150, 300, 450, (data) => {
      this.emitSensor(1, data.value, data.realValue);
    });
    this.slider2 = new StrollerSlider(this, 2, 500, 300, 450, (data) => {
      this.emitSensor(2, data.value, data.realValue);
    });
    this.slider3 = new StrollerSlider(this, 3, 150, 220, 450, (data) => {
      this.emitSensor(3, data.value, data.realValue);
    });
    this.slider4 = new StrollerSlider(this, 4, 550, 220, 450, (data) => {
      this.emitSensor(4, data.value, data.realValue);
    });
    this.slider5 = new StrollerSlider(this, 5, 350, 150, 450, (data) => {
      this.emitSensor(5, data.value, data.realValue);
    });
  }

  private emitSensor(id: number, value: number, realValue: number) {
    console.log('emitting ' + id + ' , ' + value);
    this.wsc.emit('SENSOR_DATA', { id: id, value: value, realValue: realValue });
  }

  public update() {}

  private initButtons() {
    this.labels.frontEnabled = "FRONT ASSIST ENABLED";
    this.labels.remoteEnabled = "REMOTE ENABLED";
    this.labels.brakeActivated = "BRAKE_ACTIVATED";
    this.labels.frontActivated = "FRONT ACTIVATED";

    const CheckboxesMode = true; // False = radio mode


    let buttons = this['rexUI'].add
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

    new MenuButton(this, 50, 600, ' CAMERA', () => {
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

  private switchCamera() {
    this.cameraOn = !this.cameraOn;
    if(this.cameraOn)
      document.getElementById("videoHolder").style.display = "inline";
    else
      document.getElementById("videoHolder").style.display = "none";
  }
}
