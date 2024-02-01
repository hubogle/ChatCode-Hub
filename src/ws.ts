import * as vscode from "vscode";
import WebSocket from 'ws';
import { address, status, token } from "./globals";

export class WsClient {
    private ws: WebSocket | undefined;

    constructor() {
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
                this.ws.send(JSON.stringify(msg));
            }
        });

        this.ws.on('message', (data) => {
            console.log('Received: %s', data);
            // 处理服务器消息
        });
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
