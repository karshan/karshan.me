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
                } else {
                    ctx.fillStyle = "#000";
                }
                ctx.fillRect(x * game.SCALE, y * game.SCALE,
                    game.SCALE, game.SCALE);
            }
        }
    },

    blocked: function(x, y) {
        if (x < 0 || x >= map.grid[0].length || y < 0 || y >= map.grid.length) return true;
        var tile = map.grid[y][x];
        return tile == '#' || tile == 'W';
    },

    collide: function(rect) {
        var x = Math.floor(rect.pos.x/game.SCALE);
        var y = Math.floor(rect.pos.y/game.SCALE);
        var dx = Math.floor(rect.w/game.SCALE) + sgn(rect.pos.x % game.SCALE);
        var dy = Math.floor(rect.h/game.SCALE) + sgn(rect.pos.y % game.SCALE);
        for (var j = y; j < y + dy; j++) {
            for (var i = x; i < x + dx; i++) {
                if (map.blocked(i, j) == true)
                    return true;
            }
        }
        return false;
    }
};
