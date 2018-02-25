// This IP is hardcoded to my server, replace with your own
// 'https://oooppp.herokuapp.com'
// 'http://localhost:5004'
var socket = io.connect('http://localhost:5004');
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
});

$(document).ready(function () {

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

});

$(window).on('beforeunload', function () {
	socket.emit('leave', {roomId: render.roomId, donutId: render.donutId});
});

function joinGame(data) {
	$('#prompt').hide();
	socket.emit('joinGame', data);
}
