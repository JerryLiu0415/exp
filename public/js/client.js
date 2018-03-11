// This IP is hardcoded to my server, replace with your own
// 'https://oooppp.herokuapp.com'
// 'http://localhost:5004'
var socket = io.connect('https://oooppp.herokuapp.com');
var render;
var joined = false;
var localRoomId;
var localPlayerId;
var showChat = false;
var showLeaderBoard = false;
var dataPrev = null;

var queue = [];

var config = {
	name: '',
	rid: 1,
	type: 1,
}

// setInterval(function () {
// 	if (joined) {
// 		if (queue.length > 1) {
// 			var data = queue.shift();
// 			var localData = data[localRoomId];
// 			if (localData == null) {
// 				return;
// 			}
// 			render.refresh(localData);
// 		}
// 	}
// }, 10);

socket.on('sync', function (data) {
	if (joined) {
		var localData = data[localRoomId];
		if (localData == null) {
			return;
		}
		render.refresh(localData);

	}
	dataPrev = data;
	// queue.push(data);
});

socket.on('joined', function (data) {
	joined = true;
	localRoomId = data.rid;
	localPlayerId = data.pid;
	render = new Render('#arena', localPlayerId, localRoomId, socket);
	updateChat(data.initData.messages);
	updateLeaderBoard(data.initData.donuts);
	$('#button').show();
	$('#instructions').show();
});

socket.on('message', function (data) {
	updateChat(data);
});

// Controller
$(document).ready(function () {
	$('#chat').hide();
	$('#leader-board').hide();
	$('#button').hide();
	$('#instructions').hide();
	$('#existing-games').mousedown(function () {
		$(this).empty();
		$(this).append('<option value=1>Create new room</option>');
		for (var key in dataPrev) {
			if (key != "time") {
				const name = (dataPrev[key].donuts)[dataPrev[key].host].name + "'s room ";
				const id = "(" + key + ")";
				var content = name + id + " with " + Object.keys(dataPrev[key].donuts).length + " player(s)";
				$(this).append('<option value=' + key + '>' + content + '</option>');
			}
		}
	});

	$('#existing-games').change(function () {
		config.rid = $(this).val();
	});

	$(document).keypress(function (e) {
		var k = e.which;
		switch (k) {
			case 121: //Y 
				showHideChat();
				break;
			case 32:
				showHideLeaderBoard(true);
		}
	}).keyup(function (e) {
		var k = e.which;
		switch (k) {
			case 32:
				showHideLeaderBoard(false);
		}
	});

	$(document).on("contextmenu", function (e) {
		if (e.target.nodeName != "INPUT" && e.target.nodeName != "TEXTAREA")
			e.preventDefault();
	});

	$('#join').click(function () {
		config.name = $('#donut-name').val();
		if (config.name != '') {
			joinGame(config);
		} else {
			alert("Please enter a name");
		}
	});

	$('#donut-name').keyup(function (e) {
		config.name = $('#donut-name').val();
	});

	$('#room-id').keyup(function (e) {
		config.rid = $('#room-id').val();
	});

	$('ul.donut-selection li').click(function () {
		$('.donut-selection li').removeClass('selected')
		$(this).addClass('selected');
		config.type = $(this).data('tank');
	});

	$('#chat-to-send').keyup(function (e) {
		var msg = $('#chat-to-send').val();
		var k = e.keyCode || e.which;
		if (k == 13) {
			if (msg == '') {
				return;
			}
			$(this).val('');
			var time = new Date();
			var timeStamp = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
			msg = '(' + timeStamp + ') ' + config.name + ": " + msg;
			sendMsg(msg);
		}
	});

});

$(window).on('beforeunload', function () {
	var time = new Date();
	var timeStamp = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
	var leaveMsg = '(' + timeStamp + ') PLAYER \'' + config.name + '\' HAS LEFT THE GAME';
	sendMsg(leaveMsg);
	socket.emit('leave', { rid: localRoomId, pid: localPlayerId });
});

function joinGame(data) {
	$('#prompt').hide();
	socket.emit('joinGame', data);
}

function sendMsg(data) {
	socket.emit('message', { content: data, rid: localRoomId });
}

function updateChat(data) {
	$('#chat-history').empty();
	for (var i = data.length - 1; i >= 0; i--) {
		$('#chat-history').append('<label type="text" id="' + i + '" class="chat-bubble"><strong>'
			+ data[i] + '</strong></label>');
		// https://stackoverflow.com/questions/275931/how-do-you-make-an-element-flash-in-jquery
		if (i == data.length - 1) {
			$('#' + i).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });
		}
	}
}

function showHideChat() {
	if (!joined) {
		return;
	}
	showChat = !showChat;
	showChat ? $('#chat').show() : $('#chat').hide();
}

function showHideLeaderBoard(isShow) {
	if (!joined) {
		return;
	}
	isShow ? $('#leader-board').show() : $('#leader-board').hide();
}

function popUpMessage(msg) {
	$('body').append('<div id="game-prompt-dead" class="game-prompt-dead"><p>' + msg + '</p></div>');
	$('#game-prompt-dead').fadeTo(3000, 0.1);
	setTimeout(function () {
		$('#game-prompt-dead').remove();
	}, 3000);
}

