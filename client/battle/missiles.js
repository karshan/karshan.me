"use strict";

var missiles = {
    SPEED: 5,
    WIDTH: 3,
    HEIGHT: 3,
    
    arr: [],

    add: function(type, pos, dir) {
        missiles.arr.push({
            pos: pos,
            dir: dir,
            type: type
        });
    },

    step: function() {
        var m; 
        for (var i = 0; i < missiles.arr.length; i++) {
            m = missiles.arr[i];
            var rect = { pos: m.pos, w: missiles.WIDTH, h: missiles.HEIGHT };
            var collisions = map.collide(rect);
            if (collisions.length !== 0) {
                map.explode(m.pos.x, m.pos.y, m.dir, collisions);
                m.dead = true;
                continue;
            }

            if (player.collide(m.pos.x, m.pos.y, missiles.WIDTH, missiles.HEIGHT) && m.type == "enemy")
                player.explode();

            for (var j = 0; j < game.enemies.length; j++) {
                if (m.type == "enemy") break;
                if (game.enemies[j].collide(m.pos.x, m.pos.y, missiles.WIDTH, missiles.HEIGHT))
                    game.enemies[j].explode();
            }
            
            m.pos.x += m.dir.dx * missiles.SPEED;
            m.pos.y += m.dir.dy * missiles.SPEED;
        }

        var out = [];
        for (var i = 0; i < missiles.arr.length; i++) {
            m = missiles.arr[i];
            if (m.dead == true) continue;
            out.push(m);
        }
        missiles.arr = out;    
    },

    draw: function() {
        for (var i = 0; i < missiles.arr.length; i++) {
            var m = missiles.arr[i];
            game.ctx.fillStyle = "#ffffff";
            game.ctx.fillRect(m.pos.x, m.pos.y, missiles.WIDTH, missiles.HEIGHT);
        } 
    }

};
