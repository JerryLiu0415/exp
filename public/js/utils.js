// Client helpers

// Arena constants
const CACHE_LIMIT = 10;
const NORMAL_ARENA_WIDTH = 1100;
const NORMAL_ARENA_HEIGHT = 580;

// Donut constants
const DONUT_IMAGE_EXT = ".png";
const DONUT_IMAGE_CLASSIC_PREFIX = "img/classic_";
const DONUT_IMAGE_SWORD_PREFIX = "img/sword_";

function UID() {
    var key1 = Math.floor(Math.random() * 1000).toString();
    var key2 = Math.floor(Math.random() * 1000).toString();
    var key3 = Math.floor(Math.random() * 1000).toString();
    var key4 = Math.floor(Math.random() * 1000).toString();
    return (key1 + key2 + key3 + key4);
}

function vectorNormalize(v) {
    const dist = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
    return { x: (v.x) / dist, y: (v.y) / dist };
}

function getGreenToRed(current, max) {
    const percent = current / max;
    r = current < max ? 255 : Math.floor(255 - (percent * 200.0 - 100) * 255 / 100);
    g = current > max ? 255 : Math.floor((percent * 200.0) * 255 / 100);
    return 'rgb(' + r + ',' + g + ',0)';
}

function popUpMessageGeneral(msg) {
    $('body').append('<div id="game-prompt-dead" class="game-prompt-dead"><strong>' + msg + '</strong></div>');
    $('#game-prompt-dead').fadeTo(3000, 0.1);
    setTimeout(function () {
        $('#game-prompt-dead').remove();
    }, 3000);
}

function updateLeaderBoard(donuts) {
    $('#leader-board').empty();
    var sortedPlayers = [];
    for (var key in donuts) {
        sortedPlayers.push(donuts[key]);
    }
    sortedPlayers.sort(function (a, b) {
        return b.kill - a.kill;
    });

    $('#leader-board').empty();
    $('#leader-board').append('<p>Leader Board</p>');
    for (var i = 0; i < sortedPlayers.length; i++) {
        if (i > 4) {
            break;
        }
        $('#leader-board').append('<div class="leader-board-bubble">' + (i + 1)
            + '<img src="img/testbase_' + parseInt(sortedPlayers[i].id) % 4 + '.png"/>' +
            sortedPlayers[i].name + '<div class="leader-board-bubble-score"> Score: ' + sortedPlayers[i].kill +
            ' </div></div>');
    }
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

// 
function connect(div1, div2, color, thickness) { // draw a line connecting elements
    var fromPoint = getOffset(div1[0]);
    var toPoint = getOffset(div2[0]);
    
    var from = function () {},
    to = new String('to');
    from.y = fromPoint.top+10;
    from.x = fromPoint.left+10;
    to.y = toPoint.top+10; 
    to.x = toPoint.left+10;
    
    $.line(from, to);
}