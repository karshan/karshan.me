"use strict";

var couchdb = require('couchdb').create({
    "host": "127.0.0.1",
    "port": 5984
});
var util = require("handler_util");
var log = require("log");

// TODO rename this getpost_and_login (make it obvious that options.input has been filled in :/ or do it another way)
function login(options, cb) {
    util.getpostJSON(options, function(res) {
        if (res.error) {
            return cb(res);
        }

        options = util.mixin(options, res);
		if (options.input === undefined ||
			    typeof options.input.username !== "string" ||
			    options.input.username === "" ||
			    typeof options.input.password !== "string" ||
			    options.input.password === "") {
			return cb({"error": "bad input"});
		}

		couchdb.get({
			db: "money_auth",
			doc: options.input.username
		}, function(res) {
			if (res.error && res.error !== "not_found") {
				cb({"error": "internal error"});
			} else if (res.password === options.input.password) {
				cb(options); // LOGIN succesful
			} else {
			    cb({"error": "authentication failed"});
            }
		});
	});
}

var handlers = {};

handlers["^/money$"] = handlers["^/money/$"] = function(options) {
    // REDIRECT to /client/money/index.html
    options.response.writeHead(301, {"Location": "/client/money/index.html"});
    options.response.end();
};

handlers["^/money/get"] = function(options) {
	login(options, function(res) {
        if (res.error) {
            return util.writeJSON(options.response, res);
        }

        options = util.mixin(options, res);
        couchdb.get({"doc": "_all_docs?include_docs=true", "db": "money"}, function(res) {
            if (res.error) {
                log(res);
                util.writeJSON(options.response, {"error": "internal error"});
                return;
            }
            util.writeJSON(options.response, {
                transactions: res.rows.map(function(a) {
                    return a.doc;
                })
            });
        });
    });
};

handlers["^/money/add"] = function(options) {
	login(options, function(res) {
        if (res.error) {
            return util.writeJSON(options.response, res);
        }

        options = util.mixin(options, res);
        if (options.input.transaction === undefined ||
            typeof options.input.transaction.name !== "string" || 
            typeof options.input.transaction.amount !== "number" ||
            typeof options.input.transaction.category !== "string" ||
            typeof options.input.transaction.comment !== "string" ||
            typeof options.input.transaction.timestamp !== "number") {
                log({
                    "error": "unexpected input",
                    "input": options.input
                });
                util.writeJSON(options.response, {"error": "bad input"});
                return;
        }

        options.input.transaction.timestamp_server = new Date().getTime();
        couchdb.post({
            "db": "money",
            "doc": "",
            "data": options.input.transaction
        }, function(res) {
            if (res.error) {
                log(res);
                util.writeJSON(options.response, {"error": "internal error"});
                return;
            }
            util.writeJSON(options.response, { "ok": true });
        });
    });
};

module.exports = handlers;
