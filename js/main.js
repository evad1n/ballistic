// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application(600, 600);
document.body.appendChild(app.view);
document.querySelector("canvas").style.border = "4px solid #CCCCCC";
let container = document.querySelector(".game");
container.appendChild(document.querySelector("canvas"));

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// aliases
let stage;

// game variables
let currentScene = 0;
let startScene;
let gameScene, topBar, gameSceneLabel, tank1, tank2, scoreLabel1, playerLabel1, scoreLabel2, playerLabel2, musicButton, musicMuted;
//sounds
let shootSound, hitSound, fireballSound, buttonSound, themeSound;
let mute = false;

//keyboard variables
let keyPressed = [];

//tank variables
let tank1FireTimer = 0;
let tank2FireTimer = 0;

//wall variables
let wallSpacing = 60;
let xTiles = Math.floor(sceneWidth / wallSpacing);
let yTiles = Math.floor(sceneHeight / wallSpacing);

let walls = [];
let bullets = [];
let explosions = [];
let explosionTextures;
let score1 = 0;
let score2 = 0;
let paused = true;
let numBullets = 1;
let rotateSpeed = Math.PI / 72;
let speed = 2;
let fireInterval = 0.3;
let endDelay = 0;

function setup() {
    stage = app.stage;
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // #6 - Load Sounds
    shootSound = new Howl({
        src: ['sounds/shoot.wav']
    });

    hitSound = new Howl({
        src: ['sounds/hit.mp3']
    });

    fireballSound = new Howl({
        src: ['sounds/fireball.mp3']
    });

    buttonSound = new Howl({
        src: ['sounds/buttonPush.mp3']
    });

    themeSound = new Howl({
        src: ['sounds/theme.mp3'],
        autoplay: true,
        loop: true,
        preload: true,
        buffer: true,
        html5: true,
        volume: 0.05
    });

    // #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();

    // #8 - Start update loop
    app.ticker.add(gameLoop);

    //Keyboard input
    document.addEventListener('keydown', function (e) {
        keyPressed[e.keyCode] = true;
        switch (e.keyCode) {
            case 37: case 39: case 38: case 40: // Arrow keys
            case 32: e.preventDefault(); break; // Space
            default: break; // do not block other keys
        }
    });

    document.addEventListener('keyup', function (e) {
        keyPressed[e.keyCode] = false;
    });

    //initialize variables
    score1 = 0;
    score2 = 0;
}

