const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');
const username = 'User1'; // 假设用户名

ws.on('open', function open() {
    console.log('Connected to server');
    const message = {
        username: username,
        text: 'Hello from client!'
    };
    ws.send(JSON.stringify(message));
});

ws.on('message', function incoming(message) {
    try {
        const parsedMessage = JSON.parse(message);
        console.log(`${parsedMessage.username}: ${parsedMessage.text}`);
    } catch (error) {
        console.error('Error parsing message:', error);
    }
});

ws.on('error', function (error) {
    console.error(`WebSocket error: ${error}`);
});
