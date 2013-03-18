"use strict";

var player = {
    SCALE: 2,
    SPEED: 1,

    position: null,
    offset: { x: 0, y: 0 },
    next_dir: null,
    dir: null,

    spawn: function() {
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

    move: function(dir) {
        player.next_dir = dir;
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

    draw: function() {
        var ctx = game.ctx;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(player.position.x, player.position.y, 
            player.SCALE * game.SCALE, player.SCALE * game.SCALE);
    }

};
