export default class Level_1 extends Phaser.Scene{

    constructor() {
        super({ key: 'Nivel1' });
    }

    //inicialización de variables globales
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
    playerSprite = ''; //localStorage.getItem("playerSprite");
    collectedBonus = false;
    soundPlayed = false;
    showFinishGate = false;

    preload ()
    {
        this.load.image('sky', '../assets/images/cafeteria_cleanup.png');
        this.load.image('heart', '../assets/images/vida.png');
        this.load.image('ground', '../assets/images/plataforma.png');
        this.load.image('robot', '../assets/images/robot.png');
        this.load.image('pause', '../assets/images/pause.png');
        this.load.image('boton', '../assets/images/boton.png');
        this.load.image('finishGate', '../assets/images/finishGate.png');
        this.load.image('imposter-der', '../assets/images/impostor-derecha.png');
        this.load.image('imposter-izq', '../assets/images/impostor-izquierda.png');
        this.load.spritesheet('player1', '../assets/images/player1.png', { frameWidth: 78, frameHeight: 80 });
        this.load.spritesheet('player2', '../assets/images/player2.png', { frameWidth: 78, frameHeight: 80 });
        this.load.audio('deathSFX', '../assets/sfx/KillSFX.wav');
        this.load.audio('buttonSFX', '../assets/sfx/alarm_emergencymeeting.wav');
        this.load.audio('robotSFX', '../assets/sfx/Megaphone4.wav');
        this.load.audio('hitSFX', '../assets/sfx/impostor_kill.wav');
    }

    create ()
    {
        var jugadores = JSON.parse(localStorage.getItem("players"));
        this.playerSprite = jugadores[jugadores.length - 1].player;

        // setea el registro bonusScore en 0 para si uso futuro
        this.registry.set('bonusScore', 0);
        
        // se construlle el nivel
        // se agrega la imagen de fondo
        this.add.image(400, 300, 'sky').setScale(1.4).setScrollFactor(0);

        // se establecen las reglas de tamaño del nivel
        this.physics.world.setBounds(0, 0, 2250, 600);
        this.cameras.main.setBounds(0, 0, 2250, 600);

        // se crea el grupo de plataformas y se crean sus hijos 
        this.platforms = this.physics.add.staticGroup();

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

        // se inicializa al jugador y sus prpiedades
        this.player = this.physics.add.sprite(100, 450, this.playerSprite);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        //  se establecen los sprites a usar en el personaje del jugador
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

        //  se mapean las teclas a usar en el juego
        this.cursors = this.input.keyboard.createCursorKeys();

        this.cursors.esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);    

        //  se crea el grupo de los coleccionables
        //  y se colocan todos los coleccionables en el mapa
        this.stars = this.physics.add.group({
            key: 'robot',
            repeat: 23,
            setXY: { x: 12, y: 0, stepX: (70 + Phaser.Math.Between(0,20)) }
        });
        
        // al momento de aparecer a cada coleccionable de le coloca un rango de rebote diferente
        this.stars.children.iterate((child) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        // se crea el grupo para los objetos especiales
        this.bonus = this.physics.add.group();

        // se crea el grupo de los enemigos
        this.bombs = this.physics.add.group();

        //  Se crea un texto que mostrará el puntaje del jugador
        this.scoreText = this.add.text(670, 16, 'score: 0', { fontFamily: 'InYourFaceJoffrey', fontSize: '40px', fill: '#000' });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1);

        // se crean las 3 vidas a mostrarse en pantalla dentro de un arreglo
        for (let i=0; i<3; i++){
            this.lives[i] = this.add.image(40 * (i + 1) + (i * 10), 60, 'heart').setScale(1.5);
            this.lives[i].setScrollFactor(0);
            this.lives[i].setDepth(1);
        };

        var aliasText = this.add.text(20,10,jugadores[jugadores.length - 1].name,{ fontFamily: 'InYourFaceJoffrey', fontSize: '25px', fill: '#FFF' }).setDepth(1).setScrollFactor(0);

        var dateText = this.add.text(520,10,jugadores[jugadores.length - 1].fecha,{ fontFamily: 'InYourFaceJoffrey', fontSize: '25px', fill: '#FFF' }).setDepth(1).setScrollFactor(0);

        var levelText = this.add.text(220,10,"Nivel 1",{ fontFamily: 'InYourFaceJoffrey', fontSize: '25px', fill: '#FFF' }).setDepth(1).setScrollFactor(0);

        // cooldown de daño al jugador
        this.cooldownActive = false;
        this.cooldownTime = 2000;

