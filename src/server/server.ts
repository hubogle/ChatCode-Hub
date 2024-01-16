
import * as vscode from 'vscode';
import WebSocket from 'ws';

// 创建和启动 WebSocket 服务器
export default function CreateServer(port: number) {
    // 创建和启动 WebSocket 服务器
    const wss = new WebSocket.Server({ port: 8080 });

    wss.on('connection', ws => {
        // console.log('New client connected');

        ws.on('message', message => {
            try {
                const parsedMessage = JSON.parse(message.toString());
                // console.log(`Received message from ${parsedMessage.username}: ${parsedMessage.text}`);

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

    vscode.window.showInformationMessage(`Server created on port ${port}`);
}
