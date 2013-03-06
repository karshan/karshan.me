"use strict";

var url_prefix = "http://" + window.location.hostname + ':' + window.location.port;

var global_data = {};

// stolen from http://stackoverflow.com/questions/11/calculating-relative-time
// and edited to be better
function fuzzytime(date) {
    // TODO better time strings (1 day ago may mean day before or yesterday, that sucks)
    // for now just return dd/mm/yyyy
    var d = new Date(date);
    return (d.getDate()) + '/' + (d.getMonth()+1) + '/' + (d.getYear()+1900);

    var delta = new Date(new Date().getTime() - date);

    var SECOND = 1000.0;
    var MINUTE = 60 * SECOND;
    var HOUR = 60 * MINUTE;
    var DAY = 24 * HOUR;
    var MONTH = 30 * DAY;
    var YEAR = 12 * MONTH;

    var yesterday = new Date().getTime()

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
        url: url_prefix + '/money/get' + '?_=' + (new Date()).getTime(), // prevent caching this get
        success: function(data) {
            cb(data);
        },
        error: function(xhr, textStatus, e) {
            cb({"error": "ajax error"}); // TODO give more info about the error
        }
    });
}

function delete_transaction(id, rev, cb) {
    $.ajax({
        type: "POST",
        processData: false,
        data: JSON.stringify(mixin(global_data.login, {transaction: { id: id, rev: rev}})),
        url: url_prefix + '/money/delete',
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
		html += '<li class="full_width border_none border_bottom fixed_height_big">' +
                    '<span class="float_left size_limited bold pad_x">' + c + '</span>' +
			        '<span class="float_right pad_x">' +  format_amount(amount) + '</span>' +
                '</li>';
	}
	$("#transaction_list").html(html);
}

function is_sameday(a, b) {
    a = new Date(a);
    b = new Date(b);
    return a.getDate() == b.getDate() && a.getMonth() == b.getMonth() && a.getYear() == b.getYear();
}

function days_since(first, current) {
    return (current - first)/1000.0/3600.0/24.0;
}

function get_daily_expense() {
    var transactions = global_data.transactions;
	transactions.sort(function(a, b) { return a.timestamp - b.timestamp });

    var daily_expenses = [];
    var expense_this_day = 0;
    var total_expense = 0;
    var current_day = null;
    var first_day = null;
    for (var i = 0; i < transactions.length; i++) {
        var t = transactions[i];
        
        if (t.amount > 0) {
            continue;
        }

        total_expense += -t.amount;
        if (current_day === null) {
            first_day = current_day = t.timestamp;
        }

        if (is_sameday(current_day, t.timestamp)) {
            expense_this_day += -t.amount;
        } 

        if (!is_sameday(current_day, t.timestamp)) {
            current_day = t.timestamp;
            daily_expenses.push(total_expense/days_since(first_day, current_day));
            expense_this_day = -t.amount;
        }
    }
    
    if (transactions.length !== 0) {
        daily_expenses.push(total_expense/days_since(first_day, current_day));
    }
    
    return daily_expenses;
}

function render_daily_graph() {
    var canvas = document.getElementById("daily_graph");
    var context = canvas.getContext('2d');
    var daily_data = get_daily_expense();
    var max = daily_data.reduce(function(p, v) { return p > v ? p : v; }); 
    var min = daily_data.reduce(function(p, v) { return p < v ? p : v; });
    var axes_inc_dollars = (Math.round( ((max-min)/5)/50 ) * 50);
    var axes_inc_px = axes_inc_dollars/((max - min)/canvas.height);

    canvas.width = window.innerWidth;
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // draw axes
    context.beginPath();
    for (var i = 1; i < 5; i++) {
        context.moveTo(0, canvas.height - i*axes_inc_px );
        context.lineTo(canvas.width, canvas.height - i*axes_inc_px );
    }
    context.lineWidth = 1;
    context.strokeStyle = '#aaa';
    context.stroke();

    context.beginPath();
    context.moveTo(0, canvas.height - ((daily_data[0] - min) * (canvas.height/(max - min))) );
    for (var i = 1; i < daily_data.length; i++) {
        context.lineTo(i*canvas.width/(daily_data.length - 1), canvas.height - ((daily_data[i] - min) * (canvas.height/(max - min))) );
    }
    context.lineJoin = 'round';
    context.lineWidth = 2;
    context.strokeStyle = '#444';
    context.stroke();
}

function render_overview_by_time() {
    var transactions = global_data.transactions;
	render_balance(transactions);

    render_daily_graph();
	transactions.sort(function(a, b) { return b.timestamp - a.timestamp });

    // TODO templating!!!
	var html = "";
	for (var i in transactions) {
		var t = transactions[i];
		html += '<li class="full_width border_none border_bottom fixed_height_huge position_relative">' +
                    '<span class="float_left size_limited bold cursor_pointer pad_x" onclick="kweb.showPage(\'transaction\', \'' + escape(t._id) + '\')">' + t.name + '</span>' +
                    '<span class="float_left size_limited pad_x">' + t.category + '</span>' +
			        '<span class="float_right pad_x">' +  format_amount(t.amount) + '</span>' +
                    '<span class="bottom_left size_limited info_font">' + t.comment + '</span>' +
                    '<span class="bottom_right info_font">' + fuzzytime(t.timestamp) + '</span>' +
                '</li>';
	}
	$("#transaction_list").html(html);
}

function get_transaction_by_id(id) {
    for (var i in global_data.transactions) {
        var t = global_data.transactions[i];
        if (t._id === id)
            return t;
    }
    return undefined;
}

function show_transaction(page, id) {
    var t = global_data.current_transaction = get_transaction_by_id(unescape(id));
    if (t === undefined) {
        alert("BUG: trying to view a non-existent transaction");
        kweb.showPage("overview");
    }
    // TODO templating!!!
    var html = 
        '<div class="bold full_width pad_x pad_y border_bottom">' + "Name: " + t.name + '</div>' +
        '<div class="bold full_width pad_x pad_y border_bottom">' + "Category: " + t.category + '</div>' +
        '<div class="bold full_width pad_x pad_y border_bottom">' + "Amount: " + format_amount(t.amount) + '</div>' +
        '<div class="bold full_width pad_x pad_y border_bottom">' + "Comment:" + t.comment + '</div>' +
        '<div class="bold full_width pad_x pad_y border_bottom">' + "Time: " + fuzzytime(t.timestamp) + '</div>';
    document.getElementById("transaction_holder").innerHTML = html; // wtf JQUERY ( $("transaction_holder").html(html) ) doesn't work here
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
                    alert("sorry your browser sucks you won't be remembered");
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
    $("#loading").bind("ajaxSend", function(){
        $(this).show();
    }).bind("ajaxComplete", function(){
        $(this).hide();
    });

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
        // FIXME show the last added transaction
        get_transactions(global_data.login, function(res) {
            if (res.error) {
                alert(res.error);
                logout();
            } else {
                global_data.transactions = res.transactions;
                if ($("#sort_by_button").html() === "Category")
                    render_overview_by_category();
                else
                    render_overview_by_time();
            }
        })
    });

    kweb.onPageLoad("add_transaction", function(page) {
        if ($("#transaction_type_button").html() !== "Expense") {
            $("#transaction_type_button").click();
        }
        $("#name").val(""); $("#amount").val(""); $("#category").val(""); $("#comment").val("");
        $("#when").val((new Date()).toString()); // TODO only display Year Month Day
    });
    
    $("#password").keypress(function(e) {
        if (e.which == 13) {
            login();
        }
    });

    kweb.onPageLoad("transaction", show_transaction);
});

// Click handlers

// login button click handler also called from elsewhere

function login() {
    get_and_show_overview({
        username: $("#username").val(),
        password: $("#password").val()
    });
}

// Add click handler on add_transaction page
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
        if (res.error) {
            alert(res.error);
        }
        kweb.showPage("overview");
    });
}

function delete_current_transaction() {
    var t = global_data.current_transaction;
    delete_transaction(t._id, t._rev, function(res) {
        if (res.error) {
            alert(res.error);
        }
        kweb.showPage("overview");
    })
}

function edit_current_transaction() {

}

function toggle_transaction_type(elt) {
    var new_val = elt.innerHTML === "Expense" ? "Income" : "Expense";
    if (new_val === "Expense") {
        $(elt).removeClass("green_back");
        $(elt).addClass("red_back");
    } else {
        $(elt).removeClass("red_back");
        $(elt).addClass("green_back");
    }
    elt.innerHTML = new_val;
}

function toggle_sort_by(elt) {
    var new_val = elt.innerHTML === "Category" ? "Time" : "Category";
    elt.innerHTML = new_val;
    kweb.showPage("overview");
}
