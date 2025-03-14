export default class Level_1 extends Phaser.Scene{

    constructor() {
        super({ key: 'Nivel1' });
    }

    camera;
    player;
    stars;
    bonus;
    bombs;
    platforms;
    cursors;
    score = 0;
    live = 3;
    lives = [];
    gameOver = false;
    scoreText;
    followCamera = false;
    playerSprite = 'player2'; //localStorage.getItem("playerSprite");
    collectedBonus = false;
    soundPlayed = false;

    preload ()
    {
        this.load.image('sky', './assets/images/cafeteria_cleanup.png');
        this.load.image('heart', './assets/images/vida.png');
        this.load.image('ground', './assets/images/plataforma.png');
        this.load.image('robot', './assets/images/robot.png');
        this.load.image('pause', './assets/images/pause.png');
        this.load.image('boton', './assets/images/boton.png');
        this.load.image('imposter-der', './assets/images/impostor-derecha.png');
        this.load.image('imposter-izq', './assets/images/impostor-izquierda.png');
        this.load.spritesheet('player1', './assets/images/player1.png', { frameWidth: 78, frameHeight: 80 });
        this.load.spritesheet('player2', './assets/images/player2.png', { frameWidth: 78, frameHeight: 80 });
        this.load.audio('deathSFX', './assets/sfx/KillSFX.wav');
        this.load.audio('buttonSFX', './assets/sfx/alarm_emergencymeeting.wav');
        this.load.audio('robotSFX', './assets/sfx/Megaphone4.wav');
        this.load.audio('hitSFX', './assets/sfx/impostor_kill.wav');
    }

    create ()
    {
        this.registry.set('bonusScore', 0);
        //  A simple background for our game
        this.add.image(400, 300, 'sky').setScale(1.4).setScrollFactor(0);

        this.physics.world.setBounds(0, 0, 2250, 600);
        this.cameras.main.setBounds(0, 0, 2250, 600);

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();

        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(1200, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(2000, 568, 'ground').setScale(2).refreshBody();

        //  Now let's create some ledges
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(800, 400, 'ground');
        this.platforms.create(1500, 400, 'ground');

        this.platforms.create(50, 250, 'ground');
        this.platforms.create(1850, 250, 'ground');


        this.platforms.create(750, 220, 'ground');
        this.platforms.create(1250, 220, 'ground');

        // The player and its settings
        this.player = this.physics.add.sprite(100, 450, this.playerSprite); //liego hacer cambio de personaje

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(this.playerSprite, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: this.playerSprite, frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(this.playerSprite, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        this.cursors.esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);    

        //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
        this.stars = this.physics.add.group({
            key: 'robot',
            repeat: 23,
            setXY: { x: 12, y: 0, stepX: (50 + Phaser.Math.Between(0,40)) }
        });

        this.bonus = this.physics.add.group();

        this.stars.children.iterate((child) => {

            //  Give each star a slightly different bounce
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        this.bombs = this.physics.add.group();

        //  The score
        this.scoreText = this.add.text(670, 16, 'score: 0', { fontFamily: 'InYourFaceJoffrey', fontSize: '40px', fill: '#000' });
        this.scoreText.setScrollFactor(0);

        //vidas
        // this.lives = this.physics.add.staticGroup();
        // this.lives.create(140, 40, 'heart').setScale(1.5).refreshBody();
        // this.lives.create(90, 40, 'heart').setScale(1.5).refreshBody();
        // this.lives.create(40, 40, 'heart').setScale(1.5).refreshBody();
        for (let i=0; i<3; i++){
            this.lives[i] = this.add.image(40 * (i + 1) + (i * 10), 40, 'heart').setScale(1.5);
            this.lives[i].setScrollFactor(0);
            this.lives[i].setDepth(1);
        };

        //cooldown de vidas
        this.cooldownActive = false;
        this.cooldownTime = 2000;

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.bonus, this.platforms);

        //  Checks to see if the player overlaps with any of the this.stars, if he does call the collectStar function
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.overlap(this.player, this.bonus, this.collectBonus, null, this);

        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        this.camera = this.cameras.cameras[0];

        this.spawnedObjects = 0; 

        this.time.addEvent({
            delay: Phaser.Math.Between(8000, 15000), 
            callback: () => {
                if (this.spawnedObjects < 2) { 
                    let x = Phaser.Math.Between(150, 1900);
                    this.createBonus(x,50);
                    this.spawnedObjects++; 
                }
            },
            loop: true 
        });


        this.pause = this.add.image(400, 30, 'pause').setScrollFactor(0);

        this.pause.on('pointerdown', () => {
            if (!this.scene.isPaused()) {
                this.scene.launch("Pause");
                this.scene.pause();
            }
        });

        this.pause.setInteractive();

        this.pause.on('pointerover', () => {
            this.pause.setTint(0xc0c0c0); // Cambia el color de la imagen al pasar el mouse
        });

        this.pause.on('pointerout', () => {
            this.pause.clearTint(); // Restaura el color original al salir
        });

        this.registry.events.on('changedata', this.updateData, this);
    }

    update ()
    {
        if (this.gameOver && !this.soundPlayed)
        {
            this.sound.play('deathSFX',{ loop: false });
            this.soundPlayed = true;
        }

        if (this.gameOver) {
            return;
        }

        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);

            if (this.player.x < 195 && this.followCamera) {
                this.camera.stopFollow();
                this.followCamera = false;
            }
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);

            if (this.player.x >= 300 && !this.followCamera) {
                this.followCamera = true;
                this.camera.startFollow(this.player, true, 0.5, 0, -100, (this.player.y - 300) );
                this.camera.setDeadzone(200, 0);
            }
        }
        else
        {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-420);
        }

        
        this.bombs.children.iterate((bomb) => {
            if(bomb.body.velocity.x < 0){
                bomb.setTexture('imposter-izq');
            }else{
                bomb.setTexture('imposter-der');
            }
        });
    }

    collectStar (player, star)
    {
        star.disableBody(true, true);

        this.sound.setVolume(0.3);
        this.sound.play('robotSFX',{ loop: false });

        //  Add and update the score
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true)%6 === 0)
        {
            /*
            //  A new batch of stars to collect
            this.stars.children.iterate((child) => {

                child.enableBody(true, child.x, 0, true, true);

            });*/

            var x = (player.x < 1600) ? player.x + Phaser.Math.Between(150, 300) : player.x - Phaser.Math.Between(150, 300);
            
            if (Math.floor(Math.random() * 2)) {
                var bomb = this.bombs.create(x, 16, 'imposter-der');   
            }else{
                var bomb = this.bombs.create(x, 16, 'imposter-izq'); 
            }
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            if(bomb.body.velocity.x < 0){
                bomb.setTexture('imposter-izq');
            }else{
                bomb.setTexture('imposter-der');
            }
            bomb.allowGravity = false;
        }
        //this.sound.setVolume(1);
    }

    hitBomb (player, bomb)
    {
        if(this.cooldownActive){
            return;
        }
        
        this.sound.play('hitSFX',{ loop: false });

        this.live--;
        this.lives[this.live].destroy();

        player.setTint(0xfb7474);
        
        if(this.live <= 0){

            this.gameOver = true;

            this.physics.pause();

            player.setTint(0xff0000);

            player.anims.play('turn'); 

        }else{

            let tintChange = false;

            let tintEvent = this.time.addEvent({
                delay: 250,
                callback: () => {
                    if(tintChange){
                        player.setTint(0xd5d5d5);
                    }else{
                        player.setTint(0x6c6c6c);
                    }
                    tintChange = !tintChange;   //permite cambiar el tinte al ser activado o desactivado
                },
                repeat: 5
            });        

            this.cooldownActive = true;
            this.time.delayedCall(this.cooldownTime, () => {
                this.cooldownActive = false;
                player.clearTint();
                tintEvent.remove();
            });

        }

    }

    collectBonus(player, boton){
        boton.disableBody(true, true);

        this.sound.play('buttonSFX',{ loop: false });

        this.score += 50;
        this.scoreText.setText('Score: ' + this.score);

        this.scene.launch('Bonus');
        this.scene.pause();

        this.countdownTimer.remove();
        this.countdownText.destroy();
        this.collectedBonus = true;
    }

    updateData(parent, key, data){
        if(key === 'bonusScore'){
            this.score += data;
        }
        this.scoreText.setText('Score: ' + this.score);
    }

    createBonus(x,y){
        var botonBonus = this.bonus.create(x,y, 'boton');
        botonBonus.setBounce(0.5);

        var rect = this.add.rectangle(400, 570, 220, 50, 0X000 );
        rect.setAlpha(0.75);
        rect.setScrollFactor(0);
        var text = this.add.text(400, 570, "Un botón ha aparecido", {fontFamily: 'InYourFaceJoffrey', fontSize: "32px", fill: "#fff", align: 'center' }).setOrigin(0.5);
        text.setScrollFactor(0);

        this.countdownText = this.add.text(650, 500, "Tiempo restante: 7s", {
            fontFamily: 'InYourFaceJoffrey',
            fontSize: "32px",
            fill: "#400"
        }).setOrigin(0.5);
        this.countdownText.setScrollFactor(0);
    
        let remainingTime = 7; // Tiempo en segundos
    
        // Iniciar el contador regresivo
        this.countdownTimer = this.time.addEvent({
            delay: 1000, // Cada 1 segundo
            repeat: 6, // Se ejecuta 5 veces en total (de 5 a 0)
            callback: () => {
                remainingTime--;
                this.countdownText.setText(`Tiempo restante: ${remainingTime}s`);
            }
        });

        this.time.delayedCall(4000, () => {
            text.destroy();
            rect.destroy();
        });

        this.time.delayedCall(4500, () => {
            
            this.tweens.add({
                targets: botonBonus,
                alpha: 0,
                duration: 200,
                repeat: 5,  // Número de parpadeos
                yoyo: true  // Para que parpadee
            });
    
            
            this.time.delayedCall(2500, () => {
                if (!this.collectedBonus) {
                    let newStar = this.physics.add.sprite(botonBonus.x, botonBonus.y, 'robot');
                    this.stars.add(newStar);
                    this.collectedBonus = false;    
                }
                botonBonus.destroy();
                this.countdownText.destroy();
            });
        });
    }
}