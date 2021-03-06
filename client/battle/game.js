"use strict";

var game = {
    FPS: 60,
    SCALE: 16, // 1 map.grid[x][y] corresponds to SCALE x SCALE pixels

    interval: null,

    ctx: null,
    canvas: null,
    enemies: [],

    start: function() {
        var canvas = game.canvas = document.getElementById("screen");
        game.ctx = canvas.getContext('2d');
        async.series([
            function(cb) {
                map.generate(function(result) {
                    if (result.error) {
                        cb(result);
                    } else {
                        cb(null);
                    }
                });
            }, function(cb) {
                canvas.width = map.grid[0].length * game.SCALE;
                canvas.height = map.grid.length * game.SCALE;
                player.spawn();
                
                var en = new enemy();
                en.spawn();
                game.enemies.push(en);
                
                game.interval = setInterval(game.step, 1000.0/game.FPS);
            }
        ], function(err, results) {
            if (err) {
                err.where = "game.start";
                console.log(err);
            }
        });
    },

    stop: function() {
        clearInterval(game.interval); 
    },

    step: function() {
        var ctx = game.ctx;
        var canvas = game.canvas;
        var enemies = game.enemies;

        player.step();
        missiles.step();
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].step();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        map.draw();
        player.draw();
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].draw();
        }
        missiles.draw();
    }
};
