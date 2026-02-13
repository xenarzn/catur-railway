var board = null;
var game = new Chess();
var socket = io();
var $status = $('#status');
var $playerSide = $('#playerSide');
var playerRole = null;

// Fungsi Suara
function playSound(type) {
    if (type === 'move') document.getElementById('moveSound').play();
    if (type === 'check') document.getElementById('checkSound').play();
}

// Fungsi Hint Langkah
function removeHints() {
    $('.highlight-hint').remove();
}

function showHints(square) {
    var moves = game.moves({ square: square, verbose: true });
    if (moves.length === 0) return;

    for (var i = 0; i < moves.length; i++) {
        var $square = $('.square-' + moves[i].to);
        $square.append('<div class="highlight-hint" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); pointer-events:none;"></div>');
    }
}

socket.on('connect', () => $status.html('Sistem Siap'));

socket.on('playerRole', function(role) {
    playerRole = role;
    if (role === 'observer') {
        $playerSide.html('Anda adalah <b>Penonton</b>');
    } else {
        var sideName = (role === 'w') ? 'Putih' : 'Hitam';
        $playerSide.html('Anda bermain sebagai: <b>' + sideName + '</b>');
        if (role === 'b') board.orientation('black');
    }
});

function onDragStart(source, piece) {
    if (game.game_over() || playerRole === 'observer') return false;
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (game.turn() !== playerRole)) {
        return false;
    }
    showHints(source);
}

function onDrop(source, target) {
    removeHints();
    var move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    playSound(game.in_check() ? 'check' : 'move');
    updateStatus();
    socket.emit('langkah', { move: move, board: game.fen() });
}

function onSnapEnd() {
    board.position(game.fen());
}

socket.on('langkah', function(data) {
    game.load(data.board);
    board.position(game.fen());
    playSound(game.in_check() ? 'check' : 'move');
    updateStatus();
});

function updateStatus() {
    var status = '';
    var moveColor = (game.turn() === 'b') ? 'Hitam' : 'Putih';

    if (game.in_checkmate()) { status = 'SKAKMAT! ' + moveColor + ' kalah.'; }
    else if (game.in_draw()) { status = 'REMIS (Seri).'; }
    else {
        status = 'Giliran: ' + moveColor;
        if (game.in_check()) status += ' (Skak!)';
    }
    $status.html(status);
}

var config = {
    draggable: true,
    position: 'start',
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};

board = Chessboard('myBoard', config);
updateStatus();
