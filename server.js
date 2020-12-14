
var http = require("http");
const express = require('express');
const path = require('path');
const app = express();
const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const localSocket = undefined;
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, INDEX));
  });
app.listen(PORT, () => {
    console.log(`listening http://localhost:${PORT}`);
});  
const socketServer = new WebSocket.Server({port: 3030});
socketServer.on('connection', (socketClient) => {
  console.log('connected',socketClient);
  console.log('client Set length: ', socketServer.clients.size);
  socketClient.on('close', (socketClient) => {
    console.log('closed');
    console.log('Number of clients: ', socketServer.clients.size);
  });
  socketClient.on('message', (message) => {
    console.log('Message ', message);
    if(message === 'LOCAL_SOCKET' && !localSocket) {
        socketClient = localSocket;
    }
    socketServer.clients.forEach((client) => {
        client.send(new Date().toTimeString());
    })
  });
});

setInterval(() => {
    socketServer.clients.forEach((client) => {
        client.send(new Date().toTimeString());
    })
},1000)