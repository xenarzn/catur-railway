var board = null;
var game = new Chess();
var socket = io();
var $status = $('#status');

function onDragStart (source, piece, position, orientation) {
  if (game.game_over()) return false;
  // Hanya gerakkan bidak sesuai gilirannya
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
}

function onDrop (source, target) {
  var move = game.move({ from: source, to: target, promotion: 'q' });
  if (move === null) return 'snapback';
  
  updateStatus();
  socket.emit('langkah', move); // Kirim ke lawan
}

function onSnapEnd () {
  board.position(game.fen());
}

function updateStatus () {
  var status = '';
  var moveColor = (game.turn() === 'b') ? 'Hitam' : 'Putih';

  if (game.in_checkmate()) { status = 'Game Over, ' + moveColor + ' skakmat.'; }
  else if (game.in_draw()) { status = 'Game Over, Remis.'; }
  else {
    status = 'Giliran: ' + moveColor;
    if (game.in_check()) { status += ' (Skak!)'; }
  }
  $status.html(status);
}

socket.on('langkah', function (move) {
    game.move(move);
    board.position(game.fen());
    updateStatus();
});

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};
board = Chessboard('myBoard', config);
updateStatus();