function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 48,
        fontFamily: 'Audiowide'
    });

    let startLabel1 = new PIXI.Text("BALLISTIC");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xDD0000,
        fontSize: 96,
        fontFamily: 'Audiowide',
        stroke: 0xBBBBBB,
        strokeThickness: 3
    });
    startLabel1.anchor.x = 0.5;
    startLabel1.x = sceneWidth / 2;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    let startLabel2 = new PIXI.Text("By Will Dickinson");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xDD0000,
        fontSize: 32,
        fontFamily: 'Audiowide',
        stroke: 0xBBBBBB,
        strokeThickness: 1,
        anchor: 0.5
    });
    startLabel2.anchor.x = 0.5;
    startLabel2.x = sceneWidth / 2;
    startLabel2.y = sceneHeight / 2;
    startScene.addChild(startLabel2);

    let startButton = new PIXI.Text("PLAY");
    startButton.style = buttonStyle;
    startButton.anchor.x = 0.5;
    startButton.x = sceneWidth / 2;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", e => e.target.alpha = 0.7, e => e.target.style.backgroundColor = 0xDD0000);
    startButton.on("pointerout", e => e.currentTarget.alpha = 1);
    startScene.addChild(startButton);

    musicButton = PIXI.Sprite.fromImage("images/music.png");
    musicButton.x = sceneWidth - (musicButton.width + 10);
    musicButton.y = sceneHeight - (musicButton.height + 10);
    musicButton.interactive = true;
    musicButton.buttonMode = true;
    musicButton.on("pointerup", toggleMusic);
    musicButton.on("pointerover", e => e.target.alpha = 0.7);
    musicButton.on("pointerout", e => e.currentTarget.alpha = 1);

    musicMuted = PIXI.Sprite.fromImage("images/musicMute.png");
    musicMuted.x = sceneWidth - (musicMuted.width + 10);
    musicMuted.y = sceneHeight - (musicMuted.height + 10);
    musicMuted.on("pointerover", e => e.target.alpha = 0.2);
    musicMuted.on("pointerout", e => e.currentTarget.alpha = 1);
    musicMuted.color = 0x00FF00;

    startScene.addChild(musicMuted);
    startScene.addChild(musicButton);

    // 2 - set up `gameScene`  

    //Set up top bar
    topBar = new PIXI.Graphics();
    topBar.beginFill(0xCCCCCC);
    topBar.lineStyle(4, 0xCCCCCC, 1);
    topBar.drawRect(0, 0, sceneWidth, 64);
    topBar.endFill();
    gameScene.addChild(topBar);

    gameSceneLabel = new PIXI.Text("BALLISTIC");
    gameSceneLabel.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 50,
        fontFamily: 'Audiowide',
        stroke: 0xBBBBBB,
        strokeThickness: 3
    });
    gameSceneLabel.anchor.x = 0.5;
    gameSceneLabel.x = sceneWidth / 2;
    gameSceneLabel.y = 0;
    gameScene.addChild(gameSceneLabel);


    let player1Style = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 18,
        fontFamily: 'Audiowide',
        stroke: 0xFFFFFF,
        strokeThickness: 4
    });

    let player2Style = new PIXI.TextStyle({
        fill: 0x0000FF,
        fontSize: 18,
        fontFamily: 'Audiowide',
        stroke: 0xFFFFFF,
        strokeThickness: 4
    });

    scoreLabel1 = new PIXI.Text();
    scoreLabel1.style = player1Style;
    scoreLabel1.anchor.x = 0.5;
    scoreLabel1.x = 50;
    scoreLabel1.y = 26;
    gameScene.addChild(scoreLabel1);
    increaseScoreBy(0, 1);

    playerLabel1 = new PIXI.Text("Player 1");
    playerLabel1.style = player1Style;
    playerLabel1.anchor.x = 0.5;
    playerLabel1.x = 50;
    playerLabel1.y = 6;
    gameScene.addChild(playerLabel1);

    scoreLabel2 = new PIXI.Text();
    scoreLabel2.style = player2Style;
    scoreLabel2.anchor.x = 0.5;
    scoreLabel2.x = sceneWidth - 50;
    scoreLabel2.y = 26;
    gameScene.addChild(scoreLabel2);
    increaseScoreBy(0, 2);

    playerLabel2 = new PIXI.Text("Player 2");
    playerLabel2.style = player2Style;
    playerLabel2.anchor.x = 0.5;
    playerLabel2.x = sceneWidth - 50;
    playerLabel2.y = 5;
    gameScene.addChild(playerLabel2);
}

function toggleMusic() {
    mute = !mute;
    if (mute) {
        Howler.mute(mute);
        if (currentScene == 0)
            startScene.addChild(musicMuted);
        else if (currentScene == 1)
            gameScene.addChild(musicMuted);
    }
    else {
        Howler.mute(mute);
        if (currentScene == 0)
            startScene.removeChild(musicMuted);
        else if (currentScene == 1)
            gameScene.removeChild(musicMuted);
    }
}

// Create walls
function generateWalls() {

}

function startGame() {
    buttonSound.play();

    startScene.visible = false;
    gameScene.visible = true;
    startScene.removeChild(musicButton);
    gameScene.addChild(musicButton);
    //Carry over muted state to buttons
    if (mute)
        gameScene.addChild(musicMuted);
    currentScene = 1;
    paused = false;

    // Create walls
    let wallNum = Math.round((Math.random() * 30) + 50);
    while (walls.length < wallNum) {
        let r = Math.round(Math.random());
        if (r == 0)
            drawHorizontalWall();
        else
            drawVerticalWall();
    }

    //position tanks
    let pos1 = { x: wallSpacing / 2 + Math.floor(Math.random() * xTiles) * wallSpacing, y: wallSpacing / 2 + Math.floor(Math.random() * yTiles + 1) * wallSpacing };
    let pos2 = { x: wallSpacing / 2 + Math.floor(Math.random() * xTiles) * wallSpacing, y: wallSpacing / 2 + Math.floor(Math.random() * yTiles + 1) * wallSpacing };

    let valid1 = false;
    let valid2 = false;

    while (!valid1)
        for (let w of walls) {
            if (pos1.x > w.x && pos1.x < w.x + w.width && pos1.y < w.y + w.height && pos1.y > w.y || (pos1.x == pos2.x && pos1.y == pos2.y))
                pos1 = { x: wallSpacing / 2 + Math.floor(Math.random() * xTiles) * wallSpacing, y: wallSpacing / 2 + Math.floor(Math.random() * yTiles + 1) * wallSpacing };
            else
                valid1 = true;
        }

    while (!valid2) {
        for (let w of walls) {
            if (pos2.x > w.x && pos2.x < w.x + w.width && pos2.y < w.y + w.height && pos2.y > w.y || (pos1.x == pos2.x && pos1.y == pos2.y))
                pos2 = { x: wallSpacing / 2 + Math.floor(Math.random() * xTiles) * wallSpacing, y: wallSpacing / 2 + Math.floor(Math.random() * yTiles + 1) * wallSpacing };
            else
                valid2 = true;
        }
    }

    //Create player 1
    tank1 = new Tank();
    tank1.rotation -= Math.PI / 2;
    gameScene.addChild(tank1);

    //Create player 2
    tank2 = new Tank("tank_blue.png");
    tank2.rotation -= Math.PI / 2;
    gameScene.addChild(tank2);

    tank1.x = pos1.x;
    tank1.y = pos1.y;
    tank2.x = pos2.x;
    tank2.y = pos2.y;

    //Rotate tanks to face each other
    let angle1 = Math.atan2(tank2.y - tank1.y, tank2.x - tank1.x);
    tank1.rotation = angle1;
    let angle2 = Math.atan2(tank1.y - tank2.y, tank1.x - tank2.x);
    tank2.rotation = angle2;
}

