class PongGame extends Phaser.Scene {
  constructor() {
    super();
    this.leftScore = 0;
    this.rightScore = 0;
    this.ballSpeed = 300;
    this.speedIncrement = 20;
    this.waitTime = 1000;
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    this.createCenterLine();

    this.leftScore = 0;
    this.rightScore = 0;

    this.leftScoreText = this.add
      .text(this.sys.game.config.width * 0.25, 50, '0', {
        fontSize: '48px',
        color: '#FFFFFF',
        fontFamily: 'Courier',
      })
      .setOrigin(0.5);

    this.rightScoreText = this.add
      .text(this.sys.game.config.width * 0.75, 50, '0', {
        fontSize: '48px',
        color: '#FFFFFF',
        fontFamily: 'Courier',
      })
      .setOrigin(0.5);

    this.leftPaddle = this.add.rectangle(
      50,
      this.sys.game.config.height / 2,
      10,
      100,
      0xffffff
    );
    this.physics.add.existing(this.leftPaddle, true);

    this.rightPaddle = this.add.rectangle(
      this.sys.game.config.width - 50,
      this.sys.game.config.height / 2,
      10,
      100,
      0xffffff
    );
    this.physics.add.existing(this.rightPaddle, true);

    this.ball = this.add.rectangle(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2,
      10,
      10,
      0xffffff
    );
    this.physics.add.existing(this.ball);

    this.ball.body.setBounce(1, 1);
    this.ball.body.setCollideWorldBounds(true);
    this.physics.world.setBoundsCollision(false, false, true, true);

    this.launchBall();

    this.physics.add.collider(
      this.ball,
      this.leftPaddle,
      this.hitPaddle,
      null,
      this
    );
    this.physics.add.collider(
      this.ball,
      this.rightPaddle,
      this.hitPaddle,
      null,
      this
    );

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wKey = this.input.keyboard.addKey('W');
    this.sKey = this.input.keyboard.addKey('S');
  }

  createCenterLine() {
    const lineHeight = 20;
    const gap = 10;
    const startY = 10;
    const centerX = this.sys.game.config.width / 2;

    for (
      let y = startY;
      y < this.sys.game.config.height;
      y += lineHeight + gap
    ) {
      this.add.rectangle(centerX, y, 2, lineHeight, 0xffffff);
    }
  }

  launchBall(direction = 0) {
    this.ball.body.setVelocity(0, 0);
    this.ball.setPosition(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2
    );

    this.time.delayedCall(this.waitTime, () => {
      const angle = Phaser.Math.Between(-45, 45);

      let dir = direction;
      if (dir === 0) {
        dir = Math.random() < 0.5 ? -1 : 1;
      }

      const velocity = this.physics.velocityFromAngle(angle, this.ballSpeed);
      this.ball.body.setVelocity(velocity.x * dir, velocity.y);

      console.log(
        `Ball launched towards ${dir === 1 ? 'right' : 'left'} at speed ${
          this.ballSpeed
        }`
      );
    });
  }

  hitPaddle(ball, paddle) {
    let diff = ball.y - paddle.y;
    const normalizedDiff = diff / (paddle.height / 2);
    const angle = normalizedDiff * 60;

    const velocity = this.physics.velocityFromAngle(angle, this.ballSpeed);
    if (paddle === this.leftPaddle) {
      this.ball.body.setVelocity(Math.abs(velocity.x), velocity.y);
    } else {
      this.ball.body.setVelocity(-Math.abs(velocity.x), velocity.y);
    }
  }

  update() {
    if (this.wKey.isDown && this.leftPaddle.y > 50) {
      this.leftPaddle.y -= 10;
      this.leftPaddle.body.updateFromGameObject();
    } else if (
      this.sKey.isDown &&
      this.leftPaddle.y < this.sys.game.config.height - 50
    ) {
      this.leftPaddle.y += 10;
      this.leftPaddle.body.updateFromGameObject();
    }

    if (this.cursors.up.isDown && this.rightPaddle.y > 50) {
      this.rightPaddle.y -= 10;
      this.rightPaddle.body.updateFromGameObject();
    } else if (
      this.cursors.down.isDown &&
      this.rightPaddle.y < this.sys.game.config.height - 50
    ) {
      this.rightPaddle.y += 10;
      this.rightPaddle.body.updateFromGameObject();
    }

    if (this.ball.x <= 0) {
      this.rightScore++;
      this.rightScoreText.setText(this.rightScore);

      this.ballSpeed += this.speedIncrement;

      console.log(`Right player scored! Ball speed is now ${this.ballSpeed}`);

      this.launchBall(-1);
    } else if (this.ball.x >= this.sys.game.config.width) {
      this.leftScore++;
      this.leftScoreText.setText(this.leftScore);

      this.ballSpeed += this.speedIncrement;

      console.log(`Left player scored! Ball speed is now ${this.ballSpeed}`);

      this.launchBall(1);
    }
  }
}

const container = document.getElementById('renderDiv');
const config = {
  type: Phaser.AUTO,
  parent: container,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: PongGame,
};

window.phaserGame = new Phaser.Game(config);
