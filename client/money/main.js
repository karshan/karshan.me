"use strict";

var url_prefix = "http://" + window.location.hostname + ':' + window.location.port;

var global_data = {};

// stolen from http://stackoverflow.com/questions/11/calculating-relative-time
function fuzzytime(date) {
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

function mixin(a, b) {
    var out = {};
    for (var k in a) {
        out[k] = a[k];
    }
    for (var k in b) {
        out[k] = b[k];
    }
    return out;
} 

function format_amount(a) {
	return (a > 0 ? "+" : "") + Number(a).toFixed(2);
}

function get_transactions(auth, cb) {
	$.ajax({
        type: "POST",
        processData: false,
        data: JSON.stringify(auth),
        cache: false,
        url: url_prefix + '/money/get',
        success: function(data) {
            cb(data);
        },
        error: function(xhr, textStatus, e) {
            cb({"error": "ajax error"}); // TODO give more info about the error
        }
    });
}

function add_transaction(transaction, cb) {
	$.ajax({
        type: "POST",
        processData: false,
        data: JSON.stringify(mixin(global_data.login, {transaction: transaction})),
        url: url_prefix + '/money/add',
        success: function(data) {
            cb(data);
        },
        error: function(xhr, textStatus, e) {
            cb({"error": "ajax error"}); // TODO give more info about the error
        }
    });	
}

function render_balance(transactions) {
	var balance = transactions.reduce(function(sum, a) { return sum + a.amount }, 0);
	$("#balance").html(format_amount(balance));
}

function render_overview_by_category() {
    var transactions = global_data.transactions;
	render_balance(transactions);
	
	var bycategory = {};
	
	for (var i in transactions) {
		var t = transactions[i];
		// TODO: nicer one line way to do this
		if (bycategory[t.category] === undefined) {
			bycategory[t.category] = [];
		}
		bycategory[t.category].push(t);
	}

    // TODO templating!!!
	var html = "";
	for (var c in bycategory) {
		var transactions = bycategory[c];
		var amount = transactions.reduce(function(sum, a) { return sum + a.amount }, 0);
		html += '<li class="full_width border_none border_bottom fixed_height_small">' +
                    '<span class="float_left bold pad_x">' + c + '</span>' +
			        '<span class="float_right pad_x">' +  format_amount(amount) + '</span>' +
                '</li>';
	}
	$("#transaction_list").html(html);
}

function render_overview_by_time() {
    var transactions = global_data.transactions;
	render_balance(transactions);

	transactions.sort(function(a, b) { return b.timestamp - a.timestamp });

    // TODO templating!!!
	var html = "";
	for (var i in transactions) {
		var t = transactions[i];
		html += '<li class="full_width border_none border_bottom fixed_height_huge position_relative">' +
                    '<span class="float_left bold pad_x">' + t.name + '</span>' +
                    '<span class="float_left pad_x">' + t.category + '</span>' +
			        '<span class="float_right pad_x">' +  format_amount(t.amount) + '</span>' +
                    '<span class="bottom_right info_font">' + fuzzytime(t.timestamp) + '<span>' +
                '</li>';
	}
	$("#transaction_list").html(html);
}


function get_and_show_overview(login) {
	get_transactions({
		username: login.username,
		password: login.password
	}, function(res) {
		if (res.error) {
			alert(res.error);
            logout();
		} else {
            if ($("#remember_me").is(":checked")) {
                if (window.localStorage) {
                    window.localStorage.setItem("username", login.username);
                    window.localStorage.setItem("password", login.password);
                } else {
                    alert("sorry your browser suck you won't be remembered");
                }
            }
			global_data.login = {
                username: login.username,
			    password: login.password
            };
			global_data.transactions = res.transactions;
			kweb.showPage("overview", res.transactions);
		}
		$("#username").val("");
		$("#password").val("");
	});
}

function logout() {
    unremember_login();
    global_data = {};
    kweb.showPage("login");
}


function unremember_login() {
    if (window.localStorage) {
        window.localStorage.clear();
    }
}

function remembered_login() {
    if (!window.localStorage) {
        return false;
    } else {
        var username = window.localStorage.getItem("username");
        var password = window.localStorage.getItem("password");
        if (username && password) {
            return {
                "username": username,
                "password": password
            };
        } else {
            return false;
        }
    }
}

$(document).ready(function() {
    if (window.localStorage) {
        var login = remembered_login();
        if (login !== false) {
            get_and_show_overview(login);
        } else {
            kweb.showPage("login");
        }
    } else {
        kweb.showPage("login");
    }

    kweb.onPageLoad("overview", function() {
        get_transactions(global_data.login, function(res) {
            if (res.error) {
                alert(res.error);
                logout();
            } else {
                if ($("#sort_by_button").html() === "Category")
                    render_overview_by_category();
                else
                    render_overview_by_time();
            }
        })
    });

    kweb.onPageLoad("add_transaction", function(page) {
    	$("#when").val((new Date()).toString()); // TODO only display Year Month Day
    });
    
    $("#password").keypress(function(e) {
        if (e.which == 13) {
            login();
        }
    });
});

// Click handlers
function login() {
    get_and_show_overview({
        username: $("#username").val(),
        password: $("#password").val()
    });
}

function add_current_transaction() {
    var amount = parseFloat($("#amount").val());
    var timestamp = new Date($("#when").val());

    if (isNaN(amount) || amount < 0.0) {
        return alert("Amount must be a positive real number");
    }

    if (isNaN(timestamp)) {
        return alert("Invalid Date");
    }

    if ($("#transaction_type_button").html() === "Expense") {
        amount = -amount;
    }

    add_transaction({
        "name": $("#name").val(),
        "amount": amount,
        "category": $("#category").val(),
        "timestamp": timestamp.getTime(),
        "comment": $("#comment").val()
    }, function(res) {
        alert(JSON.stringify(res));
        if (res.error) {
            alert(res.error);
        }
        kweb.showPage("overview");
    });
}

function toggle_transaction_type(elt) {
    var new_val = elt.innerHTML === "Expense" ? "Income" : "Expense";
    elt.innerHTML = new_val;
}

function toggle_sort_by(elt) {
    var new_val = elt.innerHTML === "Category" ? "Time" : "Category";
    elt.innerHTML = new_val;
    kweb.showPage("overview");
}