function increaseScoreBy(value, player) {
    if (player == 1) {
        score1 += value;

        scoreLabel1.text = `Score ${score1}`;
    }
    else if (player == 2) {
        score2 += value;

        scoreLabel2.text = `Score ${score2}`;
    }
}

function drawVerticalWall() {
    let rect = new PIXI.Graphics();
    rect.beginFill(0xCCCCCC);
    rect.drawRect(0, 0, 5, wallSpacing + 5);
    rect.endFill();

    rect.x = (Math.floor((Math.random() * xTiles) + 1) * wallSpacing);
    rect.y = (Math.floor((Math.random() * yTiles) + 1) * wallSpacing);

    walls.push(rect);
    gameScene.addChild(rect);
}

function drawHorizontalWall() {
    let rect = new PIXI.Graphics();
    rect.beginFill(0xCCCCCC);
    rect.drawRect(0, 0, wallSpacing + 5, 5);
    rect.endFill();

    rect.x = (Math.floor((Math.random() * xTiles) + 1) * wallSpacing);
    rect.y = (Math.floor((Math.random() * yTiles) + 1) * wallSpacing);

    walls.push(rect);
    gameScene.addChild(rect);
}

function gameLoop() {
    if (paused) return;

    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    // #2 - Move Tanks
    let tank1PrevPos = { x: tank1.x, y: tank1.y };
    let tank2PrevPos = { x: tank2.x, y: tank2.y };

    if (tank1.isAlive) {
        //up 38
        if (keyPressed[38]) {
            move(tank1, speed);
        }
        //down 40
        if (keyPressed[40]) {
            move(tank1, -speed);
        }
        //left 37
        if (keyPressed[37]) {
            tank1.rotation -= rotateSpeed;
        }
        //right 39
        if (keyPressed[39]) {
            tank1.rotation += rotateSpeed;
        }
        //m 77
        if (keyPressed[77]) {
            fireBulletTank1();
        }
    }

    if (tank2.isAlive) {
        //w 87
        if (keyPressed[87]) {
            move(tank2, speed);
        }
        //s 83
        if (keyPressed[83]) {
            move(tank2, -speed);
        }
        //a 65
        if (keyPressed[65]) {
            tank2.rotation -= rotateSpeed;
        }
        //d 68
        if (keyPressed[68]) {
            tank2.rotation += rotateSpeed;
        }
        //q 81
        if (keyPressed[81]) {
            fireBulletTank2();
        }
    }

    tank1.x = clamp(tank1.x, tank1.width / 2, sceneWidth - tank1.width / 2);
    tank1.y = clamp(tank1.y, tank1.height / 2 + 64, sceneHeight - tank1.height / 2);
    tank2.x = clamp(tank2.x, tank2.width / 2, sceneWidth - tank2.width / 2);
    tank2.y = clamp(tank2.y, tank2.height / 2 + 64, sceneHeight - tank2.height / 2);


    // #4 - Color and time bullets
    for (let b of bullets) {
        b.timer += dt;

        if (b.timer > 8) {
            b.isAlive = false;
            gameScene.removeChild(b);
            fireballSound.play();
            createExplosion(b.x, b.y, 64, 64);
        }

        //Change color over time
        let value = ((1 - (b.timer / 10)) * 255);
        let string = Math.round(value).toString(16);
        string = "FF" + string + string;
        let number = parseInt(string, 16);
        b.clear();
        b.beginFill(number);
        b.drawRect(-2, -3, 5, 5);
        b.endFill();
    }

    // #5 - Check for Collisions
    for (let b of bullets) {
        moveBullet(b, dt);

        //tank-bullet collision
        if (circleCollision(tank1, b) && tank1.isAlive && b.timer >= 0.05) {
            fireballSound.play();
            createExplosion(tank1.x, tank1.y, 64, 64);
            gameScene.removeChild(tank1);
            tank1.isAlive = false;
            gameScene.removeChild(b);
            b.isAlive = false;
            increaseScoreBy(1, 2);
        }

        if (circleCollision(tank2, b) && tank2.isAlive && b.timer >= 0.05) {
            fireballSound.play();
            createExplosion(tank2.x, tank2.y, 64, 64);
            gameScene.removeChild(tank2);
            tank2.isAlive = false;
            gameScene.removeChild(b);
            b.isAlive = false;
            increaseScoreBy(1, 1);
        }
    }

    //tank-wall collision
    for (let w of walls) {
        if (rectsIntersect(w, tank1, 3)) {
            move(tank1, speed * 2);
            if (rectsIntersect(w, tank1, 3)) {
                tank1.x = tank1PrevPos.x;
                tank1.y = tank1PrevPos.y;
            }
        }

        if (rectsIntersect(w, tank2, 3)) {
            move(tank2, speed * 2);
            if (rectsIntersect(w, tank2, 3)) {
                tank2.x = tank2PrevPos.x;
                tank2.y = tank2PrevPos.y;
            }
        }
    }

    // #6 - Now do some clean up
    bullets = bullets.filter(b => b.isAlive);
    explosions = explosions.filter(e => e.playing);

    // #7 - Is game over?
    if (!tank1.isAlive || !tank2.isAlive) {
        endDelay += dt;
    }

    if (endDelay > 2)
        end();

    //Increment timers
    tank1FireTimer += dt;
    tank2FireTimer += dt;
}

