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
    }

    create(){
        this.add.image(400, 300, 'sky').setScale(1.4).setScrollFactor(0);       //fondo

        this.physics.world.setBounds(0, 0, 800, 600);
        this.cameras.main.setBounds(0, 0, 800, 600);

        this.platforms = this.physics.add.staticGroup();        //grupo de las plataformas
        this.invinciblePlatforms = this.physics.add.staticGroup();

        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();            //piso
        // this.platforms.create(1200, 568, 'ground').setScale(2).refreshBody();
        // this.platforms.create(2000, 568, 'ground').setScale(2).refreshBody();

        //plataformas
        this.platforms.create(750, 400, 'ground');
        this.platforms.create(850, 250, 'ground');
        this.platforms.create(50, 400, 'ground');
        this.platforms.create(-50, 250, 'ground');

        this.invinciblePlatforms.create(400, 150, 'ground')/*.setVisible(false)*/;
        this.invinciblePlatforms.create(0, 100, 'ground')/*.setVisible(false)*/;
        this.invinciblePlatforms.create(800, 100, 'ground')/*.setVisible(false)*/;
    
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

        this.cursors = this.input.keyboard.createCursorKeys();      //eventos del teclado

        this.cursors.esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);    

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
        //this.physics.add.collider(this.stars, this.platforms);
        //this.physics.add.collider(this.bombs, this.platforms);

        //barra de vida del enemigo
        this.add.rectangle(this.healthBar_x + 200, this.healthBar_y + 10, 410, 30, 0x000000);
        this.healthBar = this.add.graphics();

        this.updateHealthBar();     //se hace una llamada a la funcion para actualizar la barra de vida

        this.camera = this.cameras.cameras[0];

        this.pause = this.add.image(400, 30, 'pause').setScrollFactor(0);

        this.pause.on('pointerdown', () => {
            if (!this.isPaused) {
                this.scene.launch("Pause", { fromScene: this });
                this.scene.pause();
                this.isPaused = false;
            }
        });

        this.pause.setInteractive();

        this.pause.on('pointerover', () => {
            this.pause.setTint(0xc0c0c0); // Cambia el color de la imagen al pasar el mouse
        });

        this.pause.on('pointerout', () => {
            this.pause.clearTint(); // Restaura el color original al salir
        });
    }

    update(){
        if (this.gameOver){
            return;
        }
    
        if (this.cursors.left.isDown){
            this.player.setVelocityX(-160);
    
            this.player.anims.play('left', true);
    
            // if (this.player.x < 195 && this.followCamera) {
            //     this.camera.stopFollow();
            //     this.followCamera = false;
            // }
        }
        else if (this.cursors.right.isDown){
            this.player.setVelocityX(160);
    
            this.player.anims.play('right', true);
    
            // if (this.player.x >= 300 && !this.followCamera) {
            //     this.followCamera = true;
            //     this.camera.startFollow(this.player, true, 0.5, 0, -100, (this.player.y - 300) );
            //     this.camera.setDeadzone(200, 0);
            // }
        }
        else{
            this.player.setVelocityX(0);
    
            this.player.anims.play('turn');
        }
    
        if (this.cursors.up.isDown && this.player.body.touching.down){
            this.player.setVelocityY(-420);
        }

        /* PRUEBA PARA LA BARRA DE VIDA */
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('SPACE'))) {
            this.currentHealth -= 10;
            if (this.currentHealth < 0){
                this.currentHealth = 0;
            }
            this.updateHealthBar();
        }
    }

    updateHealthBar(){
        this.healthBar.clear();      //borra la barra de vida actual

        var healthWidth = (this.currentHealth / this.maxHealth) * 400;        //calcula el ancho según la vida actual
        
        //redibuja la barra con el tamaño adecuado
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(this.healthBar_x, this.healthBar_y, healthWidth, 20);
        
        //si se tiene menos de un porcentaje de vida, cambia de color
        if(this.currentHealth > 60){
            this.healthBar.fillStyle(this.greenColor, 1);
            this.healthBar.fillRect(this.healthBar_x, this.healthBar_y, healthWidth, 20);
        }else if(this.currentHealth <= 60 && this.currentHealth > 30){
            this.healthBar.fillStyle(this.yellowColor, 1);
            this.healthBar.fillRect(this.healthBar_x, this.healthBar_y, healthWidth, 20);
        }else{
            this.healthBar.fillStyle(this.redColor, 1);
            this.healthBar.fillRect(this.healthBar_x, this.healthBar_y, healthWidth, 20);
        }
    }

}