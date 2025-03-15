export default class Gameover extends Phaser.Scene{

    constructor(){
        super({ key: 'Gameover' });
    }

    preload(){
        this.load.image('gameover', '../assets/images/death_BG.png');
    }

    create(){
        this.add.image(400, 300, 'gameover').setScale(0.69);

        this.add.text(400, 300, "Game Over", {fontFamily: 'InYourFaceJoffrey', fontSize: "84px", fill: "#800", align: 'center' }).setOrigin(0.5);
        
        this.createButton();
    }

    update(){
        
    }

    createButton(){
        // Cuadro de continuar
        var continueRect = this.add.rectangle(400, 560, 350, 50, 0xFFFFFF);

        // Agregar texto encima
        var text = this.add.text(400, 560, "Regresar al Menu", {
        fontSize: "32px",
        fontFamily: "InYourFaceJoffrey",
        color: "#000000"
        }).setOrigin(0.5);

        continueRect.setInteractive();

        continueRect.on('pointerdown', () => {
            window.href = window.location.replace("http://localhost:8080");;
        });
    }
}