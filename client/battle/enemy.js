"use strict";

function enemy() {
    this.SCALE = 2;
    this.WIDTH = this.SCALE * game.SCALE;
    this.HEIGHT = this.SCALE * game.SCALE;
}

enemy.prototype.spawn = function() {
    var grid = map.grid;

    for (var y = 0; y < grid.length - 1; y++) {
        for (var x = 0; x < grid[0].length - 1; x++) {
            if (grid[y][x] == 'e' && grid[y + 1][x + 1] == 'e') {
                this.position = { x: game.SCALE * x, y: game.SCALE * y };
                break;
            }
        }
    }

    this.dir = { dx: 0, dy: 0 };
};

enemy.prototype.fire_missile = function() {
    var dx = Math.floor(this.WIDTH/2);
    var dy = Math.floor(this.HEIGHT/2);
    var x = this.position.x + dx - 1;
    var y = this.position.y + dy - 1; 
    missiles.add("enemy", {
        x: x + this.dir.dx * dx,
        y: y + this.dir.dy * dy
    }, this.dir);
};

enemy.prototype.collide = function(x, y, w, h) {
    return (x >= this.position.x && x + w <= this.position.x + this.WIDTH &&
        y >= this.position.y && y + h <= this.position.y + this.HEIGHT);
};

enemy.prototype.explode = function() {
    game.stop();
};

enemy.prototype.ai = function() {
    var dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];
    this.dir = dirs[Math.floor(Math.random() * dirs.length)];
    if (Math.random() > 0.5) {
        this.fire_missile();
    }
};

enemy.prototype.step = function() {
    if (this.position.x % game.SCALE == 0 && this.position.y % game.SCALE == 0) {
        this.ai();
    }

    var tpos = { x: this.position.x, y: this.position.y };
    tpos.x += this.dir.dx;
    tpos.y += this.dir.dy;
    if (map.collide({ pos: tpos, w: this.SCALE * game.SCALE, h: this.SCALE * game.SCALE }) == false ) {
        this.position = tpos; 
    }
};

enemy.prototype.draw = function() {
    var ctx = game.ctx;

    ctx.fillStyle = "#cc3300";
    ctx.fillRect(this.position.x, this.position.y, 
        this.WIDTH, this.HEIGHT);
};
