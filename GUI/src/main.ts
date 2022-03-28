import * as Phaser from 'phaser';
import Scenes from './scenes';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',

  type: Phaser.AUTO,

  audio: {
    disableWebAudio: true
  },

  scale: {
    width: 2048,
    height: 1536,
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.NO_CENTER,
  },


  scene: Scenes,

  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    },
  },

  plugins: {
    scene: [{
      key: 'rexUI',
      plugin: RexUIPlugin,
      mapping: 'rexUI'
    }]
  },

  parent: 'gameHolder',
  backgroundColor: '#000000',
  transparent: true,

};

export const game = new Phaser.Game(gameConfig);

window.addEventListener('resize', () => {
  game.scale.refresh();
});
