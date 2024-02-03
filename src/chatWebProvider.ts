import * as vscode from 'vscode';
import { ChatItem } from './chatListProvider';
import { token, uid } from "./globals";
import { ChatMessageItem, GetChatMessage } from "./server/chat";
import { WsClient } from './ws';

export class MessageViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private currentMessages: ChatMessageItem[] = [];
    private person: ChatItem;



    constructor(private readonly extensionUri: vscode.Uri, private readonly wsClient: WsClient) {
        this.wsClient.onMessageReceived(this.handleReceivedMessage.bind(this));
        this.person = new ChatItem("", "", false);
    }

    private handleReceivedMessage(data: any) {
        // 解析接收到的消息并更新当前消息列表
        const message = JSON.parse(data);
        this.currentMessages.push(message);
        // 更新Webview的HTML内容
        this.updateWebviewContent();
    }

    private updateWebviewContent() {
        // 重新生成HTML内容
        if (this._view) {
            this._view.webview.html = this.generateWebviewHtml();
        }
    }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getInitialWebviewContent();
    }

    public async showMessagesForPerson(person: ChatItem) {
        if (this._view) {
            const chatMessageList = await GetChatMessage(token, person.id, person.isGroup ? 2 : 1)
            this.currentMessages = chatMessageList; // 更新当前消息列表
            this.person = person; // 更新当前聊天对象
            this._view.webview.html = this.generateWebviewHtml();

            this._view.webview.onDidReceiveMessage(message => {
                if (message.command === 'sendMessage') {
                    this.wsClient.sendMessage(
                        String(message.content),
                        message.receiver_id,
                        uid,
                        message.isGroup
                    );
                }
            })
            this._view.show?.(true); // Bring the webview into view
        }
    }

    private getInitialWebviewContent(): string {
        return `<html><body>Select a person to view messages.</body></html>`;
    }

    private generateWebviewHtml(): string {
        let messagesHtml = this.currentMessages.map(msg => this.createMessageHtml(msg)).join('');
        return getWebviewContent(messagesHtml, this.person)
    }

    private createMessageHtml(msg: ChatMessageItem): string {
        // 根据消息类型（发送或接收）应用不同的样式
        const messageClass = msg.type === 1 ? "sent" : "received";

        // 安全地处理消息内容，以防止XSS攻击
        // 注意：这里简化了处理，实际应用中可能需要更严格的处理逻辑
        const safeContent = this.escapeHtml(msg.content);

        return `
    <div class="${messageClass}">
        <div class="message-header">
            <span class="nickname">${this.escapeHtml(msg.nickname)}</span>
            <span class="timestamp">${new Date(msg.send_at).toLocaleString()}</span>
        </div>
        <div class="message-content">${safeContent}</div>
    </div>
    `;
    }

    private escapeHtml(unsafeText: string): string {
        return unsafeText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

function getWebviewContent(messages: string, person: ChatItem): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Messages</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        body, html {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden; /* 隐藏滚动条 */
        }
        #inputArea {
            margin-top: auto; /* Pushes the input area to the bottom */
            padding: 10px;
            background-color: var(--vscode-editor-background); /* Background color */
        }
        #inputArea input {
            width: 100%;
            padding: 5px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: var(--vscode-input-borderRadius);
        }
        #inputArea input:focus {
            border-color: var(--vscode-focusBorder); /* Border color when focused */
            outline: none;
        }
        #messages {
            overflow-y: auto; /* 允许在 #messages 上滚动 */
            flex-grow: 1; /* 允许 #messages 填充剩余空间 */
            padding: 10px;
        }
        /* Webkit 浏览器的滚动条定制 */
        #messages::-webkit-scrollbar {
            width: 8px; /* 滚动条宽度 */
        }

        #messages::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0); /* 默认状态下滚动条把手透明 */
            border-radius: 4px;
        }

        #messages::-webkit-scrollbar-thumb:hover {
            background-color: rgba(0,0,0,0.5); /* 滚动时滚动条把手颜色 */
        }

        #messages:hover::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.5); /* 鼠标悬停在滚动区域时滚动条把手颜色 */
        }
        .sent, .received {
            margin-bottom: 8px;
            padding: 10px;
            border-radius: 10px;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background); /* Adapt to theme background */
        }
        .sent {
            /* Additional styles for sent messages if needed */
        }
        .received {
            /* Additional styles for received messages if needed */
        }
        .message-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .nickname {
            font-weight: bold;
            margin-right: 10px;
        }
        .timestamp {
            color: #888;
            font-size: 0.8em;
        }
        .message-content {
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <div id="messages">
        ${messages}
    </div>
    <div id="inputArea">
        <input type="text" id="messageInput" placeholder="Type a message...">
    </div>
    <script>
        const vscode = acquireVsCodeApi();

        window.onload = () => {
            const messagesContainer = document.getElementById('messages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };

        document.getElementById('messageInput').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const message = document.getElementById('messageInput').value;
                if (message === '') {
                    return;
                }
                vscode.postMessage({
                    command: 'sendMessage',
                    content: message,
                    receiver_id: ${person.id},
                    isGroup: ${person.isGroup}
                });
                document.getElementById('messageInput').value = ''; // 清空输入框
                sendIcon.style.fill = 'var(--vscode-button-foreground)';
            }
        });
    </script>
</body>
</html>
`
}
