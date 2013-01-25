"use strict";

var url_prefix = "http://" + window.location.hostname + ':' + window.location.port;

var global_data = {};

function format_amount(a) {
	return Number(a).toFixed(2);
}

function get_transactions(auth, cb) {
	$.ajax({
        type: "POST",
        processData: false,
        data: JSON.stringify(auth),
        url: url_prefix + '/money/get',
        success: function(data) {
            cb(data);
        },
        error: function(xhr, textStatus, e) {
            cb({"error": "ajax error"}); // TODO give more info about the error
        }
    });
}

function add_transaction(auth, transaction, cb) {
	$.ajax({
        type: "POST",
        processData: false,
        data: JSON.stringify({
        	username: auth.username,
        	password: auth.password,
        	transaction: transaction
        }),
        url: url_prefix + '/money/add',
        success: function(data) {
            cb(data);
        },
        error: function(xhr, textStatus, e) {
            cb({"error": "ajax error"}); // TODO give more info about the error
        }
    });	
}

function render_sort_by(which) {
	if (which === "category") {
		$("#sort_by_category_button").css("background-color", "#a0a0a0");
		$("#sort_by_category_button").css("color", "white");
		$("#sort_by_time_button").css("background-color", "white");
		$("#sort_by_time_button").css("color", "#a0a0a0");
	} else {
		$("#sort_by_category_button").css("background-color", "white");
		$("#sort_by_category_button").css("color", "#a0a0a0");
		$("#sort_by_time_button").css("background-color", "#a0a0a0");
		$("#sort_by_time_button").css("color", "white");
	}
}

function render_balance(transactions) {
	var balance = transactions.reduce(function(sum, a) { return sum + a.amount }, 0);
	$("#balance").html(format_amount(balance));
}

function render_overview_by_category(transactions) {
	render_balance(transactions);
	
	render_sort_by("category"); // Another interface for this might be "Sortby: Category" and then clocking it toggles it
	
	var bycategory = {};
	
	for (var i in transactions) {
		var t = transactions[i];
		// TODO: nicer one line way to do this
		if (bycategory[t.category] === undefined) {
			bycategory[t.category] = [];
		}
		bycategory[t.category].push(t);
	}

	var html = "";
	for (var c in bycategory) {
		var transactions = bycategory[c];
		var amount = transactions.reduce(function(a, b) { return a.amount + b.amount });
		html += '<li class="category_li"><span class="category">' + c + '</span>' + 
			'<span class="amount">' +  format_amount(amount) + '</span></li>';
	}
	$("#transaction_list").html(html);
}

function render_overview_by_time(transactions) {
	render_balance(transactions);

	render_sort_by("time"); // Another interface for this might be "Sortby: Category" and then clocking it toggles it
	
	transactions.sort(function(a, b) { return b.timestamp - a.timestamp });

	var html = "";
	for (var i in transactions) {
		var t = transactions[i];
		var amount = transactions.reduce(function(a, b) { return a.amount + b.amount });
		html += '<li class="category_li"><span class="category">' + c + '</span>' + 
			'<span class="amount">' +  amount + '</span></li>';
	}
	$("#transaction_list").html(html);
}


function get_and_show_overview() {
	get_transactions({
		username: $("#username").val(),
		password: $("#password").val()
	}, function(res) {
		if (res.error) {
			alert(res.error);
		} else {
			global_data.username = $("#username").val();
			global_data.password = $("#password").val();
			global_data.transactions = res.transactions;
			kweb.showPage("overview", res.transactions);
		}
		$("#username").val("");
		$("#password").val("");
	});
}

$(document).ready(function() {
    kweb.showPage("login");

    kweb.onPageLoad("overview", function(page, transactions) {
    	render_overview_by_category(transactions);
    });

    kweb.onPageLoad("add_transaction", function(page) {
    	$("#when").val(new Date().toString()); // TODO only display Year Month Day
    });

    $("#login_button").click(function() {
    	get_and_show_overview();	
    });
    
    $("#password").keypress(function(e) {
        if (e.which == 13) {
            get_and_show_overview();
        }
    });
    
    $("#expense_income_button").click(function() {
    	var new_val = $("#expense_income_button").html() === "Expense" ? "Income" : "Expense";
    	$("#expense_income_button").html(new_val);
    });

    $("#add_transaction_button").click(function() {
    	var amount = parseFloat($("#amount").val());
    	var timestamp = new Date($("#when").val());

    	if (isNaN(amount) || amount < 0.0) {
    		alert("Amount must be a positive real number");
    		return;
    	}

    	if (isNaN(timestamp)) {
    		alert("Invalid Date");
    		return;
    	}

    	if ($("#expense_income_button").html() === "Expense") {
    		amount = -amount;
    	}

    	add_transaction({
    		username: global_data.username,
    		password: global_data.password
    	}, {
    		"name": $("#name").val(),
    		"amount": amount,
    		"category": $("#category").val(),
    		"timestamp": timestamp.getTime(),
    		"comment": $("#comment").val()
    	}, function(res) {
    		if (res.error) {
    			alert(res.error);
    		}
    	});
    });
});
