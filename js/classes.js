class Tank extends PIXI.Sprite{
    constructor(file="tank_red.png"){
        super(PIXI.loader.resources["images/" + file].texture);
        this.anchor.set(.5,.5);
        this.scale.set(1);
        this.isAlive = true;
        this.radius = 15;
    }
}

class Bullet extends PIXI.Graphics{
    constructor(color=0xFF0000, x=0, y=0, rotation=0){
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,5,5);
        this.endFill();
        
        this.fwd = {x:Math.cos(rotation),y:Math.sin(rotation)};
        this.x = x + this.fwd.x * 8;
        this.y = y + this.fwd.y * 8;
        this.speed = 400;
        this.isAlive = true;
        this.active = false;
        this.radius = 2.45;
        this.timer = 0;
    }
    
    reflectX(){
        this.fwd.x *= -1;
    }
    
    reflectY(){
        this.fwd.y *= -1;
    }
}