import { MenuButton } from '../ui/menu-button';
import { Buttons } from 'phaser3-rex-plugins/templates/ui/ui-components.js'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'MainMenu',
};


export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public create(): void {

    console.log("menuscne");
    this.add.text(50, 30, 'skoda stroller controller 1.0').setFontSize(40);

    new MenuButton(this, 50, 100, 'MASTER', () => {
      this.scene.start('Master');
    });

    new MenuButton(this, 50, 200, 'SLAVE', () => {
      this.scene.start('Slave');;
    });

    new MenuButton(this, 50, 300, 'SETTINGS', () => console.log('help button clicked'));

 /*   this.load.html('nameform', 'http://192.168.1.49:8080/index.html');
    var element = this.add.dom(400, 600).createFromCache('nameform');*/
  }
}
