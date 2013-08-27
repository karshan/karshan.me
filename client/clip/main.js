"use strict";

var url_prefix = "http://" + window.location.hostname + ':' + window.location.port;

// stolen from http://stackoverflow.com/questions/11/calculating-relative-time
function datestr(date) {
    var d = new Date(date);
    return (d.getDate()) + '/' + (d.getMonth()+1) + '/' + (d.getYear()+1900); // FIXME below errors randomly

    var delta = new Date().getTime() - date;

    var SECOND = 1000.0;
    var MINUTE = 60 * SECOND;
    var HOUR = 60 * MINUTE;
    var DAY = 24 * HOUR;
    var MONTH = 30 * DAY;
    var YEAR = 12 * MONTH;

    var ts = {
        "Seconds": Math.floor(delta/SECOND),
        "Minutes": Math.floor(delta/MINUTE),
        "Hours": Math.floor(delta/HOUR),
        "Days": Math.floor(delta/DAY),
        "Months": Math.floor(delta/MONTH),
        "Years": Math.floor(delta/YEAR),
    };

    if (delta < 0)
    {
      return "not yet";
    }
    if (delta < 1 * MINUTE)
    {
      return ts.Seconds == 1 ? "one second ago" : ts.Seconds + " seconds ago";
    }
    if (delta < 2 * MINUTE)
    {
      return "a minute ago";
    }
    if (delta < 45 * MINUTE)
    {
      return ts.Minutes + " minutes ago";
    }
    if (delta < 90 * MINUTE)
    {
      return "an hour ago";
    }
    if (delta < 24 * HOUR)
    {
      return ts.Hours + " hours ago";
    }
    if (delta < 48 * HOUR)
    {
      return "yesterday";
    }
    if (delta < 30 * DAY)
    {
      return ts.Days + " days ago";
    }
    if (delta < 12 * MONTH)
    {
      months = ts.Months;
      return months <= 1 ? "one month ago" : months + " months ago";
    }
    else
    {
      years = ts.Days/365;
      return years <= 1 ? "one year ago" : years + " years ago";
    }
}

function display_clip_list(clipboard) {
    var ul = $('#cliplist');
    ul.empty();

    clipboard.sort(function(a, b) {
        return b.date - a.date;
    });

    // Yes this is vulnerable to XSS
    for (var i in clipboard) {
        ul.append(
          '<li>' +
            '<pre><a href="' + clipboard[i].text + '">' + clipboard[i].text + '</a></pre>' +
            '<span class="time">' + datestr(clipboard[i].date) + '</span>' +
            '<span class="delete_btn" onclick=\'delete_from_clip("' + clipboard[i]._id + '", "' + clipboard[i]._rev + '")\'>delete</span>' +
          '</li>'
        );
    }

    var addlist = addCache.get();
    for (var i in addlist) {
        ul.append(
          '<li>' +
            '<pre>' + addlist[i] + '</a></pre>' +
          '</li>'
        );
    }
}

function genStore(key) {
    return {
        "save": function(data) {
            window.localStorage.setItem(key, JSON.stringify(data));
        },
        "get": function() {
            var out = null;
            try {
                out = JSON.parse(window.localStorage.getItem(key));
            } catch(e) {
                return [];
            }
            return out;
        }
    };
}

function genArrayStore(key) {
    var store = genStore(key);
    store.save([]);
    return {
        "push": function(elt) {
            store.save(store.get().push(elt));
        },
        "get": store.get,
        "save": store.save
    };
}

var cache = genStore("clipCache");
var addCache = genArrayStore("addCache");

function get_and_display() {
    if (window.navigator.onLine === true || window.navigator.onLine === undefined) {
        $.ajax({
            type: "GET",
            url: url_prefix + '/clip/get',
            success: function(data) {
                if (data.error) {
                    return alert(data.error);
                }

                cache.save(data);
                display_clip_list(data);
            },
            error: function(xhr, textStatus, e) {
                alert('ajax error');
                display_clip_list(cache.get()); 
            }
        });
    } else {
        display_clip_list(cache.get()); 
    }
}

function delete_from_clip(id, rev) {
    if (window.navigator.onLine === true || window.navigator.onLine === undefined) {
        $.ajax({
            type: "POST",
            url: url_prefix + '/clip/delete',
            data: JSON.stringify({"id": id, "rev": rev}),
            processData: false,
            success: function(data) {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                get_and_display();
                $('#cliptext').val('');
            },
            error: function(xhr, textStatus, e) {
                alert('ajax error');
            }
        });
    } else {
        alert("cant delete while offline");
    }
}

function add_to_clip(text) {
    if (window.navigator.onLine === true || window.navigator.onLine === undefined) {
        $.ajax({
            type: "POST",
            url: url_prefix + '/clip/put',
            data: JSON.stringify({"text": text}),
            processData: false,
            success: function(data) {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                get_and_display();
                $('#cliptext').val('');
            },
            error: function(xhr, textStatus, e) {
                alert('ajax error');
            }
        });
    } else {
       addCache.push(text);
    }
}

$(document).ready(function() {
    get_and_display();

    $('#save').click(function(e) {
        add_to_clip($('#cliptext').val());
    });
    $('#cliptext').keypress(function(e) {
        if (e.which == 13) {
            add_to_clip($('#cliptext').val());
        }
    });
});

