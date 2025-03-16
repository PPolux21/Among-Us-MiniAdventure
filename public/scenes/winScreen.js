export default class Win extends Phaser.Scene{

    constructor(){
        super({ key: 'WinScreen' });
    }

    preload(){
        this.load.image('victory', '../assets/images/victory.png');
        this.load.video('imposter-is-sus', '../assets/video/AMONG-US-DANCE.mp4');
    }

    create(){
        var jugadores = JSON.parse(localStorage.getItem("players"));
        var playerSprite = jugadores[jugadores.length - 1].player;
        var playerName = jugadores[jugadores.length - 1].name;

        this.registry.get('score')

        this.add.image(400, 300, 'victory').setScale(0.64);

        this.video = this.add.video(200, 350, 'imposter-is-sus').setScale(0.15);
        this.video.setVolume(0.15);
        this.video.setLoop(true);
        this.video.play(true);

        var color;

        if (playerSprite === "player1") {
            color = "#ff0";
        }else{
            color = "#f0f";        
        }

        this.add.text(550, 310,"Player: " + playerName , {fontFamily: 'InYourFaceJoffrey', fontSize: "45px", fill: color, align: 'left' }).setOrigin(0.5);

        this.add.text(550, 385,"Score: " + this.registry.get('score') , {fontFamily: 'InYourFaceJoffrey', fontSize: "45px", fill: color, align: 'left' }).setOrigin(0.5);
        
        this.createButton();
    }

    update(){
        
    }

    createButton(){
        // Cuadro de continuar
        var continueRect = this.add.rectangle(400, 580, 200, 40, 0xFFFFFF);

        // Agregar texto encima
        var text = this.add.text(400, 580, "Regresar al Menu", {
        fontSize: "32px",
        fontFamily: "InYourFaceJoffrey",
        color: "#000000"
        }).setOrigin(0.5);

        continueRect.setInteractive();

        continueRect.on('pointerdown', () => {
            window.location.replace("http://localhost:8080");
        });
    }
}