function end() {
    paused = true;

    endDelay = 0;

    bullets.forEach(b => gameScene.removeChild(b));
    bullets = [];

    explosions.forEach(e => gameScene.removeChild(e));
    explosions = [];

    gameScene.removeChild(tank1);
    gameScene.removeChild(tank2);

    walls.forEach(w => gameScene.removeChild(w));
    walls = [];

    //Replay 
    startGame();
}

//check for collisions and move bullets
function moveBullet(b, dt) {

    b.x += b.fwd.x * b.speed * dt;

    if (b.x <= b.radius || b.x >= sceneWidth - b.radius) {
        b.reflectX();
        b.x += b.fwd.x * b.speed * dt;
    }

    for (let w of walls) {
        if (rectsIntersect(b, w)) {
            b.reflectX();
            b.x += b.fwd.x * b.speed * dt;
        }
    }

    b.y += b.fwd.y * b.speed * dt;

    if (b.y <= b.radius + 64 || b.y >= sceneHeight - b.radius) {
        b.reflectY();
        b.y += b.fwd.y * b.speed * dt;
    }

    for (let w of walls) {
        if (rectsIntersect(b, w)) {
            b.reflectY();
            b.y += b.fwd.y * b.speed * dt;
        }
    }
}

function fireBulletTank1(e) {
    if (paused || tank1FireTimer < fireInterval) return;

    for (let i = 0; i < numBullets; i++) {
        let b = new Bullet(0xFFFFFF, tank1.x, tank1.y, tank1.rotation);
        bullets.push(b);
        gameScene.addChild(b);
    }

    shootSound.play();

    tank1FireTimer = 0;
}

function fireBulletTank2(e) {
    if (paused || tank2FireTimer < fireInterval) return;

    for (let i = 0; i < numBullets; i++) {
        let b = new Bullet(0xFFFFFF, tank2.x, tank2.y, tank2.rotation);
        bullets.push(b);
        gameScene.addChild(b);
    }

    shootSound.play();

    tank2FireTimer = 0;
}

function loadSpriteSheet() {
    let spriteSheet = PIXI.BaseTexture.fromImage("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, 64, width, height));
        textures.push(frame);
    }
    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight) {
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.extras.AnimatedSprite(explosionTextures);
    expl.x = x - w2;
    expl.y = y - h2;
    expl.animationSpeed = 1 / 7;
    expl.loop = false;
    expl.onComplete = e => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}