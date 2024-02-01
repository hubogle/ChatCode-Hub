import * as vscode from 'vscode';
import { ChatItem } from './chatListProvider';
import { token, uid } from "./globals";
import { ChatMessageItem, GetChatMessage } from "./server/chat";
import { WsClient } from './ws';

export class MessageViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly extensionUri: vscode.Uri, private readonly wsClient: WsClient) { }


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
            this._view.webview.html = this.getWebviewContent(person, chatMessageList);

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

    private getWebviewContent(person: ChatItem, chatMessageList: ChatMessageItem[]): string {
        let messages = '';
        chatMessageList.forEach(msg => {
            const messageClass = msg.type === 1 ? "received" : "sent";
            messages += `
            <div class="${messageClass}">
                <div class="message-header">
                    <span class="nickname">${msg.nickname}</span>
                    <span class="timestamp">${new Date(msg.send_at).toLocaleString()}</span>
                </div>
                <div class="message-content">${msg.content}</div>
            </div>
        `;
        });

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
            padding: 10px;
            overflow-y: auto;
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
`;
    }

}
