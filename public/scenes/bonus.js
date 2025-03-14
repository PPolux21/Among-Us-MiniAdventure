export default class Bonus extends Phaser.Scene{

    constructor(){
        super({ key: 'Bonus' });
    }

    preload(){
        this.load.image('imposter-izq', './assets/images/impostor-izquierda.png');
        this.load.image('doors', './assets/images/doors.png');
        this.load.spritesheet('player1', './assets/images/player1.png', { frameWidth: 78, frameHeight: 80 });
        this.load.spritesheet('player2', './assets/images/player2.png', { frameWidth: 78, frameHeight: 80 });
    }

    create(){
        var r1 = this.add.rectangle(400, 300, 650, 500, 0X000000 );
        r1.setAlpha(0.93);
        this.add.text(400, 100, "BONUS\nExpulsa al impostor", {fontFamily: 'InYourFaceJoffrey', fontSize: "28px", fill: "#fff", align: 'center' }).setOrigin(0.5);

        this.add.image(400,450,'doors');

        var graphics = this.add.graphics();
        graphics.lineStyle(4, 0xffffff);
        graphics.strokeRect(400 - 125, 450 - 65, 250, 130); // (x, y, width, height)

        this.dropZone = this.add.zone(400, 450, 250, 130).setRectangleDropZone(250, 130);

        var crewmate1 = this.add.image(200,250,'player1',0).setInteractive();
        var crewmate2 = this.add.image(600,250,'player2',0).setInteractive();
        this.imposter = this.add.image(400,250,'imposter-izq').setInteractive();

        this.input.setDraggable(crewmate1);
        this.input.setDraggable(crewmate2);
        this.input.setDraggable(this.imposter);

        crewmate1.initialX = crewmate1.x;
        crewmate1.initialY = crewmate1.y;

        crewmate2.initialX = crewmate2.x;
        crewmate2.initialY = crewmate2.y;

        this.imposter.initialX = this.imposter.x;
        this.imposter.initialY = this.imposter.y;

        this.droppable = true;

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            
            // Si no hay otro objeto en la dropZone
            if (this.droppable) {                
                // Si se dropea en el área y es impostor
                if (Phaser.Geom.Rectangle.ContainsPoint(this.dropZone.getBounds(), gameObject) && gameObject === this.imposter) {
                    gameObject.x = 400;
                    gameObject.y = 450;
                    this.droppable = false;
                    this.registry.set('bonusScore', 30);        
                    this.input.setDraggable(crewmate1,false);
                    this.input.setDraggable(crewmate2,false);
                    this.input.setDraggable(this.imposter,false);
                    this.createButton();

                    // Si se dropea en el área y no es impostor
                } else if (Phaser.Geom.Rectangle.ContainsPoint(this.dropZone.getBounds(), gameObject) && gameObject != this.imposter) {
                    gameObject.x = 400;
                    gameObject.y = 450;
                    this.droppable = false;
                    this.registry.set('bonusScore', 0);
                    this.input.setDraggable(crewmate1,false);
                    this.input.setDraggable(crewmate2,false);
                    this.input.setDraggable(this.imposter,false);
                    this.createButton();
                    
                } else {
                    // Regresa a la posición inicial
                    gameObject.x = gameObject.initialX;
                    gameObject.y = gameObject.initialY;
                }
            }else {
                // Regresa a la posición inicial
                gameObject.x = gameObject.initialX;
                gameObject.y = gameObject.initialY;
            }
        });

        this.endPause = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    update(){
        
    }

    createButton(){
        // Cuadro de continuar
        var continueRect = this.add.rectangle(400, 560, 150, 50, 0xFFFFFF);

        // Agregar texto encima
        var text = this.add.text(400, 560, "CONTINUAR", {
        fontSize: "32px",
        fontFamily: "InYourFaceJoffrey",
        color: "#000000"
        }).setOrigin(0.5);

        continueRect.setInteractive();

        continueRect.on('pointerdown', () => {
            this.scene.resume("Nivel1");
            this.scene.stop();
        });
    }
}