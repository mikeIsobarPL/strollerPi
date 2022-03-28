import * as Phaser from 'phaser';
import Timeout = NodeJS.Timeout;

export default class audioManager {

  private scene;
  private volume = 1.0;
  private minSensorValue = 1.0;
  private freq;
  private timer;
  private shortBip;
  private longBip;
  private timeout:Timeout;


  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initialize();
  }

  private initialize(){

    //console.log('bip!!');
    this.shortBip = this.scene.sound.add('shortBip');
    this.longBip = this.scene.sound.add('longBip', {loop: true});

    this.scene.sound.play('shortBip', { volume: this.volume });


    this.timer = this.scene.time.addEvent({
      delay: 1000,                // ms
      callbackScope: this,
      callback: this.bip,
      loop: true
    });

    this.timer.paused = true;
    this.shortBip.stop();
    this.longBip.stop();
    this.bip();
  }

  public bip(){
   // this.timeout = setTimeout(this.executeBip, 100 + this.minSensorValue*1000, this);

   // console.log('bip!!' + this.shortBip.isPlaying);
    //if(this.shortBip.isPlaying) {
      this.shortBip.play();


    //}
  }

/*  private executeBip() {

    this.shortBip.play();
    this.bip();
  }*/


  public update(val){
    this.minSensorValue = val;
    this.timer.timeScale = 1 / this.minSensorValue;

    if(this.minSensorValue <= 0.2) {
      this.timer.paused = true;
      //this.shortBip.stop();
      if(!this.longBip.isPlaying) this.longBip.play();
    } else if(this.minSensorValue <= 0.7){
      this.timer.paused = false;


      if(this.longBip.isPlaying) this.longBip.stop();

      //if(!this.shortBip.isPlaying)
       // this.shortBip.play();
    } else {
      this.timer.paused = true;
      //this.shortBip.stop();
      if(this.longBip.isPlaying) this.longBip.stop();
      //if(this.shortBip.isPlaying) this.shortBip.stop();
    }
    //console.log(this.minSensorValue);
  }


}
