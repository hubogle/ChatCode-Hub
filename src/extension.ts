import * as vscode from 'vscode';
import { Server } from 'ws';
import CreateServer from './server/server';
import { TodoListWebView } from './view/view';
import { manager } from "./manage";


let wss: Server | null = null;

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('chatcode-hub.createServer', async () => {
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
			CreateServer(parseInt(port, 10));
		}
	});

	const todolistWebview = new TodoListWebView(context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(TodoListWebView.viewId, todolistWebview),
		vscode.commands.registerCommand("chatcode-hub.login", () => manager.login()),
	)
	context.subscriptions.push(disposable);
}

export function deactivate() {
	// 关闭 WebSocket 服务器
	if (wss) {
		wss.close();
		wss = null;
	}
}
