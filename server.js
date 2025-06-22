const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });

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

console.log(`Server running on port ${PORT}`);
