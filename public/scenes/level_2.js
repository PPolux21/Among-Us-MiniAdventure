export default class Level_2 extends Phaser.Scene{

    constructor(){
        super({ key: 'Nivel2' });
    }

    camera;
    player;
    stars;
    bombs;
    platforms;
    invinciblePlatforms;
    cursors;
    score = 0;
    live = 3;
    lives = [];
    gameOver = false;
    scoreText;
    followCamera = false;
    isPaused = false;
    healthBar;
    healthBar_x = 200;
    healthBar_y = 570;
    maxHealth = 100;
    currentHealth = 100;
    bossVelocity = 50;
    bossCollision;
    greenColor = "0x00ff00";
    yellowColor = "0xffff00";
    redColor = "0xff0000";

    preload(){
        this.load.image('sky', './assets/images/cafeteria_cleanup.png');
        this.load.image('heart', './assets/images/vida.png');
        this.load.image('ground', './assets/images/plataforma.png');
        this.load.image('robot', './assets/images/robot.png');
        this.load.image('pause', './assets/images/pause.png');
        this.load.image('imposter-der', './assets/images/impostor-derecha.png');
        this.load.image('imposter-izq', './assets/images/impostor-izquierda.png');
        this.load.spritesheet('player1', './assets/images/player1.png', { frameWidth: 78, frameHeight: 80 });
        this.load.spritesheet('player2', './assets/images/player2.png', { frameWidth: 78, frameHeight: 80 });
        this.load.audio('deathSFX', './assets/sfx/KillSFX.wav');
        this.load.audio('robotSFX', './assets/sfx/Megaphone4.wav');
        this.load.audio('hitSFX', './assets/sfx/impostor_kill.wav');
    }

    create(){
        this.add.image(400, 300, 'sky').setScale(1.4).setScrollFactor(0);       //fondo

        this.physics.world.setBounds(0, 0, 800, 600);
        this.cameras.main.setBounds(0, 0, 800, 600);

        this.platforms = this.physics.add.staticGroup();        //grupo de las plataformas
        this.invinciblePlatforms = this.physics.add.staticGroup();

        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();            //piso
        
        //plataformas
        this.platforms.create(750, 400, 'ground');
        this.platforms.create(850, 250, 'ground');
        this.platforms.create(50, 400, 'ground');
        this.platforms.create(-50, 250, 'ground');

        this.invinciblePlatforms.create(400, 150, 'ground').setVisible(false);
        this.invinciblePlatforms.create(0, 100, 'ground').setVisible(false);
        this.invinciblePlatforms.create(800, 100, 'ground').setVisible(false);

        this.bossEnemy = this.physics.add.sprite(400, 50, 'imposter-der').setScale(2);
    
        this.player = this.physics.add.sprite(100, 450, 'player2');     //definiendo al personaje

        this.player.setBounce(0.2);                 //se define el pequeño salto
        this.player.setCollideWorldBounds(true);    //fisica del personaje para chocar con los objetos

        //deteccion del movimiento del personaje
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player2', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'player2', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player2', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        //movimiento del enemigo
        this.bossEnemy.setVelocity(this.bossVelocity, 0);
        this.bossEnemy.setBounceX(1);

        this.cursors = this.input.keyboard.createCursorKeys();      //eventos del teclado

        this.cursors.esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);    

        //colleccionables
        this.stars = this.physics.add.group();
        this.createCollectibles();

        this.bombs = this.physics.add.group();

        //se define la puntuacion
        this.scoreText = this.add.text(670, 16, 'score: 0', { fontFamily: 'InYourFaceJoffrey', fontSize: '40px', fill: '#000' });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1);

        //se definen las vidas
        for (let i=0; i<3; i++){
            this.lives[i] = this.add.image(40 * (i + 1) + (i * 10), 40, 'heart').setScale(1.5);
            this.lives[i].setScrollFactor(0);
            this.lives[i].setDepth(1);
        };

        //cooldown de vidas
        this.cooldownActive = false;
        this.cooldownTime = 2000;

        //colision del personaje con las plataformas
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.bossEnemy, this.invinciblePlatforms);

        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
        this.bossCollision = this.physics.add.collider(this.player, this.bossEnemy, this.hitBomb, null, this);

        //barra de vida del enemigo
        this.add.rectangle(this.healthBar_x + 200, this.healthBar_y + 10, 410, 30, 0x000000);
        this.healthBar = this.add.graphics();

        this.updateHealthBar();     //se hace una llamada a la funcion para actualizar la barra de vida

        this.camera = this.cameras.cameras[0];

        this.pause = this.add.image(400, 30, 'pause').setScrollFactor(0);
        this.pause.setInteractive();
        this.pause.setDepth(1);

        this.pause.on('pointerdown', () => {
            if (!this.isPaused) {
                this.scene.launch("Pause", { fromScene: this });
                this.scene.pause();
                this.isPaused = false;
            }
        });

        this.pause.on('pointerover', () => {
            this.pause.setTint(0xc0c0c0); // Cambia el color de la imagen al pasar el mouse
        });

        this.pause.on('pointerout', () => {
            this.pause.clearTint(); // Restaura el color original al salir
        });
    }

    update(){
        // revisa cuando se murió el jugador y no se ha reproducido el sonido
        //      cuando se cumple reproduce el sonido de gameover
        if (this.gameOver && !this.soundPlayed)
        {
            this.sound.play('deathSFX',{ loop: false });
            this.soundPlayed = true;
        }

        // revisa cuando se murió el jugador
        //      cuando se cumple lanza la escena de game over 
        //      y pausa la escena actual del nivel
        if (this.gameOver) {
            this.scene.launch('Gameover');
            this.scene.pause();
            return;
        }
    
        if (this.cursors.left.isDown){
            this.player.setVelocityX(-160);
    
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown){
            this.player.setVelocityX(160);
    
            this.player.anims.play('right', true);
        }
        else{
            this.player.setVelocityX(0);
    
            this.player.anims.play('turn');
        }
    
        if (this.cursors.up.isDown && this.player.body.touching.down){
            this.player.setVelocityY(-420);
        }
        
        if(this.bossEnemy.body.velocity.x < 0){
            this.bossEnemy.setTexture('imposter-izq');
        }else{
            this.bossEnemy.setTexture('imposter-der');
        }

        this.bombs.children.iterate((bomb) => {     //se cambia la imagen del enemigo al voltear a la derecha o izquierda
            if(bomb.body.velocity.x < 0){
                bomb.setTexture('imposter-izq');
            }else{
                bomb.setTexture('imposter-der');
            }
        });
    }

    createCollectibles(){
        var rangeY = Phaser.Math.RND.pick([450, 300, 50]);          //se definen tres valores posibles para que aparezcan en el eje y
        var collectible = this.stars.create(Phaser.Math.Between(0, 1000), rangeY, 'robot');
        collectible.setBounce(0.2);
        collectible.setCollideWorldBounds(true);
    }

    collectStar (player, star){
        star.disableBody(true, true);

        // repoduce el sonido de recoger objeto normal
        this.sound.setVolume(0.3);
        this.sound.play('robotSFX',{ loop: false });

        //  Add and update the score
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        this.bombs.clear(true, true);       //quita cualquier enemigo que esté vivo

        this.bossDamage();      //al recoger el objeto, le hace daño al jefe

    }

    hitBomb (player, bomb){
        if(this.cooldownActive){
            return;
        }

        // se reproduce un sonido de daño
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

    bossDamage(){
        this.currentHealth -= 10;           //se le quita vida al jefe
        if (this.currentHealth <= 0){       //si el jefe se queda sin vida, muestra la pantalla de victoria
            this.currentHealth = 0;
            this.victory();
        }else{
            this.createCollectibles();      //si el jefe sigue vivo, se crean coleccionables para derrotarlo
        }
        if(this.currentHealth > 60){        //si se llega a 2/3 de vida, aparece un enemigo
            this.spawnEnemies(0);
        }
        this.updateHealthBar();             //se actualiza la barra de vida del jefe
    }

    spawnEnemies(numberOfEnemies){          //funcion que se encarga de aparecer nuevos enemigos
        let spawn = this.time.addEvent({
            delay: 1,
            callback: () => {
                var bomb = this.bombs.create(this.bossEnemy.x, 50, 'imposter-der');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
                if(bomb.body.velocity.x < 0){
                    bomb.setTexture('imposter-izq');
                }else{
                    bomb.setTexture('imposter-der');
                }
                bomb.allowGravity = false;
            },
            repeat: numberOfEnemies
        });    
    }

    updateHealthBar(){
        this.healthBar.clear();      //borra la barra de vida actual

        var healthWidth = (this.currentHealth / this.maxHealth) * 400;        //calcula el ancho según la vida actual
        
        //redibuja la barra con el tamaño adecuado
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(this.healthBar_x, this.healthBar_y, healthWidth, 20);
        
        //si se tiene menos de un porcentaje de vida, cambia de color y aparecen una cierta cantidad de enemigos
        if(this.currentHealth > 60){
            this.healthBar.fillStyle(this.greenColor, 1);
            this.healthBar.fillRect(this.healthBar_x, this.healthBar_y, healthWidth, 20);
        }else if(this.currentHealth <= 60 && this.currentHealth > 30){
            this.healthBar.fillStyle(this.yellowColor, 1);
            this.healthBar.fillRect(this.healthBar_x, this.healthBar_y, healthWidth, 20);
            this.spawnEnemies(1);
        }else if(this.currentHealth <= 30 && this.currentHealth > 0){
            this.healthBar.fillStyle(this.redColor, 1);
            this.healthBar.fillRect(this.healthBar_x, this.healthBar_y, healthWidth, 20);
            this.spawnEnemies(2);
        }else if(this.currentHealth <= 0){      //cuando se quede sin vida se desactivan las fisicas para dar la ilusion de que cae del mundo
            this.bossEnemy.setImmovable(true);
            this.physics.world.colliders.remove(this.bossCollision);
        }
    }

    victory(){
        console.log("Ganaste el juego");
    }

}