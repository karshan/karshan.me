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
            return util.writeJSON(options.response, {"error": "internal error"});
        }
        util.writeJSON(
            options.response,
            res.rows.map(function(a) {
                return a.doc;
            })
        );
    });
};

handlers["^/clip/delete$"] = function(options) {
    util.getpostJSON(options, function(res) {
        if (res.error) {
            return util.writeJSON(options.response, res);
        }

        options = util.mixin(options, res);
        if (typeof options.input.id !== "string" || typeof options.input.rev !== "string") {
            log({
                "error": "unexpected input",
                "input": options.input
            });
            return util.writeJSON(options.response, {"error": "bad input"});
        }

        couchdb.delete({
            "db": "clip",
            "doc": options.input.id,
            "rev": options.input.rev
        }, function(res) {
            if (res.error) {
                log(res);
                return util.writeJSON(options.response, res);
            }
            util.writeJSON(options.response, { "ok": true });
        });
    });
};

handlers["^/clip/put"] = function(options) {
    util.getpostJSON(options, function(res) {
        if (res.error) {
            return util.writeJSON(options.response, res);
        }

        options = util.mixin(options, res);
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
                return util.writeJSON(options.response, {"error": "internal error"});
            }
            util.writeJSON(options.response, { "ok": true });
        });
    });
};

module.exports = handlers;
