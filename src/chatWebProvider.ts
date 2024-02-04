import * as vscode from 'vscode';
import { ChatItem } from './chatListProvider';
import { token, uid } from "./globals";
import { ChatMessageItem, GetChatMessageList } from "./server/chat";
import { WsClient } from './ws';

export class MessageViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private currentMessages: ChatMessageItem[] = [];
    private person: ChatItem;
    private messageListenerAdded: boolean = false; // 是否已经添加了消息监听器
    private notice: boolean = false; // 是否通知


    constructor(private readonly extensionUri: vscode.Uri, private readonly wsClient: WsClient) {
        this.wsClient.onMessageReceived(this.handleReceivedMessage.bind(this));
        this.person = new ChatItem("", "", false);
    }

    private checkActive() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || activeEditor.document.languageId !== 'your-plugin-language-id') {
            return false;
        } else {
            return true;
        }
    }

    private handleReceivedMessage(data: any) {
        const message = JSON.parse(data);
        console.log(this.checkActive());
        if (this.notice) {
            vscode.window.showInformationMessage(message.nickname + " : " + message.content);
        }
        this.currentMessages.push(message);
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

        // 监听视图的可见性变化
        webviewView.onDidChangeVisibility(() => {
            if (!this._view?.visible) {
                this.notice = true;
            } else {
                this.notice = false;
            }
        });
    }

    public async showMessagesForPerson(person: ChatItem) {
        if (this._view) {
            const chatMessageList = await GetChatMessageList(token, person.id, person.isGroup ? 2 : 1)
            this.currentMessages = chatMessageList; // 更新当前消息列表
            this.person = person; // 更新当前聊天对象
            this._view.webview.html = this.generateWebviewHtml();

            if (!this.messageListenerAdded) {
                this._view.webview.onDidReceiveMessage(message => {
                    if (message.command === 'sendMessage') {
                        this.wsClient.sendMessage(
                            String(message.content),
                            message.receiver_id,
                            uid,
                            message.isGroup
                        );
                    }
                });
                this.messageListenerAdded = true; // 标记监听器已添加
            }
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
            font-size: var(--vscode-editor-font-size);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-sideBar-background);
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
            overflow: hidden;
        }
        #inputArea {
            margin-top: auto; /* Pushes the input area to the bottom */
            padding: 10px 20px 10px 10px;
            background-color: var(--vscode-sideBar-background);
        }
        #inputArea input {
            width: 100%;
            padding: 5px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: var(--vscode-input-borderRadius);
            height: 25px;
        }
        #inputArea input:focus {
            border-color: var(--vscode-focusBorder);
            outline: none;
        }
        #messages {
            overflow-y: auto;
            flex-grow: 1;
            padding: 10px;
            padding: 5px;
        }

        #messages::-webkit-scrollbar {
            width: 5px;
        }

        #messages::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.2);
            border-radius: 4px;
        }

        #messages::-webkit-scrollbar-thumb:hover {
            background-color: rgba(0,0,0,0.4);
        }

        #messages:hover::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.5);
        }
        .sent, .received {
            margin-bottom: 4px;
            padding: 8px;
            border-radius: 5px;
            font-size: 0.8rem;
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
            align-items: center;
            margin-bottom: 3px;
        }
        .nickname, .timestamp {
            margin: 0;
            padding: 0;
            line-height: 1.2;
        }
        .nickname {
            font-weight: bold;
        }
        .timestamp {
            color: #888;
            font-size: 0.7em;
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
                document.getElementById('messageInput').value = '';
                sendIcon.style.fill = 'var(--vscode-button-foreground)';
            }
        });
    </script>
</body>
</html>
`
}
