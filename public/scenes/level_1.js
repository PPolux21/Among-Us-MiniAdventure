export default class Level_1 extends Phaser.Scene{

    constructor() {
        super({ key: 'Nivel1' });
    }

    camera;
    player;
    stars;
    bombs;
    platforms;
    cursors;
    score = 0;
    live = 3;
    lives = [];
    gameOver = false;
    scoreText;
    followCamera = false;
    isPaused = false;

    preload ()
    {
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

    create ()
    {
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
        this.player = this.physics.add.sprite(100, 450, 'player1'); //liego hacer cambio de personaje

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player1', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'player1', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player1', { start: 5, end: 8 }),
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

        //  Checks to see if the player overlaps with any of the this.stars, if he does call the collectStar function
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        this.camera = this.cameras.cameras[0];

        this.pause = this.add.image(400, 30, 'pause').setScrollFactor(0);

        this.pause.on('pointerdown', () => {
            if (!this.isPaused) {
                this.scene.launch("Pause");
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

    update ()
    {
        if (this.gameOver)
        {
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
    }

    hitBomb (player, bomb)
    {
        if(this.cooldownActive){
            return;
        }
        
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
}