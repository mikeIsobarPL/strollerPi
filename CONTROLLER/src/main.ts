import * as Phaser from 'phaser';
import Scenes from './scenes';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

/*const myCustomCanvas = document.createElement('canvas');

myCustomCanvas.id = 'myCustomCanvas';
myCustomCanvas.style = 'border: 8px solid red';*/


const gameConfig: Phaser.Types.Core.GameConfig= {
  title: 'Skoda Controller',

  type: Phaser.AUTO,

  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
  },

  scene: Scenes,

  //canvas: document.getElementById('myCustomCanvas'),

  plugins: {
    scene: [{
      key: 'rexUI',
      plugin: RexUIPlugin,
      mapping: 'rexUI'
    }]
  },

  parent: 'gameHolder',
  backgroundColor: '#006600',
  transparent: true,
};

export const game = new Phaser.Game(gameConfig);

window.addEventListener('resize', () => {
  game.scale.refresh();
});

console.log("1");
