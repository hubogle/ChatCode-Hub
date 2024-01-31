import * as vscode from 'vscode';
import { ChatItem, ChatListProvider } from "./chatListProvider";
import { MessageViewProvider } from "./chatWebProvider";
import { manager } from "./manage";

export function activate(context: vscode.ExtensionContext) {
	const chatListProvider = new ChatListProvider();
	const messageViewProvider = new MessageViewProvider(context.extensionUri);

	vscode.window.createTreeView('personList', { treeDataProvider: chatListProvider });

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('messageList', messageViewProvider),
		vscode.commands.registerCommand('chatcode-hub.selectPerson', (person: ChatItem) => {
			messageViewProvider.showMessagesForPerson(person);
		}),
		vscode.commands.registerCommand("chatcode-hub.login", () => manager.login()),
	);

}

export function deactivate() { }
