import * as Phaser from 'phaser';
import { Slider } from 'phaser3-rex-plugins/templates/ui/ui-components.js'




export class StrollerSlider {



  private text: string;


  static COLOR_PRIMARY = 0x024204;
  static COLOR_LIGHT = 0x7b5e57;
  static COLOR_DARK = 0x212421;

  static padding = 10;
  private id: number;

  public label: Phaser.GameObjects.Text;
  public slider;
  private margin:number
  private maxRange: number;
  private y: number;
  private x: number;
  private onChange?: (value) => void;
  private scene: Phaser.Scene;
  private valueNow:number;

  constructor(scene: Phaser.Scene, id:number, x:number, y:number, maxRange:number, onChange?: (data) => void ) {
    this.maxRange = maxRange;
    this.id = id;
    this.text = "SENSOR " + this.id.toString();

    this.y = y;
    this.x = x;
    this.onChange = onChange;
    this.scene = scene;
    console.log("slider start 2 " + this.scene);
    this.scene.add.text(this.x-100, this.y, this.text);
    this.label = this.scene.add.text(this.x+250 ,this.y, "0");

    this.create();

  }

  public create():void
  {
    console.log("creating slider " + this.scene);
 // this.scene.add.text(this.x, this.y, this.text);

    let INSTANCE = this;

    this.slider =  this.scene["rexUI"].add.slider({
      x: this.x + 100,
      y: this.y+ 10,
      width: 200,
      height: 20,
      orientation: 'x',

      track: this.scene["rexUI"].add.roundRectangle(0, 0, 0, 0, 6, StrollerSlider.COLOR_DARK),
      // @ts-ignore
      thumb: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 8, StrollerSlider.COLOR_LIGHT),

      valuechangeCallback: function (value) {
        //console.log("callback");
        INSTANCE.onChange({ id:INSTANCE.id, value:value, realValue:value*INSTANCE.maxRange });
        INSTANCE.valueNow = value;
        INSTANCE.label.text = (value * INSTANCE.maxRange).toString();
      },
      space: {
        top: 4,
        bottom: 4
      },
      input: 'drag', // 'drag'|'click'
    })
      .layout();

    this.setValue(1);

   /* this.slider.on('valuechange', function(newValue, oldValue, slider){
      console.log("val " + newValue)
    }, this);*/
  }


  public setValue(value: number) {
    console.log("setting val to slider "  + value);

    if(value == 1)
    {
      this.slider.setValue(0);
    } else if(value > this.maxRange) {
      this.slider.setValue(this.maxRange);
    }
    else if(value > 1)
    {
      let v = value / this.maxRange;

      this.slider.setValue(value/this.maxRange);
    }

  }

  public getRealValue() {
    return this.maxRange*this.valueNow;
  }
}
