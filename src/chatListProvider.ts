import * as vscode from "vscode";
import { GetChatList, GetRoomPerson } from "./server/chat";

export class ChatListProvider implements vscode.TreeDataProvider<ChatItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ChatItem | undefined | void> = new vscode.EventEmitter<ChatItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ChatItem | undefined | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: ChatItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChatItem): Thenable<ChatItem[]> {

        if (element) {
            if (element.isGroup) {
                try {
                    const chatItems = GetRoomPerson("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjMsImFjY291bnQiOiJ1c2VyMiJ9.Vgz3-tUQYVVwe_QvvT8sdW9zSalVfcLBpygeHKqrhnc", element.id);
                    return chatItems;
                } catch (error) {
                    console.error(error);
                    return Promise.resolve([]);
                }
            } else {
                return Promise.resolve([]);
            }
        } else {
            try {
                const chatItems = GetChatList("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjMsImFjY291bnQiOiJ1c2VyMiJ9.Vgz3-tUQYVVwe_QvvT8sdW9zSalVfcLBpygeHKqrhnc");
                return chatItems;
            } catch (error) {
                console.error(error);
                return Promise.resolve([]);
            }
        }
    }


    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export class ChatItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly id: string,
        public readonly isGroup: boolean,
    ) {
        super(label);
        let iconColor = undefined
        let online = true;

        if (online) {
            iconColor = new vscode.ThemeColor('terminal.ansiGreen');
        }

        this.iconPath = new vscode.ThemeIcon(isGroup ? 'organization' : 'person', iconColor);
        this.collapsibleState = isGroup ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;

        this.contextValue = isGroup ? 'group' : 'person'; // 新增 contextValue 区分个人和群组

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
