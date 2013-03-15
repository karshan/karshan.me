"use strict";

var http = require("http");
var http_util = require("http_util");

var ports = {
    clip: require("./clip/settings").port,
    money: require("./money/settings").port,
    battle: require("./battle/settings").port
};

var handlers = {};

handlers["^/clip$"] = handlers["^/clip/.*$"] = create_proxy_handler(ports.clip); 
handlers["^/money$"] = handlers["^/money/.*$"] = create_proxy_handler(ports.money);
handlers["^/battle$"] = handlers["^/battle/.$"] = create_proxy_handler(ports.battle);

function create_proxy_handler(port) {
    return function(options) {
        var rq = options.request;
        var postdata = '';

        rq.on('data', function(data) {
            postdata += data;
        });
        
        rq.on('end', function() {
            var data = undefined;
            if (postdata.length)
                data = postdata;
            http_util.request({
                method: rq.method,
                path: rq.url,
                data: data,
                host: "localhost",
                port: port
            }, function(res) {
                if (res.error) {
                    options.response.writeHead(404, { "Content-Type": "text/plain" });
                    options.response.write("Error contacting subpath handler");
                    options.response.end();
                    return;
                }
                options.response.writeHead(res.res.statusCode, res.res.headers);
                options.response.write(res.data);
                options.response.end();
            });
        });
    };
}

handlers["^/client/.*"] = function(options) {
    options.static(options);
};

module.exports = handlers;
