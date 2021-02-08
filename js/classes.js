class Tank extends PIXI.Sprite {
    constructor(file = "tank_red.png") {
        super(PIXI.loader.resources["images/" + file].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.isAlive = true;
        this.radius = 15;
    }
}

class Bullet extends PIXI.Graphics {
    constructor(color = 0xFF0000, x = 0, y = 0, rotation = 0) {
        super();
        this.beginFill(color);
        this.drawRect(-2, -3, 5, 5);
        this.endFill();

        this.fwd = { x: Math.cos(rotation), y: Math.sin(rotation) };
        this.x = x + this.fwd.x * 8;
        this.y = y + this.fwd.y * 8;
        this.speed = 400;
        this.isAlive = true;
        this.active = false;
        this.radius = 2.45;
        this.timer = 0;
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}

const NEIGHBORS = { "left": 0, "right": 1, "top": 2, "bot": 3 };
Object.freeze(NEIGHBORS);

class Maze {
    constructor(width, height, cellSize) {
        this.cells = [];

        let cols = width / cellSize;
        let rows = height / cellSize;

        for (let x = 0; x < cols; x++) {
            let col = [];
            for (let y = 0; y < rows; y++) {
                col.push(new Cell());
            }
            this.cells.push(col);
        }
    }

    generateWalls(x, y) {
        this.cells[x][y].visited = true;
        this.cells[x][y].recursing = true;
        while (true) {
            let n = [];
            if (row > 0 && !this.cells[row - 1][col].visited) {
                n.push(NEIGHBORS.left);
            }
            if (row < this.cells.size() - 1 && !this.cells[row + 1][col].visited) {
                n.push(NEIGHBORS.right);
            }
            if (col < this.cells[0].size() - 1 && !this.cells[row][col + 1].visited) {
                n.push(NEIGHBORS.top);
            }
            if (col > 0 && !this.cells[row][col - 1].visited) {
                n.push(NEIGHBORS.bot);
            }

            if (n.size() == 0) {
                this.cells[row][col].recursing = false;
                return;
            }

            // let r = Math.random() % n.size()

            if (n[r] == NEIGHBORS.left) {
                this.cells[row][col].left = false;
                this.cells[row - 1][col].right = false;
                this.RemoveWallsRecursive(row - 1, col);
            } else if (n[r] == NEIGHBORS.right) {
                this.cells[row][col].right = false;
                this.cells[row + 1][col].left = false;
                this.RemoveWallsRecursive(row + 1, col);
            } else if (n[r] == NEIGHBORS.top) {
                this.cells[row][col].top = false;
                this.cells[row][col + 1].bot = false;
                this.RemoveWallsRecursive(row, col + 1);
            } else {
                this.cells[row][col].bot = false;
                this.cells[row][col - 1].top = false;
                this.RemoveWallsRecursive(row, col - 1);
            }
        }
    }
}

class Cell {
    constructor() {
        this.visited = false;
        this.left = this.right = this.top = this.bot = false;
    }

    reset() {
        this.visited = false;
        this.left = this.right = this.top = this.bot = false;
    }
}