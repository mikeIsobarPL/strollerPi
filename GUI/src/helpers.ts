import * as Phaser from 'phaser';

export const getGameWidth = (scene: Phaser.Scene): number => {
  if(scene.scale.scaleMode == Phaser.Scale.FIT) {
    return scene.game.scale.width;
  }else
  {
    return scene.scale.parentSize.width * scene.scale.displayScale.x
  }
};

export const getGameHeight = (scene: Phaser.Scene): number => {
  if(scene.scale.scaleMode == Phaser.Scale.FIT) {
    return scene.game.scale.height;
  }else
  {
    return scene.scale.parentSize.height * scene.scale.displayScale.y;
  }
};