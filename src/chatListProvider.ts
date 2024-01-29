import * as vscode from "vscode";

export class ChatListProvider {
    private context: vscode.ExtensionContext = {} as vscode.ExtensionContext;

    public initialize(context: vscode.ExtensionContext): void {
        this.context = context;
    }
}

export const chatListProvider: ChatListProvider = new ChatListProvider();
