const { Server } = require('socket.io');

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    socket.on('subscribe', scanId => socket.join(scanId));
    socket.on('unsubscribe', scanId => socket.leave(scanId));
  });
}

function emitProgress(scanId, data) {
  if (io) {
    io.to(scanId).emit('scan:update', { scanId, ...data });
  }
}

module.exports = { initSocket, emitProgress };
