"use strict";

var couchdb = require('couchdb').create({
    "host": "127.0.0.1",
    "port": 5984
});
var util = require("handler_util");
var log = require("log");

var handlers = {};

handlers["^/battle$"] = handlers["^/battle/$"] = function(options) {
    options.response.writeHead(301, {"Location": "/client/battle/index.html"});
    options.response.end();
};

module.exports = handlers;
