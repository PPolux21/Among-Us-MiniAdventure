export default class Pause extends Phaser.Scene{

    constructor(){
        super({ key: 'Pause' });
    }

    preload(){

    }

    create(){
        var r1 = this.add.rectangle(400, 300, 520, 100, 0X000 );
        r1.setAlpha(0.8);
        this.add.text(400, 300, "PAUSA\nPresione ESC para reanudar", {fontFamily: 'InYourFaceJoffrey', fontSize: "32px", fill: "#fff", align: 'center' }).setOrigin(0.5);
        

        this.endPause = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    update(){
        if (this.endPause.isDown) {
            this.scene.resume("Nivel1"); // Reanuda la escena del juego
            this.scene.stop(); // Cierra el menú de pausa
        }
    }
}