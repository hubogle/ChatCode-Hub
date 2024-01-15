import * as vscode from 'vscode';
import WebSocket, { Server } from 'ws';


let wss: Server | null = null;

export function activate(context: vscode.ExtensionContext) {
	// 注册聊天窗口命令
	let disposable = vscode.commands.registerCommand('chatcode-hub.openChat', async () => {
		// 提示用户输入 IP 地址和端口，提供默认值
		const address = await vscode.window.showInputBox({
			prompt: '请输入服务器的 IP 地址和端口',
			value: '127.0.0.1:8080'
		});
		if (!address) {
			return;
		}

		// 创建并显示一个新的聊天窗口
		const panel = vscode.window.createWebviewPanel(
			'chat', // 标识符
			'Chat', // 标题
			vscode.ViewColumn.One, // 编辑器列显示窗口
			{
				enableScripts: true
			} // Webview选项
		);

		// 设置 HTML 内容
		panel.webview.html = getWebviewContent();

		// 连接到服务器
		const ws = new WebSocket(`ws://${address}`);

		ws.on('error', (error) => {
			vscode.window.showErrorMessage('连接服务器失败');
		});

		// 处理来自 webview 的消息
		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'send':
						// 将消息发送到服务器
						console.log(message.text);
						ws.send(message.text);
						return;
				}
			},
			undefined,
			context.subscriptions
		);

		// 处理来自服务器的消息
		ws.on('message', (message) => {
			// 将消息发送到 webview
			panel.webview.postMessage({ command: 'receive', text: message });
		});
	});

	let server = vscode.commands.registerCommand('chatcode-hub.createServer', async () => {
		// 提示用户输入端口号
		const port = await vscode.window.showInputBox({
			placeHolder: 'Enter a port number (e.g., 8080)',
			prompt: 'Please enter the port number to create a server on 0.0.0.0',
			value: "8080",
			validateInput: text => {
				return isNaN(parseInt(text, 10)) ? 'Please enter a valid number' : null;
			}
		});

		if (port) {
			createServer(parseInt(port, 10));
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(server);
}

function createServer(port: number) {
	// 创建和启动 WebSocket 服务器
	wss = new Server({ host: '0.0.0.0', port: port });

	wss.on('connection', ws => {
		ws.on('message', message => {
			// 分发消息到所有连接的客户端
			wss?.clients.forEach(client => {
				client.send(message.toString());
			});
		});
	});

	vscode.window.showInformationMessage(`Server created on port ${port}`);
}

function getWebviewContent() {
	// 更新后的 HTML 内容，包括更好的样式和功能
	return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chat</title>
                <style>
                    body, html {
                        height: 100%;
                        margin: 0;
                        display: flex;
                        flex-direction: column;
                        font-family: Arial, sans-serif;
                    }
                    #chat {
                        flex-grow: 1;
                        overflow-y: auto;
                        padding: 10px;
                        background-color: #f0f0f0;
                    }
                    .message {
                        padding: 5px 10px;
                        border-radius: 5px;
                        margin-bottom: 5px;
                        background-color: #d8ebf9;
                    }
                    #inputArea {
                        display: flex;
                        margin: 10px;
                        padding: 5px;
                        background-color: #ffffff;
                        box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.1);
                    }
                    #messageInput {
                        flex-grow: 1;
                        margin-right: 10px;
                        padding: 8px;
                        border: 1px solid #cccccc;
                        border-radius: 4px;
                    }
                    #sendButton {
                        padding: 8px 15px;
                        background-color: #0078d7;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    #sendButton:hover {
                        background-color: #0056a3;
                    }
                </style>
            </head>
            <body>
                <div id="chat"></div>
                <div id="inputArea">
                    <input type="text" id="messageInput" placeholder="Enter message"/>
                    <button id="sendButton">Send</button>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();

                    document.getElementById('sendButton').addEventListener('click', () => {
                        const message = document.getElementById('messageInput').value;
                        vscode.postMessage({
                            command: 'send',
                            text: message
                        });
						console.log('aaaaaa');
                        addMessageToChat(message);
                        document.getElementById('messageInput').value = ''; // 清空输入框
                    });

                    function addMessageToChat(message) {
                        const chat = document.getElementById('chat');
                        const messageElement = document.createElement('div');
                        messageElement.classList.add('message');
                        messageElement.textContent = message;
                        chat.appendChild(messageElement);
                    }

                    // 这里可以添加更多的 JavaScript 代码，比如接收消息逻辑
                </script>
            </body>
            </html>`;
}


function sendMessage(text: string) {
	// 在这里实现消息发送逻辑
	// 例如，可以调用外部服务或 WebSocket 等
}

export function deactivate() {
	// 关闭 WebSocket 服务器
	if (wss) {
		wss.close();
		wss = null;
	}
}
