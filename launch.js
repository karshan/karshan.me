"use strict";

var handlers = require("./server/handlers");
var http = require("http");
var url = require("url");
var log = require("log");
var static_handler = require("static_handler");

// TODO ssl
http.createServer(function(request, response) {
    var pathname = url.parse(request.url).pathname; // this just strips url params from the url

    log({
        method: request.method,
        url: request.url,
        ip: request.connection.remoteAddress,
        time: new Date().toString()
    });

   for (var key in handlers) {
        var regex = new RegExp(key);
        if (regex.test(pathname) == true) {
            return handlers[key]({
                "pathname": pathname,
                "request": request,
                "response": response,
                "static": static_handler.create(".")
            });
        }
    }
    // router contained no handler for this pathname
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 No Handler");
    response.end();
}).listen(1337);
