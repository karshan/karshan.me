"use strict";

var couchdb = require('couchdb').create({
    "host": "127.0.0.1",
    "port": 5984
});
var util = require("handler_util");
var log = require("log");

var handlers = {};

handlers["^/clip$"] = handlers["^/clip/$"] = function(options) {
    // REDIRECT to /client/clip/index.html
    options.response.writeHead(301, {"Location": "/client/clip/index.html"});
    options.response.end();
};

// this is a simple clipboard server side implementation
handlers["^/clip/get$"] = function(options) {    
    couchdb.get({"doc": "_all_docs?include_docs=true", "db": "clip"}, function(res) {
        if (res.error) {
            log(res);
            util.writeJSON(options.response, {"error": "internal error"});
            return;
        }
        util.writeJSON(options.response, res.rows.map(function(a) {
            return a.doc;
        }));
    });
};

handlers["^/clip/put"] = util.getpostify(function(options) {
    if (typeof options.input.text !== "string" || options.input.text === "") {
            log({
                "error": "unexpected input",
                "input": options.input
            });
            util.writeJSON(options.response, {"error": "bad input"});
            return;
    }

    couchdb.post({
        "db": "clip",
        "doc": "",
        "data": { "text": options.input.text, "date": new Date().getTime() }
    }, function(res) {
        if (res.error) {
            log(res);
            util.writeJSON(options.response, {"error": "internal error"});
            return;
        }
        util.writeJSON(options.response, { "ok": true });
    });
});
// end CLIP handlers

module.exports = handlers;
