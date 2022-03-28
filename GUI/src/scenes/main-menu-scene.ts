import { MenuButton } from '../ui/menu-button';
import * as Phaser from 'phaser';
import {
  getGameWidth,
  getGameHeight
} from '../helpers';
import Sensor from '../sensors/sensor';
import { WSConnector } from '../io/WSConnector';
import { EVENT, ROLES, SYSTEM_SET } from '../io/IOhelpers';
// import destroy = Phaser.Loader.FileTypesManager.destroy;

import BaseSound = Phaser.Sound.BaseSound;

import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { Slider } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import { StrollerSlider } from '../ui/StrollerSlider';
import sensor from '../sensors/sensor';
import audioManager from '../sensors/audioManager';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'MainMenu',
};

/**
 * The initial scene that starts, shows the splash screens, and loads the necessary assets.
 */
export class MainMenuScene extends Phaser.Scene {

  private music:BaseSound;

  private systemState = 1; // 0 - alert , 1 - idle, 2 - area view, 3 - Rear traffic, 4 - settings, 5 - hand brake
  private changeStateTo = 1;
  private autoholdStateOn = true;
  private blindStateOn = false;
  private audioManager;

  private stateName;

  // private slider1: StrollerSlider;
  private btn0;
  private btn1;
  private btn2;
  private btn3;

  private sensorsArr = [];
  private stateContainer;


  private bg;
  private vignette;
  private date;
  private currentDate;
  private logo;
  private slider;

  private tempTxt;
  private tempIco;
  private areaTxt;
  private rearTxt;
  private setTxt;
  private setIco;

  private clockSize = 280;
  private clockGraphics;
  private currentTemp = 25;
  private serverInfo;
  private wsc:WSConnector;

  private cameraOn: boolean = true;
  private handBrakeSign: Phaser.GameObjects.Image;
  private alertSign: Phaser.GameObjects.Image;
  private alertBtn: Phaser.GameObjects.Image;
  private warningContainer: Phaser.GameObjects.Container;
  private warningsState:number = 0;

  private connectionAlive:boolean = false;

  constructor() {
    super(sceneConfig);

    console.log("main menu");
  }

  public create(): void {

    if(!this.blindStateOn)
      this.sound.mute = true;

    console.log("creating main menu");
    this.wsc = new WSConnector(ROLES.GUI, () => this.onConnect(), () => this.onDisconnect());
    this.wsc.connect();

    this.bg = this.add.image(getGameWidth(this) / 2, getGameHeight(this) / 2, 'BG');
    this.vignette = this.add.image(getGameWidth(this) / 2, getGameHeight(this) / 2, 'vignette');
    this.vignette.setVisible(false);

    this.clockGraphics = this.add.graphics({ x: 0, y: 0 });
    this.drawBottomMenu();

    this.stateName = this.add.bitmapText(0,0, 'skodaFont', '',20);
    this.stateContainer = this.add.container(0, 0);
    this.initWarnings();

    this.logo = this.add.image(getGameWidth(this)/2, getGameHeight(this)/2 - 400, 'logo').setOrigin(0.5,0.5);

    this.serverInfo = this.add.image(getGameWidth(this)/2, getGameHeight(this) - 250, 'serverOFF').setOrigin(0.5,0.5);

    //5,4,1,3,2 - taka ma jest kolejnosc
    this.sensorsArr.push(new Sensor(this, 150,getGameHeight(this) - 320, 2, true,false, 1));
    this.sensorsArr.push(new Sensor(this, getGameWidth(this) - 150,getGameHeight(this) - 320, 2, false,false, 1));
    this.sensorsArr.push(new Sensor(this, 20,20,0, false, false, 0.7));
    this.sensorsArr.push(new Sensor(this, getGameWidth(this) - 342,20,0,true,false, 0.7));
    this.sensorsArr.push(new Sensor(this, getGameWidth(this)/2,20,1,false,false, 0.7));

    this.audioManager = new audioManager(this);

  }

