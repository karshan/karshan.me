// TODO this file is replicated for each subpath server I have
// should just have one copy of this file and it should take a commandline argument
// for which subpath handler set to attach to.
// then write a script that launch's the main server and all subpath servers....

"use strict";

var handlers = require("./handlers");
var settings = require("./settings")
var http = require("http");
var url = require("url");

http.createServer(function(request, response) {
    var pathname = url.parse(request.url).pathname; // this just strips url params from the url

   for (var key in handlers) {
        var regex = new RegExp(key);
        if (regex.test(pathname) == true) {
            return handlers[key]({
                "pathname": pathname,
                "request": request,
                "response": response,
            });
        }
    }

    // router contained no handler for this pathname
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 No Handler");
    response.end();
}).listen(settings.port);
