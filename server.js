// Twilio Media Streams compatible WebSocket server

const http = require('http');
const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.url === '/stream' && req.method === 'POST') {
    // Twilio sends an initial POST to /stream before upgrading
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', ws => {
  console.log('Twilio Media Stream connected');

  ws.on('message', message => {
    console.log(`Received audio packet (${message.length} bytes)`);
    // Here you’d process or forward the audio
  });

  ws.on('close', () => {
    console.log('Connection closed');
  });
});

server.on('upgrade', (req, socket, head) => {
  if (req.url === '/stream') {
    wss.handleUpgrade(req, socket, head, ws => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`POST and WebSocket upgrade endpoint: /stream`);
});
