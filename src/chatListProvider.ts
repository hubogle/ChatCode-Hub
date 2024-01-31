import * as vscode from "vscode";

export class ChatListProvider implements vscode.TreeDataProvider<ChatItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ChatItem | undefined | void> = new vscode.EventEmitter<ChatItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ChatItem | undefined | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: ChatItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChatItem): Thenable<ChatItem[]> {
        if (element) {
            if (element.isGroup) {
                return Promise.resolve([
                    new ChatItem("Member 1", "member1-id", true, false),
                    new ChatItem("Member 2", "member2-id", false, false),
                ]);
            } else {
                return Promise.resolve([]);
            }
        } else {
            return Promise.resolve([
                new ChatItem("Bob", "bob-id", false, false),
                new ChatItem("Alice", "alice-id", true, false),
                new ChatItem("Group Chat", "group1-id", false, true),
            ]);
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
        public readonly online: boolean,
        public readonly isGroup: boolean,
    ) {
        super(label);
        let iconColor = undefined

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
