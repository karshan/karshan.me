"use strict";

var map = {
    grid: null, // map.grid[y][x], 0, 0 is top left.

    generate: function(cb) {
        $.ajax({
            type: "POST",
            url: url_prefix + '/client/battle/maps/0.txt',
            success: function(data) {
                var grid =  map.parse(data);
                if (grid.error) {
                    cb(grid);
                } else {
                    map.grid = grid;
                    cb({ ok : true });
                }
            },
            error: function(xhr, textStatus, e) {
                cb({ error: e });
            }
        });
    },

    parse: function(map) {
        var line = [];
        var out = [];
        var width = 0;
        for (var i = 0; i < map.length; i++) {
            if (map[i] == "\n") {
                if (width == 0) {
                    width = line.length;
                } else if (width != line.length) {
                    return { "error": "map width not constant" };
                }
                out.push(line);
                line = [];
                continue;
            }
            line.push(map[i]);
        }
        return out;
    },

    draw: function() {
        var ctx = game.ctx;

        for (var y = 0; y < map.grid.length; y++) {
            for (var x = 0; x < map.grid[0].length; x++) {
                if (map.grid[y][x] == "#") {
                    ctx.fillStyle = "#882222";
                } else if (map.grid[y][x] == "W") {
                    ctx.fillStyle = "#aaa";
                } else if (map.grid[y][x] == "B") {
                    ctx.fillStyle = "#444";
                } else {
                    ctx.fillStyle = "#000";
                }
                ctx.fillRect(x * game.SCALE, y * game.SCALE,
                    game.SCALE, game.SCALE);
            }
        }
    },

    oob: function(x, y) {
       if (x < 0 || x >= map.grid[0].length || y < 0 || y >= map.grid.length) return true;
       return false;
    },

    blocked: function(x, y) {
        if (map.oob(x, y) == true) return true;
        var tile = map.grid[y][x];
        return tile == '#' || tile == 'W' || tile == 'B';
    },

    collide: function(rect) {
        var x = Math.floor(rect.pos.x/game.SCALE);
        var y = Math.floor(rect.pos.y/game.SCALE);
        var dx = sgn((rect.pos.x + rect.w) % game.SCALE) + Math.floor((rect.pos.x + rect.w)/game.SCALE) - x;
        var dy = sgn((rect.pos.y + rect.h) % game.SCALE) + Math.floor((rect.pos.y + rect.h)/game.SCALE) - y;
        var out = [];
        for (var j = y; j < y + dy; j++) {
            for (var i = x; i < x + dx; i++) {
                if (map.blocked(i, j) == true)
                    out.push({ x: i, y: j });
            }
        }
        return out;
    },

    explode: function(x, y, dir, collisions) {
        var dx = x % game.SCALE;
        var dy = y % game.SCALE;
        x = Math.floor(x/game.SCALE);
        y = Math.floor(y/game.SCALE);

        for (var i = 0; i < collisions.length; i++) {
            var c = collisions[i];
            if (map.oob(c.x, c.y)) continue;
            if (map.grid[c.y][c.x] == "W") return;

            if (map.grid[c.y][c.x] == "B") {
                map.grid[c.y][c.x] = ".";
                alert("your base died");
                game.stop();
            }
        }

        for (var i = 0; i < collisions.length; i++) {
            var c = collisions[i];
            if (!map.oob(c.x, c.y) && map.grid[c.y][c.x] == "#") {
                map.grid[c.y][c.x] = ".";
            }
        }
    },

    drawTile: function(x, y) {
        var ctx = game.ctx;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(x * game.SCALE, y * game.SCALE,
            game.SCALE, game.SCALE);
    }
};
