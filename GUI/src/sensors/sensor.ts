import * as Phaser from 'phaser';

export default class Sensor {

  private x;
  private y;
  private flipHor;
  private flipVert;
  private type;
  private scene;
  private img;
  private scale;S

  public value = 1.0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: integer, flipHor: boolean, flipVert: boolean, scale: number) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.flipHor = flipHor;
    this.flipVert = flipVert;
    this.scene = scene;
    this.scale = scale;
    this.initialize();
  }

  private initialize(){

    switch(this.type) {
      case 0: {
        this.img = this.scene.add.image(this.x, this.y, 'sensorWave', 0).setOrigin(0,0);
        this.img.setAlpha(0);
        break;
      }
      case 1: {
        this.img = this.scene.add.image(this.x, this.y, 'sensorBar', 0).setOrigin(0.5,0);
        this.img.setAlpha(0);
        break;
      }
      case 2: {
        this.img = this.scene.add.image(this.x, this.y, 'sensor4ICO', 0);
        this.img.setAlpha(0);
        break;
      }
    }
    this.img.setFlip(this.flipHor, this.flipVert);
    this.img.setScale(this.scale);
  }

  public update(val){

    this.value = val;
    let v = 1-val;

    if(val > 0.9) this.img.setAlpha(0); else this.img.setAlpha(1);

    switch(this.type) {
      case 0: {
        console.log(this.value + " , " + v + " - " + Math.floor(v*6));
        let d = Math.floor(v*7);
        if(d > 6)
          d = 6;
        this.img.setTexture('sensorWave', Math.floor(d));
        break;
      }
      case 1: {
        this.img.setTexture('sensorBar', Math.floor(v*6));
        break;
      }
      case 2: {
        this.img.setAlpha(1-val);
        break;
      }
    }


  }
}
