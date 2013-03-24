"use strict";

var button = [];

// left
button[37] = function(keyup) {
    if (keyup == true) {
        player.move(null);
    } else {
        player.move({ dx: -1, dy: 0 });
    }
}

// up
button[38] = function(keyup) {
    if (keyup == true) {
        player.move(null);
    } else {
        player.move({ dx: 0, dy: -1 });
    }
}

// right
button[39] = function(keyup) {
    if (keyup == true) {
        player.move(null);
    } else {
        player.move({ dx: 1, dy: 0 });
    }
}

// down
button[40] = function(keyup) {
    if (keyup == true) {
        player.move(null);
    } else {
        player.move({ dx: 0, dy: 1 });
    }
}

// spacebar
button[32] = function(keyup) {
    if (keyup == false) {
        player.fire();
    }
}
