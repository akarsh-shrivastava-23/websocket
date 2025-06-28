// Twilio Media Streams compatible WebSocket server with enhanced logging and error handling

const http = require('http');
const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.url === '/stream' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        console.log('Received Twilio POST body:', parsed);
      } catch (e) {
        console.log('Received non-JSON POST body:', body);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    });
  } else if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
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

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
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

server.on('error', (err) => {
  console.error('HTTP server error:', err);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`POST and WebSocket upgrade endpoint: /stream`);
  console.log(`Health check endpoint: /healthz`);
});
