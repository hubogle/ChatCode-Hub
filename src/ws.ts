import * as vscode from "vscode";
import WebSocket from 'ws';
import { address, getUidMapName, status, token } from "./globals";

export class WsClient {
    private ws: WebSocket | undefined;
    private onMessageReceivedCallbacks: ((data: any) => void)[] = [];

    constructor() {
    }

    public onMessageReceived(callback: (data: any) => void) {
        this.onMessageReceivedCallbacks.push(callback);
    }

    private triggerOnMessageReceived(data: any) {
        this.onMessageReceivedCallbacks.forEach(callback => callback(data));
    }

    public connectWebSocket() {
        if (!status) {
            return;
        }

        this.ws = new WebSocket('ws://' + address + '/api/v1/ws');
        console.log('WebSocket client created');

        this.ws.on('error', function (error) {
            // console.error(`WebSocket error: ${error}`);
            vscode.window.showErrorMessage(`${error}`);
        });

        this.ws.on('open', () => {
            if (this.ws) {
                const msg = {
                    type: 1,
                    data: {
                        token: token
                    }
                };
                console.log('Send: %s', JSON.stringify(msg));
                this.ws.send(JSON.stringify(msg));
            }
        });


        this.ws.on('message', async (data) => {
            console.log('Received: %s', data);
            // 如果需要，这里可以进行异步操作，例如解析JSON
            try {
                let msgRaw = JSON.parse(data.toString());
                if (msgRaw.type == 3) {
                    let msg = {
                        content: msgRaw.data.content,
                        nickname: getUidMapName(msgRaw.data.sender_id),
                        send_at: msgRaw.data.send_at,
                        type: msgRaw.data.session_type,
                        uid: msgRaw.data.sender_id,
                    }
                    this.triggerOnMessageReceived(JSON.stringify(msg));
                }
            } catch (error) {
                console.error('Error parsing message data:', error);
            }
        });


        this.ws.on('close', (code, reason) => {
            console.log(`WebSocket connection closed: ${code} ${reason}`);
            // 这里可以根据需要和策略进行重连
            // 注意：自动重连需要谨慎实现，避免创建无限循环或过于频繁的连接尝试
            this.reconnectWebSocket();
        });
    }

    private reconnectWebSocket() {
        // 实现一定的延迟和重连策略，避免立即重连
        console.log('Attempting to reconnect WebSocket...');
        setTimeout(() => {
            this.connectWebSocket();
        }, 5000); // 例如，这里使用了5秒的延迟
    }

    public sendMessage(message: string, receiver_id: number, sender_id: number | undefined, isGroup: boolean = false) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const msg = {
                type: 3,
                data: {
                    session_type: isGroup ? 2 : 1,
                    receiver_id: receiver_id,
                    sender_id: sender_id,
                    message_type: 1,
                    content: message,
                    send_at: new Date().getTime()
                }
            }
            console.log('Send: %s', JSON.stringify(msg));

            this.ws.send(JSON.stringify(msg));
        }
    }
}
