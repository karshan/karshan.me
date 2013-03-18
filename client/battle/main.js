"use strict";

// TODO require.js

var url_prefix = "http://" + window.location.hostname + ':' + window.location.port;

document.onkeydown = function(evt) {
    evt = evt || window.event;

    if (typeof button[evt.keyCode] == "function")
        button[evt.keyCode](false);
};

document.onkeyup = function(evt) {
    evt = evt || window.event;

    if (typeof button[evt.keyCode] == "function")
        button[evt.keyCode](true);
};

document.onready = function() {
    game.start();
}
