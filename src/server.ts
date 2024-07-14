const server = require('http').createServer();

const io = require('socket.io')(server, {
  transports: ['trade', 'order', 'day', 'hour', 'min', 'websocket']
});

io.on('connection', (client: any) => {
  console.log('Client connected');
  // Send a 'connected' message to the client
  client.emit('connected', { message: 'Welcome! You are connected to the server.' });

  // Handle incoming messages from the client
  client.on('message', (msg: any) => {
    console.log('Received message from client:', msg);
    client.send(`Echo: ${msg}`);
  });

  client.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(process.env.WS_PORT || 5000, () => {
  console.log(`Listening on port ${process.env.WS_PORT || 5000}`);
});

export default io;