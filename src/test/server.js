const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    console.log('New client connected');

    ws.on('message', message => {
        try {
            const parsedMessage = JSON.parse(message);
            console.log(`Received message from ${parsedMessage.username}: ${parsedMessage.text}`);

            // 广播消息给所有客户端
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
