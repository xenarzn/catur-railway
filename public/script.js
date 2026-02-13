var board = null;
var game = new Chess();
var socket = io();
var $status = $('#status');
var $playerSide = $('#playerSide');
var playerRole = null; // 'w' untuk putih, 'b' untuk hitam

// Saat pertama kali terhubung, tentukan siapa kita
socket.on('connect', function() {
    $status.html('Terhubung ke Server');
});

// Logika untuk menentukan posisi papan dan peran pemain
socket.on('playerRole', function(role) {
    playerRole = role;
    var sideName = (role === 'w') ? 'Putih' : 'Hitam';
    $playerSide.html('Anda bermain sebagai: <b>' + sideName + '</b>');
    
    // Putar papan jika kita adalah pemain Hitam
    if (role === 'b') {
        board.orientation('black');
    }
});

function onDragStart (source, piece, position, orientation) {
    if (game.game_over()) return false;

    // Cegah pemain menggerakkan bidak lawan
    if ((playerRole === 'w' && piece.search(/^b/) !== -1) ||
        (playerRole === 'b' && piece.search(/^w/) !== -1) ||
        (game.turn() !== playerRole)) {
        return false;
    }
}

function onDrop (source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    updateStatus();
    socket.emit('langkah', { move: move, board: game.fen() });
}

function onSnapEnd () {
    board.position(game.fen());
}

socket.on('langkah', function (data) {
    game.load(data.board);
    board.position(game.fen());
    updateStatus();
});

function updateStatus () {
    var status = '';
    var moveColor = (game.turn() === 'b') ? 'Hitam' : 'Putih';

    if (game.in_checkmate()) {
        status = 'Game Over, ' + moveColor + ' Skakmat.';
    } else if (game.in_draw()) {
        status = 'Game Over, Remis.';
    } else {
        status = 'Giliran: ' + moveColor;
        if (game.in_check()) {
            status += ' (Skak!)';
        }
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
