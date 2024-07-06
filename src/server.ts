const server = require('http').createServer();

const io = require('socket.io')(server, {
  transports: ['trade', 'order', 'day', 'hour', 'min']
});

io.on('connection', (client: { emit: (arg0: string, arg1: { message: string }) => void; }) => {
  // Send a 'connected' message to the client
  client.emit('connected', { message: 'Welcome! You are connected to the server.' });
});

server.listen(process.env.WS_PORT);

export default io;