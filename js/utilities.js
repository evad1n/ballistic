// http://paulbourke.net/miscellaneous/interpolation/

// we use this to interpolate the ship towards the mouse position
function lerp(start, end, amt) {
    return start * (1 - amt) + amt * end;
}

// we didn't use this one
function cosineInterpolate(y1, y2, amt) {
    let amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
    return (y1 * (1 - amt2)) + (y2 * amt2);
}

// we use this to keep the ship on the screen
function clamp(val, min, max) {
    return val < min ? min : (val > max ? max : val);
}

// bounding box collision detection - it compares PIXI.Rectangles
function rectsIntersect(a, b, buffer = 0) {
    let ab = a.getBounds();
    let bb = b.getBounds();
    return ab.x + (ab.width - buffer) > bb.x && ab.x < bb.x + (bb.width - buffer) && ab.y + (ab.height - buffer) > bb.y && ab.y < bb.y + (bb.height - buffer);
}

function circleCollision(a, b) {
    let circle1 = { radius: a.radius, x: a.x, y: a.y };
    let circle2 = { radius: b.radius, x: b.x, y: b.y };

    let dx = circle1.x - circle2.x;
    let dy = circle1.y - circle2.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    return distance < (circle1.radius + circle2.radius);
}

// these 2 helpers are used by classes.js
function getRandomUnitVector() {
    let x = getRandom(-1, 1);
    let y = getRandom(-1, 1);
    let length = Math.sqrt(x * x + y * y);
    if (length == 0) { // very unlikely
        x = 1; // point right
        y = 0;
        length = 1;
    } else {
        x /= length;
        y /= length;
    }

    return { x: x, y: y };
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

//Used by tanks to move in the direction they are facing
function move(object, distance) {
    object.x = object.x + distance * Math.cos(object.rotation);
    object.y = object.y + distance * Math.sin(object.rotation);
}