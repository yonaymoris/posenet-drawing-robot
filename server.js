
var http = require("http");
const express = require('express');
const path = require('path');
const app = express();
const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
let localSocket = undefined;
let currentuser = undefined;
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, INDEX));
});
app.listen(PORT, () => {
    console.log(`listening http://localhost:${PORT}`);
});  
const socketServer = new WebSocket.Server({port: 3030});
socketServer.on('connection', (socketClient) => {
  //console.log('connected');
  //console.log('client Set length: ', socketServer.clients.size);
  socketClient.on('close', (socketClient) => {
  console.log('closed');
  console.log('Number of clients: ', socketServer.clients.size);
  if(currentuser && currentuser.readyState == 3) {
    currentuser = undefined;
    socketServer.clients.forEach((client) => {
      if(!currentuser && client != localSocket) {
        currentuser = client;
        client.send('WAITING_CLEARED');
      }
  })
  }
  if(localSocket && localSocket.readyState == 3) {
    localSocket = undefined;
  }
});
  socketClient.on('message', (message) => {
    if(message === 'LOCAL_SOCKET' && !localSocket) {
        console.log('local socket connected');
        localSocket = socketClient;

    }
    if(localSocket != socketClient) {
      if(!currentuser || currentuser == socketClient) {
        if(!currentuser) {
          currentuser = socketClient;
        }
        if(currentuser && localSocket) {
          localSocket.send(message);
        }
      } else {
        console.log('FOUND USER');
        socketClient.send('IN_USE');
      }

    }
  });
});