import { getGameWidth, getGameHeight } from '../helpers';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Boot',
};

/**
 * The initial scene that loads all necessary assets to the game and displays a loading bar.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    const halfWidth = getGameWidth(this) * 0.5;
    const halfHeight = getGameHeight(this) * 0.5;

    const progressBarHeight = 100;
    const progressBarWidth = 400;

    const progressBarContainer = this.add.rectangle(
      halfWidth,
      halfHeight,
      progressBarWidth,
      progressBarHeight,
      0x000000,
    );
    const progressBar = this.add.rectangle(
      halfWidth + 20 - progressBarContainer.width * 0.5,
      halfHeight,
      10,
      progressBarHeight - 20,
      0x4ba82e,
    );

    //const loadingText = this.add.text(halfWidth - 75, halfHeight - 100, 'Loading...').setFontSize(24);
    const percentText = this.add.text(halfWidth - 25, halfHeight- 5, '0%').setFontSize(24);
  //  const assetText = this.add.text(halfWidth - 25, halfHeight + 100, '').setFontSize(24);

    this.load.on('progress', (value) => {
      progressBar.width = (progressBarWidth - 30) * value;

      let percent = Math.ceil(value * 100);
      percentText.setText(`${percent}%`);
    });

  /*  this.load.on('fileprogress', (file) => {
      assetText.setText(file.key);
    });*/

    this.load.on('complete', () => {
      console.log("completed")
     // loadingText.destroy();
      percentText.destroy();
      //assetText.destroy();
      progressBar.destroy();
      progressBarContainer.destroy();

      this.scene.start('MainMenu');
    });

    this.loadAssets();
  }

  /**
   * All assets that need to be loaded by the game (sprites, images, animations, tiles, music, etc)
   * should be added to this method. Once loaded in, the loader will keep track of them, indepedent of which scene
   * is currently active, so they can be accessed anywhere.
   */
  private loadAssets() {


    // Background

    this.load.image('BG', 'assets/bg.jpg');

    // Font
    this.load.bitmapFont('skodaFont', 'assets/font/skodaNext.png', 'assets/font/skodaNext.xml');

    ///////// audio

    this.load.audio('shortBip', 'assets/audio/bip_short.mp3');
    this.load.audio('longBip', 'assets/audio/bip_long.mp3');

    // Sprites

    this.load.image('bottomBarBG', 'assets/sprites/bottomBarBG.png');
    this.load.image('tempIco', 'assets/sprites/temp_ico.png');
    this.load.image('settingsIco', 'assets/sprites/settings_ico.png');
    this.load.image('btmRollOver', 'assets/sprites/bottomMenuRollover.png');
    this.load.image('alertSign', 'assets/sprites/alert_sign.png');
    this.load.image('handBrakeSign', 'assets/sprites/handBrakeSign.png');
    this.load.image('releaseBtn', 'assets/sprites/releaseBrakes.png');
    this.load.image('sensor1ICO', 'assets/sprites/sensor1_ico.png');
    this.load.image('sensor2ICO', 'assets/sprites/sensor2_ico.png');
    this.load.image('sensor3ICO', 'assets/sprites/sensor3_ico.png');
    this.load.image('sensor4ICO', 'assets/sprites/sensor4_ico.png');
    this.load.image('sensor5ICO', 'assets/sprites/sensor5_ico.png');
    this.load.image('logo', 'assets/sprites/logo.png');
    this.load.image('cancel', 'assets/sprites/cancel.png');
    this.load.image('save', 'assets/sprites/save.png');
    this.load.image('switchON', 'assets/sprites/switch_on.png');
    this.load.image('switchOFF', 'assets/sprites/switch_off.png');
    this.load.image('serverOFF', 'assets/sprites/server_off.png');
    this.load.image('serverON', 'assets/sprites/server_on.png');
    this.load.image('vignette', 'assets/sprites/vignette.png');
    this.load.spritesheet('sensorWave', 'assets/sprites/sensorWave-spritesheet.png',{ frameWidth: 460, frameHeight: 460 });
    this.load.spritesheet('sensorBar', 'assets/sprites/sensorBar-spritesheet.png',{ frameWidth: 1070, frameHeight: 264 });

  }
}
