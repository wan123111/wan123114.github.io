var game = new Phaser.Game(480, 300, Phaser.CANVAS, null, {
    preload: preload, create: create, update: update
  });
var ball;
var paddle;
var bricks;
var newBrick;
var brickInfo;
var scoreText;
var score = 0;
var lives = 3;
var livesText;
var lifeLostText;
var playing = false;
var startButton;

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = '#eee';

    game.load.image('ball', 'images/ball.png');
    game.load.image('paddle', 'images/paddle.png');
    game.load.image('brick', 'images/brick.png');
    game.load.spritesheet('ball', 'images/wobble.png', 20, 20);
    game.load.spritesheet('button', 'images/button.png', 120, 40);

}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    // ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');
    ball = game.add.sprite(50, 250, 'ball');
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    ball.anchor.set(0.5);
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);


    paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');
    // place paddle right in the midlle of the scene
    paddle.anchor.set(0.5,1);
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    // set the paddle to be immovable
    paddle.body.immovable = true;

    game.physics.arcade.checkCollision.down = false;
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);
    // drawing the bricks
    initBricks();

    //score 
    textStyle = { font: '18px Arial', fill: '#0095DD' };
    scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
    livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle);
    livesText.anchor.set(1,0);
    lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, '失误了，鼠标点击继续', textStyle);
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;

    startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);


}

  // uodate ball position on each frame

function update() {
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);
    game.physics.arcade.collide(ball, bricks, ballHitBrick);

    if(playing) {
        paddle.x = game.input.x || game.world.width*0.5;
    }
}

function initBricks() {
    brickInfo = {
        width: 50,
        height: 20,
        count: {
            row: 3,
            col: 7
        },
        offset: {
            top: 50,
            left: 60
        },
        padding: 10
    };
    bricks = game.add.group();
    for(c=0; c<brickInfo.count.col; c++) {
        for(r=0; r<brickInfo.count.row; r++) {
            var brickX = (c*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
            var brickY = (r*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;
            newBrick = game.add.sprite(brickX, brickY, 'brick');
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            newBrick.body.immovable = true;
            newBrick.anchor.set(0.5);
            bricks.add(newBrick);
        }
    }
}

function ballHitBrick(ball, brick) {
    
    var killTween = game.add.tween(brick.scale);
    killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function(){
        brick.kill();
    }, this);
    killTween.start();

    score += 10;
    scoreText.setText('Points: '+score);

    var count_alive = 0;
    for (i = 0; i < bricks.children.length; i++) {
      if (bricks.children[i].alive == true) {
        count_alive++;
      }
    }
    if (count_alive == 0) {
      alert('恭喜你获胜了');
      location.reload();
    }
}

function ballLeaveScreen() {
    lives--;
    if(lives) {
        livesText.setText('Lives: '+lives);
        lifeLostText.visible = true;
        ball.reset(game.world.width*0.5, game.world.height-25);
        paddle.reset(game.world.width*0.5, game.world.height-5);
        game.input.onDown.addOnce(function(){
            lifeLostText.visible = false;
            ball.body.velocity.set(150, -150);
        }, this);
    }
    else {
        alert('你输了，游戏结束');
        location.reload();
    }
}

function ballHitPaddle(ball, paddle) {
    ball.animations.play('wobble');
    ball.body.velocity.x = -1*5*(paddle.x-ball.x);
}
function startGame() {
    startButton.destroy();
    ball.body.velocity.set(150, -150);
    playing = true;
}
