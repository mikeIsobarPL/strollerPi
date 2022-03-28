import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';

import Vector2 = Phaser.Math.Vector2;


import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  public speed = 100;

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;



  private dentsiaki: Phaser.Physics.Arcade.Group;



  private counter:Number = 0;
  private goalTemp: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // Add a player sprite that can be moved around. Place him in the middle of the screen.
    console.log("start");





    this.initSliders();
  }

  private initSliders()
  {
    const COLOR_PRIMARY = 0x4e342e;
    const COLOR_LIGHT = 0x7b5e57;
    const COLOR_DARK = 0x260e04;

    var print0 = this.add.text(0, 0, '');

    var slider = this["rexUI"].add.slider({
      x: 200,
      y: 300,
      width: 200,
      height: 20,
      orientation: 'x',

      track: this["rexUI"].add.roundRectangle(0, 0, 0, 0, 6, COLOR_DARK),
      // @ts-ignore
      thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),

      valuechangeCallback: function (value) {
        print0.text = value;
      },
      space: {
        top: 4,
        bottom: 4
      },
      input: 'drag', // 'drag'|'click'
    })
      .layout();

    slider.on('valuechange', function(newValue, oldValue, slider){
      console.log("val " + newValue)
    }, this);

    slider.setValue(1);
    slider.x = 500;
    slider.layout();


  }

  public update()
  {

  }


}