        //Se agregan los colliders entre los objetos
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.bonus, this.platforms);

        //  Se agregan los overlap que detectan cuando el jugadoor y 
        //  los objetos se encuenrtran en la misma posición para luege ejecutar una accion específica
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.overlap(this.player, this.bonus, this.collectBonus, null, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        // establece la cámara como variable para su manejo
        this.camera = this.cameras.cameras[0];

        // se crea el evento para aparecer los objetos especiales
        this.time.addEvent({
            delay: Phaser.Math.Between(8000, 15000), 
            callback: () => {
                let x = Phaser.Math.Between(150, 1900);
                this.createBonus(x,50);
                this.spawnedObjects++;             
            },
            repeat: 1
        });

        // genera la imagen de pausa
        this.pause = this.add.image(400, 30, 'pause').setScrollFactor(0);
        this.pause.setInteractive();
        this.pause.setDepth(1);

        // se crean los eventos del botón de pausa
        this.pause.on('pointerdown', () => {    // evento al hacer clic
            if (!this.scene.isPaused()) {
                this.registry.set('levelPause', "Nivel1");
                this.scene.launch("Pause");
                this.scene.pause();
            }
        });

        this.pause.on('pointerover', () => {    // evento al hacer hover
            this.pause.setTint(0xc0c0c0);
        });

        this.pause.on('pointerout', () => {    // evento al dejar de hacer hover
            this.pause.clearTint();
        });

        // crea evento que escucha cuando se actualizan los registros
        this.registry.events.on('changedata', this.updateData, this);
    }

    update ()
    {
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
            this.postRecord();
            this.scene.pause();
            return;
        }

        // se establecen los movimientos del jugador
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);

            // revisa cuando el jugador está muy cerca del borde izquierdo 
            //      cuando se cumple hace que la camara deje de seguir al jugador
            if (this.player.x < 195 && this.followCamera) {
                this.camera.stopFollow();
                this.followCamera = false;
            }
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);

            // revisa cuando el jugador se aleja del borde izquierdo 
            //      cuando se cumple hace que la camara empiece a seguir al jugador
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

        // crea el cambio de sprite del enemigo dependiendo de 
        // la direccion a la que se dirige
        this.bombs.children.iterate((bomb) => {
            if(bomb.body.velocity.x < 0){
                bomb.setTexture('imposter-izq');
            }else{
                bomb.setTexture('imposter-der');
            }
        });

        // revisa cuando el jugador estpa en la zona de la puerta para finalizar el juego
        if ((this.player.x >= 2210 && this.player.y >= 490) && this.showFinishGate) {
            this.physics.pause();
            
            this.registry.set('score', this.score);

            var rect = this.add.rectangle(400, 100, 220, 50, 0X000, 0.75 ).setScrollFactor(0);

            var text = this.add.text(400, 100, "Nivel Completado", {fontFamily: 'InYourFaceJoffrey', fontSize: "32px", fill: "#fff", align: 'center' }).setOrigin(0.5).setScrollFactor(0);


            this.time.delayedCall(3000, () => {
                text.destroy();
                rect.destroy();
                this.scene.launch("Nivel2");
                this.scene.stop();
            });
        }
 
        
    }

    // método para cuando se obtiene una estrella
    collectStar (player, star)
    {
        star.disableBody(true, true);

        // repoduce el sonido de recoger objeto normal
        this.sound.setVolume(0.3);
        this.sound.play('robotSFX',{ loop: false });

        //  Actualiza la puntuación
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        // revisa si la cantidad de objetos restantes es multiplo de 6
        //      de ser así crea un nuevo enemigo
        if (this.stars.countActive(true)%6 === 0)
        {

            // dependiendo de la posicion del jugador se determina donde aparecera el enemigo
            // relativamente al jugador
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

        // revisa si es que ya se consumieron todos los objetos
        //      de ser así se llama al método para terminar el nivel
        if (this.stars.countActive(true) === 0){
            this.finishLevel();
        }
    }

    // método cuando el jugador se encuentra con un enemigo
    hitBomb (player, bomb)
    {
        // revisa que el cooldown esté activo
        //      cuando estosucede termina el método
        if(this.cooldownActive){
            return;
        }
        
        // se reproduce un sonido de daño
        this.sound.play('hitSFX',{ loop: false });

        // se resta una vida y se elimina un corazón de la pantalla
        this.live--;
        this.lives[this.live].destroy();

        // por un momento se colorea el jugador para indicar el daño
        player.setTint(0xfb7474);
        
        // revisa si el jugador está muerto
        if(this.live <= 0){

            this.gameOver = true;
            this.physics.pause();
            player.setTint(0xff0000);
            player.anims.play('turn'); 

        }else{

            let tintChange = false;

            // se crea efecto de parpadeo mientras no le pueden hacer daño al jugador
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

    // método que se activa cuando se obtiene un objeto especial
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

    // método que recupera los puntos ganados en la mision del objeto especial
    updateData(parent, key, data){
        if(key === 'bonusScore'){
            this.score += data;
        }
        this.scoreText.setText('Score: ' + this.score);
    }

    // método que crea un nuevo objeto especial
    createBonus(x,y){
        var botonBonus = this.bonus.create(x,y, 'boton');
        botonBonus.setBounce(0.5);

        this.collectedBonus = false;    

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

    // método para cuando se cumplen las condiciones de terminar el nivel
    finishLevel(){
        var rect = this.add.rectangle(400, 100, 220, 50, 0X000 );
        rect.setAlpha(0.75);
        rect.setScrollFactor(0);
        var text = this.add.text(400, 100, "Escapa por la puerta", {fontFamily: 'InYourFaceJoffrey', fontSize: "32px", fill: "#fff", align: 'center' }).setOrigin(0.5);
        text.setScrollFactor(0);

        this.time.delayedCall(4000, () => {
            text.destroy();
            rect.destroy();
        });

        this.showFinishGate = true;

        this.add.image(2210,495,'finishGate');

    }

    postRecord(){
        var jugadores = JSON.parse(localStorage.getItem("players"));

        if (jugadores[jugadores.length - 1].score > this.score) {
            jugadores[jugadores.length - 1].score = this.score;
        }

        localStorage.setItem("players", JSON.stringify(jugadores));
    }
}