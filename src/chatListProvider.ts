import * as vscode from "vscode";
import { status, token } from "./globals";
import { GetChatList, GetRoomPerson } from "./server/chat";
import { AddPerson } from "./server/user";

export class ChatListProvider implements vscode.TreeDataProvider<ChatItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ChatItem | undefined | void> = new vscode.EventEmitter<ChatItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ChatItem | undefined | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: ChatItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChatItem): Thenable<ChatItem[]> {

        if (!status) {
            return Promise.resolve([new LoginPromptItem()] as ChatItem[]);
        }
        try {
            // 示例代码，根据您的逻辑调整
            if (element && element.isGroup) {
                // 加载群组成员
                const chatItems = GetRoomPerson(token, element.id).then(items =>
                    items.map(item => new ChatItem(item.label, item.id, item.isGroup, item.itemType))
                );
                return chatItems;
            } else {
                const chatItems = GetChatList(token).then(items =>
                    items.map(item => new ChatItem(item.label, item.id, item.isGroup, item.isGroup ? 'group' : 'person'))
                );
                return chatItems;
            }
        } catch (error) {
            vscode.window.showErrorMessage('Error fetching chat list')
            console.error(error);
            return Promise.resolve([]);
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    async CopyItemID(item: ChatItem) {
        let uid = item.id;
        if (item.itemType === 'person') {
            uid = item.id.split('-')[1];
        }
        await vscode.env.clipboard.writeText(uid);
        if (item.isGroup) {
            vscode.window.showInformationMessage('Room ID: ' + uid + ' copied to clipboard');
        } else {
            vscode.window.showInformationMessage('User ID: ' + uid + ' copied to clipboard');
        }
    }

    async AddPerson(item: ChatItem) {
        let uid = item.id;
        if (item.itemType === 'person') {
            uid = item.id.split('-')[1];
        }
        AddPerson(token, parseInt(uid)).then(() => {
            vscode.window.showInformationMessage('Successfully added person');
        }).catch((error) => {
            vscode.window.showErrorMessage('Error adding person');
            console.error(error);
        });
    }
}

export class ChatItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly id: string,
        public readonly isGroup: boolean,
        public readonly itemType: 'group' | 'member' | 'person'
    ) {
        super(label);
        let iconColor = undefined
        let online = true;

        if (online) {
            iconColor = new vscode.ThemeColor('terminal.ansiGreen');
        }

        this.iconPath = new vscode.ThemeIcon(isGroup ? 'organization' : 'person', iconColor);
        this.collapsibleState = isGroup ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;

        this.contextValue = itemType

        this.tooltip = `${label} (${online ? "Online" : "Offline"})`;


        if (!isGroup) {
            this.command = {
                command: 'chatcode-hub.selectPerson',
                title: '',
                arguments: [this]
            };
        }
    }
}

export class LoginPromptItem extends vscode.TreeItem {
    constructor() {
        super("Please login to view chats", vscode.TreeItemCollapsibleState.None);
        this.command = {
            command: 'chatcode-hub.login',
            title: "Login",
            arguments: []
        };
    }
}
