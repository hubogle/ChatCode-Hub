import * as vscode from "vscode";
import WebSocket from 'ws';
import { address, status } from "./globals";

export class WsClient {
    private ws: WebSocket | undefined;

    constructor() {
    }

    public connectWebSocket() {
        if (!status) {
            return;
        }

        this.ws = new WebSocket('ws://' + address + '/api/v1/ws');

        this.ws.on('error', function (error) {
            // console.error(`WebSocket error: ${error}`);
            vscode.window.showErrorMessage(`${error}`);
        });

        this.ws.on('open', () => {
            console.log('WebSocket client connected');
        });

        this.ws.on('message', (data) => {
            console.log('Received: %s', data);
            // 处理服务器消息
        });
    }

    public sendMessage(message: string, uid: number, isGroup: boolean = false) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        }
    }
}
