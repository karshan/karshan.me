"use strict";

var player = {
    SCALE: 2,
    SPEED: 1,
    WIDTH: null,
    HEIGHT: null,
    FIRERATE: 10,

    position: null,
    offset: { x: 0, y: 0 },
    next_dir: null,
    dir: null,
    facing: { dx: 0, dy: -1 },
    fire_next: false,
    fired: 0,

    spawn: function() {
        player.WIDTH = player.SCALE * game.SCALE;
        player.HEIGHT = player.SCALE * game.SCALE;
        var grid = map.grid;

        for (var y = 0; y < grid.length - 1; y++) {
            for (var x = 0; x < grid[0].length - 1; x++) {
                if (grid[y][x] == 'x' && grid[y + 1][x + 1] == 'x') {
                    player.position = { x: game.SCALE * x, y: game.SCALE * y };
                    break;
                }
            }
        }
    },

    explode: function() {
        game.stop();
    },

    move: function(dir) {
        player.next_dir = dir;
        
        if (dir != null)
            player.facing = dir;
    },

    fire_missile: function() {
        var dx = Math.floor(player.WIDTH/2);
        var dy = Math.floor(player.HEIGHT/2);
        var x = player.position.x + dx - 1;
        var y = player.position.y + dy - 1; 
        missiles.add("player", {
            x: x + player.facing.dx * dx,
            y: y + player.facing.dy * dy
        }, player.facing);
        player.fired = player.FIRERATE;
    },

    fireratelimit: function() {
        if (player.fired !== 0)
            player.fired--;
        return player.fired == 0;
    },

    step: function() {
        if (player.position.x % game.SCALE == 0 &&
                player.position.y % game.SCALE == 0 &&
                player.next_dir !== null) {
            player.dir = {
                dx: player.SPEED * sgn(player.next_dir.dx),
                dy: player.SPEED * sgn(player.next_dir.dy)
            };
        }

        if (player.fire_next == true && player.fireratelimit() == true) {
            player.fire_missile();
            player.fire_next = false;
        }

        if (player.dir == null) return;

        var tpos = { x: player.position.x, y: player.position.y };
        tpos.x += player.dir.dx;
        tpos.y += player.dir.dy;
        if (map.collide({ pos: tpos, w: player.SCALE * game.SCALE, h: player.SCALE * game.SCALE }) == false ) {
            player.position = tpos; 
        }

        if (player.position.x % game.SCALE == 0 && player.position.y % game.SCALE == 0) {
            player.dir = null;
        }
    },

    fire: function() {
        player.fire_next = true;
    },

    draw: function() {
        var ctx = game.ctx;

        ctx.fillStyle = "#44aacc";
        ctx.fillRect(player.position.x, player.position.y, 
            player.SCALE * game.SCALE, player.SCALE * game.SCALE);
    },

    collide: function(x, y, w, h) {
        return (x >= player.position.x && x + w <= player.position.x + player.WIDTH &&
            y >= player.position.y && y + h <= player.position.y + player.HEIGHT);
    }

};
