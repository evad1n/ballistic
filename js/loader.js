WebFont.load({
  google: {
    families: ['Audiowide']
  },
  active: e => {
    console.log("font loaded!");
    // pre-load the images
    PIXI.loader.add(["images/tank_blue.png", "images/explosions.png", "images/tank_red.png", "images/music.png", "images/musicMute.png", "sounds/shoot.wav", "sounds/hit.mp3", "sounds/fireball.mp3", "sounds/buttonPush.mp3", "sounds/bulletExpire.mp3", "sounds/theme.mp3"]).
      load(setup);
  }
});