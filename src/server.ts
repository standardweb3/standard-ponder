const server = require('http').createServer();

const io = require('socket.io')(server, {
  transports: ['trade', 'order', 'day', 'hour', 'min']
});

io.on('connection', (client: { emit: (arg0: string, arg1: { name: number; value: any; }) => void; }) => {
  
});

server.listen(process.env.WS_PORT);

export default io;