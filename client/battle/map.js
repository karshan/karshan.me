"use strict";

var map = {

    generate: function(cb) {
        $.ajax({
            type: "POST",
            url: url_prefix + '/map',
            success: function(data) {
                map.grid = map.parse(data);
                cb({ ok : true });
            },
            error: function(xhr, textStatus, e) {
                cb({ error: testStatus) });
            }
        });
    },

    parse: function() {
    }


};
