import Level_1 from './scenes/level_1.js';
import Pause from "./scenes/pause.js";
import Bonus from "./scenes/bonus.js";
import GameOver from "./scenes/gameover.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 450 },
            debug: false
        }
    },
    scene: [Level_1, Pause, Bonus, GameOver]
};

const game = new Phaser.Game(config);