  private initWarnings() {
    this.warningContainer =  this.add.container(0, 0);
    this.warningContainer.visible = true;
    this.handBrakeSign =     this.add.image(getGameWidth(this) / 2, getGameHeight(this) / 2 - 100, 'handBrakeSign').setScale(0.7,0.7).setOrigin(0.5,0.5)
    this.alertSign =     this.add.image(getGameWidth(this) / 2, getGameHeight(this) / 2 - 200, 'alertSign').setScale(0.7,0.7).setOrigin(0.5,0.5)
    this.alertBtn =     this.add.image(getGameWidth(this) / 2, getGameHeight(this) / 2 + 300, 'releaseBtn').setOrigin(0.5,0.5);

    this.warningContainer.add(this.alertBtn);
    this.warningContainer.add(this.handBrakeSign);
    this.warningContainer.add(this.alertBtn);

    this.alertBtn.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.wsc.emit(EVENT.BRAKE_DATA, {activated:0});
      this.changeStateTo = 1;
      this.wsc.emit(EVENT.BRAKE_DATA, {activated:0});

      this.changeSystemState();
      this.wsc.emit(EVENT.BRAKE_DATA, {activated:0});


    });

    this.clearWarnings();
  }

  private onDisconnect()
  {
    console.log("DISCONECCTED")
    this.serverInfo.setTexture('serverOFF');
  }

  private onConnect()
  {

    console.log("connected GUI in scene");
    this.serverInfo.setTexture('serverON');

    this.wsc.addListener(SYSTEM_SET.REMOTE, (data) => this.onSystemData(SYSTEM_SET.REMOTE, data)); // zmieniono tryb remote
    this.wsc.addListener(SYSTEM_SET.FRONT_ALERT, (data) => this.onSystemData(SYSTEM_SET.FRONT_ALERT, data)); // de/aktywowano front rear assist
    this.wsc.addListener(EVENT.BRAKE_DATA, (data) => this.onSystemData(EVENT.BRAKE_DATA, data)); // włączono/wyłączono hamulce awaryjnie
    this.wsc.addListener(EVENT.HAND_BRAKE_DATA, (data) => this.onHandBrakeData(EVENT.HAND_BRAKE_DATA, data)); // włączono/wyłączono hamulce
    this.wsc.addListener(EVENT.FRONT_DATA, (data) => this.onSystemData(EVENT.FRONT_DATA, data)); // de/aktywowano alert rear assist
    this.wsc.addListener(EVENT.SENSOR_DATA, (data) => this.onSensorData(data));
    this.wsc.addListener(EVENT.TEMP_DATA, (data) => this.onTempData(data));
    //this.create();
  }

  private onSensorData(data) {

    if(data.id <=5)
    {
      this.sensorsArr[data.id-1].update(data.value);
      let min = 1.0;
      for(let i = 2; i < 5; i++){
        min = Math.min(this.sensorsArr[i].value, min);
      }
      this.audioManager.update(min);
    }

  }

  private onTempData(data) {

    if(!isNaN(data))
      this.tempTxt.text = data + "° C";
    else
      this.tempTxt.text = "? ° C";
  }

  private onSystemData(id:string, data) {

    console.log(id, data.activated);
    if(id == 'BRAKE_DATA' && data.activated){

      this.showAlertSign();
    } else if(id == 'BRAKE_DATA' && !data.activated){
      this.removeAlertSign();

    }
  }

  private onHandBrakeData(id:string, data) {
    //this.controllButtons.setData(id, data.activated);
    console.log("!!! HAND BRAKE " +  data.activated);
    if(this.changeStateTo != 0) {
      if (data.activated) {
     //   this.changeStateTo = 5;
       // this.changeSystemState();
        this.showHandBrakeSign();
      } else {
        //this.changeStateTo = 1;
        //this.changeSystemState();
        this.removeHandBrakeSign();
      }
    }
  }

  public update(): void
  {

    this.clockGraphics.clear();
    if(this.currentDate) this.currentDate.destroy();
    if(this.systemState == 1 ) {
      this.drawClock(getGameWidth(this) / 2, getGameHeight(this) / 2);
      this.checkConnection();
      if(this.warningsState == 0) //todo fix this ?
      {
        this.logo.setVisible(true);
        this.currentDate.setVisible(true);
        this.clockGraphics.setVisible(true);
      }else
      {
        this.logo.setVisible(false);
        this.currentDate.setVisible(false);
        this.clockGraphics.setVisible(false);
      }
      this.serverInfo.setVisible(true);
    }
  }

  public drawBottomMenu (){

    let bar = this.add.image(getGameWidth(this) / 2, getGameHeight(this), 'bottomBarBG').setOrigin(0.5, 1);

    /// Temp / fullscreen

    let halfHeight = getGameHeight(this) - bar.height + bar.height/2
    let halfWidth = getGameWidth(this)/4/2;

    this.tempIco = this.add.image(halfWidth - 70, halfHeight, 'tempIco').setOrigin(0.5,0.5);
    this.tempTxt = this.add.bitmapText(halfWidth + 30, halfHeight, 'skodaFont', '25° C', 40).setOrigin(0.5, 0.5).setLeftAlign();

    /// Area view
    halfWidth = getGameWidth(this)/4/2 + getGameWidth(this)/4;
    this.btn1 = this.add.image(halfWidth, halfHeight, 'btmRollOver').setOrigin(0.5, 0.5);
    this.btn1.displayWidth = getGameWidth(this)/4;
    this.btn1.setAlpha(0.01);
    this.btn1.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      if (this.systemState != 0) {
        this.changeStateTo = 2;
        this.changeSystemState();

      }
    });
    this.areaTxt = this.add.bitmapText(halfWidth, halfHeight, 'skodaFont', 'AREA VIEW', 40).setOrigin(0.5, 0.5).setCenterAlign().setAlpha(1);

    /// Rear traffic alert
    halfWidth = getGameWidth(this)/4/2 + getGameWidth(this)/4*2;
    this.btn2 = this.add.image(halfWidth, halfHeight, 'btmRollOver').setOrigin(0.5, 0.5);
    this.btn2.displayWidth = getGameWidth(this)/4;
    this.btn2.setAlpha(0.01);
    this.btn2.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      console.log("REARE TRAFFFIX ENABLING");
      if(this.systemState != 3)
        this.wsc.emit(SYSTEM_SET.FRONT_ALERT, {activated:1});
      else
        this.wsc.emit(SYSTEM_SET.FRONT_ALERT, {activated:0});

      if (this.systemState != 0) {
        this.changeStateTo = 3;
        this.changeSystemState();
      }
    });
    this.rearTxt = this.add.bitmapText(halfWidth, halfHeight, 'skodaFont', 'TRAFFIC ALERT', 40).setOrigin(0.5, 0.5).setCenterAlign().setAlpha(1);

    /// Settings
    halfWidth = getGameWidth(this)/4/2 + getGameWidth(this)/4*3;
    this.btn3 = this.add.image(halfWidth, halfHeight , 'btmRollOver').setOrigin(0.5, 0.5);
    this.btn3.displayWidth = getGameWidth(this)/4;
    this.btn3.setAlpha(0.01);
    this.btn3.setInteractive({ useHandCursor: true }).on('pointerdown', () => {


      if (this.systemState != 0) {

        this.changeStateTo = 4;
        this.changeSystemState();


      }
    });
    this.setTxt = this.add.bitmapText(halfWidth + 20, halfHeight, 'skodaFont', 'USTAWIENIA', 40).setOrigin(0.5, 0.5).setCenterAlign();
    this.setIco = this.add.image(halfWidth - 130, halfHeight, 'settingsIco').setOrigin(0.5,0.5);

    let graphics = this.add.graphics({ x: 0, y: getGameHeight(this) - bar.height });
    graphics.lineStyle(2, 0xffffff, 0.2);
    for(let i = 0; i < 3; i++){
      let x = getGameWidth(this)/4 * (i+1);
      graphics.lineBetween(
        x, 35,
        x, 135
      );

    }
  }
  public showAreaView(){
    //this.stateContainer.add(this.add.bitmapText(getGameWidth(this) / 2, 200, 'skodaFont', "AREA VIEW", 60).setOrigin(0.5, 0.5).setCenterAlign());
    this.areaTxt.tint = 0x075711;
  }

  public showRearTraffic(){
    //this.stateContainer.add(this.add.bitmapText(getGameWidth(this) / 2, 200, 'skodaFont', "REAR TRAFFIC ALERT", 60).setOrigin(0.5, 0.5).setCenterAlign());
    this.rearTxt.tint = 0x075711;
  }

  public showSettings(){
    this.stateContainer.add(this.add.bitmapText(getGameWidth(this) / 2, 300, 'skodaFont', "USTAWIENIA", 60).setOrigin(0.5, 0.5).setCenterAlign());
    this.setTxt.tint = 0x075711;
    this.setIco.tint = 0x075711;

    ///////// AUTO HOLD

    let autoholdBtn = this.add.image(350, getGameHeight(this) / 2 - 200, 'switchOFF').setOrigin(0.5,0.5);
    if (this.autoholdStateOn) autoholdBtn.setTexture('switchON'); else autoholdBtn.setTexture('switchOFF');

    autoholdBtn.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      if (this.autoholdStateOn) {
        autoholdBtn.setTexture('switchOFF');
        this.autoholdStateOn = false;
      } else {
        autoholdBtn.setTexture('switchON');
        this.autoholdStateOn = true;
      }
    });
    this.stateContainer.add(autoholdBtn);
    this.stateContainer.add(this.add.bitmapText(480, getGameHeight(this) / 2 - 200, 'skodaFont', "AUTO HOLD", 60).setOrigin(0, 0.5).setCenterAlign());

    ///////// SOUND

    let soundBtn = this.add.image(350, getGameHeight(this) / 2 - 50, 'switchOFF').setOrigin(0.5,0.5);
    if (this.blindStateOn) soundBtn.setTexture('switchON'); else soundBtn.setTexture('switchOFF');

    soundBtn.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      if (this.blindStateOn) {
        soundBtn.setTexture('switchOFF');
        this.blindStateOn = false;
        this.sound.mute = true;

      } else {
        soundBtn.setTexture('switchON');
        this.blindStateOn = true;
        this.sound.mute = false;

      }
    });
    this.stateContainer.add(soundBtn);
    this.stateContainer.add(this.add.bitmapText(480, getGameHeight(this) / 2 - 50, 'skodaFont', "DŹWIĘK", 60).setOrigin(0, 0.5).setCenterAlign());

    ///////// SAVE BUTTON

    // let saveBtn = this.add.image(getGameWidth(this) / 2 - 250, getGameHeight(this) / 2 + 300, 'save').setOrigin(0.5,0.5);
    // saveBtn.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
    //   console.log("save settings");
    //   this.changeStateTo = 1;
    //   this.changeSystemState();
    // });
    // this.stateContainer.add(saveBtn);

    ///////// CANCEL BUTTON

    // let cancelBtn = this.add.image(getGameWidth(this) / 2 + 250, getGameHeight(this) / 2 + 300, 'cancel').setOrigin(0.5,0.5);
    // cancelBtn.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
    //   console.log("cancel settings");
    //   this.changeStateTo = 1;
    //   this.changeSystemState();
    // });
    // this.stateContainer.add(cancelBtn);
  }

  private showAlertSign(){

    //this.warningContainer.add(this.alertSign);
    //this.warningContainer.add(this.alertBtn);
    this.clearWarnings();
    this.alertSign.visible = true;
    this.alertBtn.visible = true;
    this.switchClock(false);
  }

  private removeAlertSign(){
   // this.clearWarnings();
    //this.warningContainer.remove(this.alertSign);
    //this.warningContainer.remove(this.alertBtn);
    this.clearWarnings();
  }

  private showHandBrakeSign(){
    this.clearWarnings();

    console.log("show hand brake");
    //this.warningContainer.add(this.handBrakeSign);
    this.handBrakeSign.visible = true;
    this.switchClock(false);
  }

  private switchClock(on:boolean)
  {
    if(on)
      this.warningsState = 0;
    else
      this.warningsState = 1;

    if(this.systemState == 1) {

      console.log("switching clock "  + on);
      this.clockGraphics.visible = on;

      if(this.logo != undefined)
      {
        this.logo.visible = on;

        console.log("LOGO "  + this.logo);
        console.log("LOGO "  + this.logo.visible);
      }
      // .visible = false;

      if(this.currentDate != undefined)
        this.currentDate.visible = on;

    }
  }

  private removeHandBrakeSign(){
    console.log("remove hand brake");
    //this.warningContainer.remove(this.handBrakeSign);
    if(this.handBrakeSign.visible)
      this.clearWarnings();
  }

  public clearWarnings()
  {


    this.alertBtn.visible = false;
    this.alertSign.visible = false;
    this.handBrakeSign.visible = false;

    this.switchClock(true);
  }

  /*public showAlertBrakeSign(){
    this.warningContainer.add(this.handBrakeSign);
  }

  public removeAlertBrakeSign(){
    this.warningContainer.remove(this.handBrakeSign);
  }*/

  public drawClock (x, y)
  {

    let d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();
    let s = d.getSeconds();

    let angle;
    let dest;
    let p1;
    let p2;
    let size;


    // Current day

    this.date = new Date();

    if(this.warningsState == 0){
      let options = { weekday: 'short', month: 'short', day: 'numeric' };
      this.currentDate = this.date.toLocaleString('pl-PL', options)

      this.currentDate = this.add.bitmapText(x, y + 150, 'skodaFont', this.currentDate, 52).setOrigin(0.5, 0.5).setCenterAlign();
      this.currentDate.tint = 0xffffff;
    }






    //  The frame
    this.clockGraphics.lineStyle(2, 0xffffff, 1);
    this.clockGraphics.strokeCircle(x, y, this.clockSize);

      size = this.clockSize * 0.6;

      if(h > 12) h -=12;
      angle = (360 * h/12) - 90 + 30 * m/60;
      dest = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle), size);

      this.clockGraphics.lineStyle(6, 0xffffff, 1);
      this.clockGraphics.beginPath();
      this.clockGraphics.moveTo(x, y);

      this.clockGraphics.lineTo(dest.x, dest.y);

      this.clockGraphics.strokePath();
      this.clockGraphics.closePath();


    //  Minute hand
    size = this.clockSize * 0.9;

    angle = (360 * m/60) - 90;
    dest = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle), size);

    this.clockGraphics.lineStyle(2, 0xffffff, 1);
    this.clockGraphics.beginPath();

    this.clockGraphics.moveTo(x, y);
    this.clockGraphics.lineTo(dest.x, dest.y);

    this.clockGraphics.strokePath();
    this.clockGraphics.closePath();

    //  Seconds hand
    size = this.clockSize * 0.9;

    angle = (360 * s/60) - 90;
    dest = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle), size);

    this.clockGraphics.lineStyle(1, 0xffffff, 1);
    this.clockGraphics.beginPath();

    this.clockGraphics.moveTo(x, y);
    this.clockGraphics.lineTo(dest.x, dest.y);

    this.clockGraphics.strokePath();
    this.clockGraphics.closePath();

    this.clockGraphics.lineStyle(2, 0xffffff, 1.0);
    this.clockGraphics.fillStyle(0x222222, 1.0);

    this.clockGraphics.fillCircle(x, y, 6);
    this.clockGraphics.strokeCircle(x, y, 6);

    //r2.setStrokeStyle(2, 0xffffff);
  }

  public changeSystemState (){

    this.btn1.setAlpha(0.01);
    this.btn2.setAlpha(0.01);
    this.btn3.setAlpha(0.01);

    this.areaTxt.tint = 0xffffff;
    this.rearTxt.tint = 0xffffff;
    this.setTxt.tint = 0xffffff;
    this.setIco.tint = 0xffffff;

    let arr = this.stateContainer.getAll();  //// removeAll() nie usuwa interaktywnych
    for(let i = 0; i < arr.length; i++){
      arr[i].destroy();
    }

    document.getElementById("videoHolder").style.display = "none";
    this.bg.setVisible(true);
    this.vignette.setVisible(false);

    if(this.systemState != this.changeStateTo){
      switch (this.changeStateTo){
        case 0:
          this.showAlertSign();
          this.logo.setVisible(false);
          this.serverInfo.setVisible(false);
          break;
        case 2:
          this.btn1.setAlpha(1); /// Area view
          this.showAreaView();
          document.getElementById("videoHolder").style.display = "inline";
          this.bg.setVisible(false);
          this.vignette.setVisible(true);
          this.logo.setVisible(false);
          this.serverInfo.setVisible(false);
          break;
        case 3:
          this.btn2.setAlpha(1); /// Rear traffic alert
          this.showRearTraffic();
          document.getElementById("videoHolder").style.display = "inline";
          this.bg.setVisible(false);
          this.vignette.setVisible(true);
          this.logo.setVisible(false);
          this.serverInfo.setVisible(false);
          break;
        case 4:
          this.btn3.setAlpha(1); /// Settings
          this.showSettings();
          this.logo.setVisible(false);
          this.serverInfo.setVisible(false);
          break;
        case 5:
          this.showHandBrakeSign();
          this.logo.setVisible(false);
          this.serverInfo.setVisible(false);
          break;
      }
      this.systemState = this.changeStateTo;
    } else {
      this.systemState = 1;
    }
  }
  private switchCamera() {
    this.cameraOn = !this.cameraOn;
    if (this.cameraOn){
      document.getElementById("videoHolder").style.display = "inline";
      this.bg.setVisible(false);

    } else {
      document.getElementById("videoHolder").style.display = "none";
      this.bg.setVisible(true);
    }
  }


  private checkConnection() {
    if(this.wsc.checkConnection() != this.connectionAlive){
      this.connectionAlive = this.wsc.checkConnection();
      if(this.connectionAlive)
        this.serverInfo.setTexture('serverON');
      else
        this.serverInfo.setTexture('serverOFF');


    }
  }
}
