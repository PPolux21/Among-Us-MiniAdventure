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
    gameOver = false;
    scoreText;
    followCamera = false;

    preload ()
    {
        this.load.image('sky', '../assets/sky.png');
        this.load.image('ground', '../assets/platform.png');
        this.load.image('robot', '../assets/robot.png');
        this.load.image('imposter-der', '../assets/impostor-derecha.png');
        this.load.image('imposter-izq', '../assets/impostor-izquierda.png');
        this.load.spritesheet('player1', '../assets/player1.png', { frameWidth: 78, frameHeight: 80 });
        this.load.spritesheet('player2', '../assets/player2.png', { frameWidth: 78, frameHeight: 80 });
    }

    create ()
    {
        //  A simple background for our game
        this.add.image(400, 300, 'sky');

        this.physics.world.setBounds(0, 0, 2000, 600);
        this.cameras.main.setBounds(0, 0, 2000, 600);

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();

        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        //  Now let's create some ledges
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

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
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate((child) => {

            //  Give each star a slightly different bounce
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        this.bombs = this.physics.add.group();

        //  The score
        this.scoreText = this.add.text(700, 16, 'score: 0', { fontFamily: 'InYourFaceJoffrey', fontSize: '32px', fill: '#000' });

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);

        //  Checks to see if the player overlaps with any of the this.stars, if he does call the collectStar function
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        this.camera = this.cameras.cameras[0];

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

        if (Phaser.Input.Keyboard.JustDown(this.cursors.esc))
        {
            if (scene.isPaused()) {
                scene.resume();
            } else {
                scene.pause();
            }
        }
    }

    collectStar (player, star)
    {
        star.disableBody(true, true);

        //  Add and update the score
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true) === 0)
        {
            //  A new batch of stars to collect
            this.stars.children.iterate((child) => {

                child.enableBody(true, child.x, 0, true, true);

            });

            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            
            var bomb = this.bombs.create(x, 16, 'imposter-der');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;

        }
    }

    hitBomb (player, bomb)
    {
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play('turn');

        this.gameOver = true;
    }
}