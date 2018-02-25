// This IP is hardcoded to my server, replace with your own
// 'https://oooppp.herokuapp.com'
// 'http://localhost:5004'
var socket = io.connect('https://oooppp.herokuapp.com');
var render;
var joined = false;
var localRoomId;
var localPlayerId;

var config = {
	name: '',
	roomId: 1,
	type: 1,
}

socket.on('sync', function (data) {
	if (joined) {
		var localData = data[localRoomId];
		if (localData == null) {
			return;
		}
		render.refresh(localData.donuts, data["time"]);
	}
});

socket.on('joined', function (data) {
	joined = true;
	localRoomId = data.roomId;
	localPlayerId = data.donutId;
	render = new Render('#arena', localPlayerId, localRoomId, socket);
	$('#chat').show();
});

socket.on('message', function (data) {
	$('#chat-history').empty();
	for (var i = data.length - 1; i >= 0; i--) {
		$('#chat-history').append('<label type="text" class="chat-bubble">' + data[i] + '</label>');
	}
});

$(document).ready(function () {
	$('#chat').hide();
	$(document).on("contextmenu", function (e) {
		if (e.target.nodeName != "INPUT" && e.target.nodeName != "TEXTAREA")
			e.preventDefault();
	});

	$('#join').click(function () {
		config.name = $('#donut-name').val();
		config.roomId = $('#room-id').val();
		if (config.name != '' && config.roomId != 1) {
			joinGame(config);
		} else {
			alert("Please your name and the room id to join or create");
		}
	});

	$('#donut-name').keyup(function (e) {
		config.name = $('#donut-name').val();
	});

	$('#room-id').keyup(function (e) {
		config.roomId = $('#room-id').val();
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
			sendMsg(msg);
		}
	});

});

$(window).on('beforeunload', function () {
	socket.emit('leave', { roomId: render.roomId, donutId: render.donutId });
});

function joinGame(data) {
	$('#prompt').hide();
	socket.emit('joinGame', data);
}

function sendMsg(data) {
	$(this).val('#chat-to-send');
	socket.emit('message', { content: data, pname: config.name, rid: localRoomId });
}
